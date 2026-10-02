import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import {
  type ExpiryOverride,
  resolveCatalogDefaults,
  resolveExpiryDays,
} from '../catalog/catalog-defaults';
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
} from '../database/schema';
import { SettingsService } from '../settings/settings.service';
import { recordUnmatched } from '../unmatched/unmatched-entries';
import type {
  BatchView,
  CreateBatchBody,
  UpdateBatchBody,
} from './pantry.schemas';

const TOP_LEVEL_OTHER_PARENT_ID = seedId.parent('other');

type BatchRow = typeof batches.$inferSelect;
type Leaf = typeof leafCategories.$inferSelect;
type Parent = typeof parentCategories.$inferSelect;
type Target = { ingredientId: string | null; leaf: Leaf; parent: Parent };

/** `from` is a YYYY-MM-DD date; the result is that date plus `days`. */
function addDays(from: string, days: number): string {
  const result = new Date(Date.parse(`${from}T00:00:00Z`) + days * 86_400_000);
  return result.toISOString().slice(0, 10);
}

@Injectable()
export class PantryService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
  ) {}

  /** The Family's Batches, soonest expiry first; Batches without an expiry come last. */
  async list(
    memberId: string,
    locale: CatalogLocale,
    today?: string,
  ): Promise<BatchView[]> {
    const familyId = await this.settings.familyIdOf(memberId);
    const rows = await this.database
      .select()
      .from(batches)
      .where(eq(batches.familyId, familyId))
      .orderBy(
        sql`${batches.expiryDate} ASC NULLS LAST`,
        asc(batches.createdAt),
        asc(batches.id),
      );
    return this.toViews(rows, locale, familyId, today);
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
    const familyId = await this.settings.familyIdOf(memberId);
    const overrides = await this.settings.expiryOverridesOf(familyId);
    const targets = await this.targetsFor(bodies);
    const values = bodies.map((body, index) => ({
      id: randomUUID(),
      ...this.toRow(familyId, body, targets[index], overrides),
    }));
    const rows = await this.database.transaction(async (tx) => {
      const inserted = await tx.insert(batches).values(values).returning();
      // The ids were generated above, so each entry is built from its own line.
      await recordUnmatched(
        tx,
        values.flatMap((value, index) =>
          value.unmatched
            ? [
                {
                  rawName: value.rawName ?? '',
                  locale,
                  source: bodies[index].source ?? 'manual',
                  batchId: value.id,
                },
              ]
            : [],
        ),
      );
      return inserted;
    });
    return this.toViews(rows, locale, familyId);
  }

  private toRow(
    familyId: string,
    body: CreateBatchBody,
    target: Target,
    overrides: ExpiryOverride[],
  ): typeof batches.$inferInsert {
    const defaults = resolveCatalogDefaults(target.leaf, target.parent);
    const expiryDays = resolveExpiryDays(target.leaf, target.parent, overrides);
    const location = body.location ?? defaults.location;
    if (!location) throw new ApiException(400, 'pantry.location_required');
    const expiryDate =
      body.expiryDate !== undefined
        ? body.expiryDate
        : expiryDays === null
          ? null
          : addDays(new Date().toISOString().slice(0, 10), expiryDays);

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

  async update(
    memberId: string,
    batchId: string,
    body: UpdateBatchBody,
    locale: CatalogLocale,
  ): Promise<BatchView> {
    const familyId = await this.settings.familyIdOf(memberId);
    const [current] = await this.database
      .select()
      .from(batches)
      .where(and(eq(batches.id, batchId), eq(batches.familyId, familyId)))
      .limit(1);
    if (!current) throw new ApiException(404, 'pantry.batch_not_found');

    const quantity =
      body.quantity !== undefined ? body.quantity : current.quantity;
    const unit = body.unit !== undefined ? body.unit : current.unit;
    if (quantity !== null && unit === null) {
      throw new ApiException(400, 'pantry.unit_required');
    }

    const [row] = await this.database
      .update(batches)
      .set({
        quantity,
        unit: quantity === null ? null : unit,
        location: body.location ?? current.location,
        expiryDate:
          body.expiryDate !== undefined ? body.expiryDate : current.expiryDate,
        productDescription:
          body.productDescription !== undefined
            ? body.productDescription || null
            : current.productDescription,
      })
      .where(and(eq(batches.id, batchId), eq(batches.familyId, familyId)))
      .returning();
    // Deleted by another Member between the read and the update.
    if (!row) throw new ApiException(404, 'pantry.batch_not_found');
    return (await this.toViews([row], locale, familyId))[0];
  }

  /** Another Family's Batch is indistinguishable from a missing one. */
  async remove(memberId: string, batchId: string): Promise<void> {
    const familyId = await this.settings.familyIdOf(memberId);
    const deleted = await this.database
      .delete(batches)
      .where(and(eq(batches.id, batchId), eq(batches.familyId, familyId)))
      .returning({ id: batches.id });
    if (deleted.length === 0) {
      throw new ApiException(404, 'pantry.batch_not_found');
    }
  }

  /**
   * The Leaf and Parent Category each body lands under, in body order, in at
   * most two queries however many bodies there are: matched bodies by their
   * Ingredient, Unmatched ones under their Parent's `is_other` Leaf. With no
   * Parent given an Unmatched body uses the top-level "Other" Parent,
   * identified by its fixed seed id (slugs and ids never change once shipped),
   * never by name.
   */
  private async targetsFor(bodies: CreateBatchBody[]): Promise<Target[]> {
    const parentIdOf = (body: CreateBatchBody) =>
      body.parentCategoryId ?? TOP_LEVEL_OTHER_PARENT_ID;
    const ingredientIds = [
      ...new Set(
        bodies.flatMap((b) => (b.rawName ? [] : [b.ingredientId as string])),
      ),
    ];
    const parentIds = [
      ...new Set(bodies.flatMap((b) => (b.rawName ? [parentIdOf(b)] : []))),
    ];

    const matched = new Map<string, { leaf: Leaf; parent: Parent }>();
    if (ingredientIds.length > 0) {
      const rows = await this.database
        .select({
          id: ingredients.id,
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
        .where(inArray(ingredients.id, ingredientIds));
      for (const row of rows) matched.set(row.id, row);
    }

    const parents = new Map<string, Parent>();
    const others = new Map<string, Leaf>();
    if (parentIds.length > 0) {
      const rows = await this.database
        .select({ parent: parentCategories, leaf: leafCategories })
        .from(parentCategories)
        .leftJoin(
          leafCategories,
          and(
            eq(leafCategories.parentId, parentCategories.id),
            eq(leafCategories.isOther, true),
          ),
        )
        .where(inArray(parentCategories.id, parentIds));
      for (const { parent, leaf } of rows) {
        parents.set(parent.id, parent);
        if (leaf) others.set(parent.id, leaf);
      }
    }

    return bodies.map((body) => {
      if (!body.rawName) {
        const row = matched.get(body.ingredientId as string);
        if (!row) throw new ApiException(404, 'pantry.ingredient_not_found');
        return { ingredientId: body.ingredientId as string, ...row };
      }
      const parent = parents.get(parentIdOf(body));
      if (!parent) throw new ApiException(404, 'pantry.category_not_found');
      const leaf = others.get(parent.id);
      if (!leaf) throw new ApiException(422, 'pantry.other_leaf_missing');
      return { ingredientId: null, leaf, parent };
    });
  }

  private async toViews(
    rows: BatchRow[],
    locale: CatalogLocale,
    familyId: string,
    today: string = new Date().toISOString().slice(0, 10),
  ): Promise<BatchView[]> {
    const threshold = await this.settings.staleThresholdOf(familyId);
    const latestSoon = addDays(today, threshold);
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
      expiringSoon: row.expiryDate !== null && row.expiryDate <= latestSoon,
      createdAt: row.createdAt,
    }));
  }
}
