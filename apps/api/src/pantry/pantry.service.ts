import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { resolveCatalogDefaults } from '../catalog/catalog-defaults';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { loadDisplayNames } from '../catalog/display-names';
import { seedId } from '../catalog/seed/seed-catalog';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  batches,
  ingredients,
  leafCategories,
  parentCategories,
  user,
} from '../database/schema';
import type { BatchView, CreateBatchBody } from './pantry.schemas';

const TOP_LEVEL_OTHER_PARENT_ID = seedId.parent('other');

type BatchRow = typeof batches.$inferSelect;

/** `from` is a YYYY-MM-DD date; the result is that date plus `days`. */
function addDays(from: string, days: number): string {
  const result = new Date(Date.parse(`${from}T00:00:00Z`) + days * 86_400_000);
  return result.toISOString().slice(0, 10);
}

@Injectable()
export class PantryService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  /** The Family's Batches, soonest expiry first; Batches without an expiry come last. */
  async list(memberId: string, locale: CatalogLocale): Promise<BatchView[]> {
    const familyId = await this.familyIdOf(memberId);
    const rows = await this.database
      .select()
      .from(batches)
      .where(eq(batches.familyId, familyId))
      .orderBy(
        sql`${batches.expiryDate} ASC NULLS LAST`,
        asc(batches.createdAt),
        asc(batches.id),
      );
    return this.toViews(rows, locale);
  }

  async create(
    memberId: string,
    body: CreateBatchBody,
    locale: CatalogLocale,
  ): Promise<BatchView> {
    return (await this.createMany(memberId, [body], locale))[0];
  }

  /** Adds all Batches in one statement, so a bad line saves nothing. Used by the Review screen. */
  async createMany(
    memberId: string,
    bodies: CreateBatchBody[],
    locale: CatalogLocale,
  ): Promise<BatchView[]> {
    const familyId = await this.familyIdOf(memberId);
    const values: (typeof batches.$inferInsert)[] = [];
    for (const body of bodies) {
      values.push(await this.toRow(familyId, body));
    }
    const rows = await this.database.insert(batches).values(values).returning();
    return this.toViews(rows, locale);
  }

  private async toRow(
    familyId: string,
    body: CreateBatchBody,
  ): Promise<typeof batches.$inferInsert> {
    const target = body.rawName
      ? await this.unmatchedTarget(body.parentCategoryId)
      : await this.matchedTarget(body.ingredientId as string);

    const defaults = resolveCatalogDefaults(target.leaf, target.parent);
    const location = body.location ?? defaults.location;
    if (!location) throw new ApiException(400, 'pantry.location_required');
    const expiryDate =
      body.expiryDate !== undefined
        ? body.expiryDate
        : defaults.expiryDays === null
          ? null
          : addDays(
              body.today ?? new Date().toISOString().slice(0, 10),
              defaults.expiryDays,
            );

    return {
      familyId,
      ingredientId: target.ingredientId,
      leafCategoryId: target.leaf.id,
      unmatched: body.rawName !== undefined,
      rawName: body.rawName ?? null,
      quantity: body.quantity ?? null,
      unit: body.unit ?? null,
      location,
      expiryDate,
      productDescription: body.productDescription || null,
    };
  }

  private async familyIdOf(memberId: string): Promise<string> {
    const [self] = await this.database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.id, memberId))
      .limit(1);
    if (!self) throw new ApiException(401, 'auth.unauthenticated');
    return self.familyId;
  }

  private async matchedTarget(ingredientId: string) {
    const [row] = await this.database
      .select({
        leaf: leafCategories,
        parent: parentCategories,
      })
      .from(ingredients)
      .innerJoin(
        leafCategories,
        eq(ingredients.leafCategoryId, leafCategories.id),
      )
      .innerJoin(
        parentCategories,
        eq(leafCategories.parentId, parentCategories.id),
      )
      .where(eq(ingredients.id, ingredientId))
      .limit(1);
    if (!row) throw new ApiException(404, 'pantry.ingredient_not_found');
    return { ingredientId, leaf: row.leaf, parent: row.parent };
  }

  /**
   * An Unmatched Batch goes under the Parent's `is_other` Leaf. With no Parent
   * given it uses the top-level "Other" Parent, identified by its fixed seed id
   * (slugs and ids never change once shipped), never by name.
   */
  private async unmatchedTarget(parentCategoryId: string | undefined) {
    const [parent] = await this.database
      .select()
      .from(parentCategories)
      .where(
        eq(parentCategories.id, parentCategoryId ?? TOP_LEVEL_OTHER_PARENT_ID),
      )
      .limit(1);
    if (!parent) throw new ApiException(404, 'pantry.category_not_found');

    const [leaf] = await this.database
      .select()
      .from(leafCategories)
      .where(
        and(
          eq(leafCategories.parentId, parent.id),
          eq(leafCategories.isOther, true),
        ),
      )
      .limit(1);
    if (!leaf) throw new ApiException(422, 'pantry.other_leaf_missing');
    return { ingredientId: null, leaf, parent };
  }

  private async toViews(
    rows: BatchRow[],
    locale: CatalogLocale,
  ): Promise<BatchView[]> {
    const ingredientRows = await this.database
      .select({ id: ingredients.id, name: ingredients.name })
      .from(ingredients)
      .where(
        inArray(
          ingredients.id,
          rows.flatMap((r) => (r.ingredientId ? [r.ingredientId] : [])),
        ),
      );
    const canonical = new Map(ingredientRows.map((i) => [i.id, i.name]));
    const names = await loadDisplayNames(
      this.database,
      locale,
      ingredientRows.map((i) => i.id),
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.ingredientId
        ? names.pick(
            'ingredient',
            row.ingredientId,
            canonical.get(row.ingredientId) ?? row.rawName ?? '',
          )
        : (row.rawName ?? ''),
      ingredientId: row.ingredientId,
      unmatched: row.unmatched,
      quantity: row.quantity,
      unit: row.unit,
      location: row.location,
      expiryDate: row.expiryDate,
      productDescription: row.productDescription,
      createdAt: row.createdAt,
    }));
  }
}
