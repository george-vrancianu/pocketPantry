import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { loadDisplayNames } from '../catalog/display-names';
import { normalizeName } from '../catalog/normalize';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor, Tx } from '../database/database.types';
import {
  aisles,
  batches,
  ingredients,
  leafCategories,
  parentCategories,
  shoppingItems,
  shoppingLists,
  shoppingTemplateLines,
  shoppingTemplates,
  user,
} from '../database/schema';
import { lockFamilies } from '../family/family-locks';
import {
  MAX_TEMPLATE_LINES,
  MAX_TEMPLATES_PER_FAMILY,
  type CreateTemplateBody,
  type TemplateLineBody,
  type TemplateLineView,
  type TemplateSummaryView,
  type TemplateView,
  type UpdateTemplateBody,
} from './shopping-templates.schemas';

const notFound = () => new ApiException(404, 'shopping_template.not_found');
const tooManyLines = () =>
  new ApiException(400, 'shopping_template.too_many_lines', {
    max: MAX_TEMPLATE_LINES,
  });

/**
 * Shopping Templates are Family data: any Member reads and edits them. Writes
 * lock the Family row first (as every Family-level mutation does), which
 * serialises the 50-Template cap.
 */
@Injectable()
export class ShoppingTemplatesService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async list(memberId: string): Promise<{ templates: TemplateSummaryView[] }> {
    const familyId = await this.familyOf(this.database, memberId);
    const rows = await this.database
      .select({
        id: shoppingTemplates.id,
        name: shoppingTemplates.name,
        lineCount: count(shoppingTemplateLines.id),
      })
      .from(shoppingTemplates)
      .leftJoin(
        shoppingTemplateLines,
        eq(shoppingTemplateLines.templateId, shoppingTemplates.id),
      )
      .where(eq(shoppingTemplates.familyId, familyId))
      .groupBy(shoppingTemplates.id)
      .orderBy(asc(shoppingTemplates.createdAt), asc(shoppingTemplates.id));
    return { templates: rows };
  }

  async get(
    memberId: string,
    id: string,
    locale: CatalogLocale,
  ): Promise<TemplateView> {
    const familyId = await this.familyOf(this.database, memberId);
    return this.view(this.database, familyId, id, locale);
  }

  async create(
    memberId: string,
    body: CreateTemplateBody,
    locale: CatalogLocale,
  ): Promise<TemplateView> {
    if (body.lines.length > MAX_TEMPLATE_LINES) throw tooManyLines();
    return this.database.transaction(async (tx) => {
      const familyId = await this.lockFamily(tx, memberId);
      const id = await this.insertTemplate(tx, familyId, body.name);
      await this.insertLines(tx, id, body.lines);
      return this.view(tx, familyId, id, locale);
    });
  }

  /** Copies the active list's items, checked or not, without their checked state. */
  async createFromList(
    memberId: string,
    name: string,
    locale: CatalogLocale,
  ): Promise<TemplateView> {
    return this.database.transaction(async (tx) => {
      const familyId = await this.lockFamily(tx, memberId);
      const items = await tx
        .select({
          ingredientId: shoppingItems.ingredientId,
          name: shoppingItems.name,
          quantity: shoppingItems.quantity,
          unit: shoppingItems.unit,
        })
        .from(shoppingItems)
        .innerJoin(shoppingLists, eq(shoppingLists.id, shoppingItems.listId))
        .where(
          and(
            eq(shoppingLists.familyId, familyId),
            eq(shoppingLists.status, 'active'),
          ),
        )
        .orderBy(asc(shoppingItems.createdAt), asc(shoppingItems.id));
      if (items.length > MAX_TEMPLATE_LINES) throw tooManyLines();

      const id = await this.insertTemplate(tx, familyId, name);
      await this.insertLines(
        tx,
        id,
        items.map((item): TemplateLineBody => {
          const shape = {
            ...(item.quantity !== null && { quantity: Number(item.quantity) }),
            ...(item.unit !== null && { unit: item.unit }),
          };
          return item.ingredientId !== null
            ? { ingredientId: item.ingredientId, ...shape }
            : { name: item.name ?? '', ...shape };
        }),
      );
      return this.view(tx, familyId, id, locale);
    });
  }

  async update(
    memberId: string,
    id: string,
    body: UpdateTemplateBody,
    locale: CatalogLocale,
  ): Promise<TemplateView> {
    if (body.lines && body.lines.length > MAX_TEMPLATE_LINES) {
      throw tooManyLines();
    }
    return this.database.transaction(async (tx) => {
      const familyId = await this.lockFamily(tx, memberId);
      const [existing] = await tx
        .select({ id: shoppingTemplates.id })
        .from(shoppingTemplates)
        .where(
          and(
            eq(shoppingTemplates.id, id),
            eq(shoppingTemplates.familyId, familyId),
          ),
        );
      if (!existing) throw notFound();
      await tx
        .update(shoppingTemplates)
        .set({ ...(body.name !== undefined && { name: body.name }) })
        .where(eq(shoppingTemplates.id, id));
      if (body.lines) {
        await tx
          .delete(shoppingTemplateLines)
          .where(eq(shoppingTemplateLines.templateId, id));
        await this.insertLines(tx, id, body.lines);
      }
      return this.view(tx, familyId, id, locale);
    });
  }

  async remove(memberId: string, id: string): Promise<void> {
    const familyId = await this.familyOf(this.database, memberId);
    const removed = await this.database
      .delete(shoppingTemplates)
      .where(
        and(
          eq(shoppingTemplates.id, id),
          eq(shoppingTemplates.familyId, familyId),
        ),
      )
      .returning({ id: shoppingTemplates.id });
    if (removed.length === 0) throw notFound();
  }

  private async familyOf(executor: Executor, memberId: string) {
    const [member] = await executor
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.id, memberId))
      .limit(1);
    if (!member) throw new ApiException(401, 'auth.unauthenticated');
    return member.familyId;
  }

  private async lockFamily(tx: Tx, memberId: string): Promise<string> {
    const familyId = await this.familyOf(tx, memberId);
    await lockFamilies(tx, [familyId]);
    return familyId;
  }

  private async insertTemplate(
    tx: Tx,
    familyId: string,
    name: string,
  ): Promise<string> {
    const [{ total }] = await tx
      .select({ total: count() })
      .from(shoppingTemplates)
      .where(eq(shoppingTemplates.familyId, familyId));
    if (total >= MAX_TEMPLATES_PER_FAMILY) {
      throw new ApiException(409, 'shopping_template.limit_reached', {
        max: MAX_TEMPLATES_PER_FAMILY,
      });
    }
    const [row] = await tx
      .insert(shoppingTemplates)
      .values({ familyId, name })
      .returning({ id: shoppingTemplates.id });
    return row.id;
  }

  private async insertLines(
    tx: Tx,
    templateId: string,
    lines: TemplateLineBody[],
  ): Promise<void> {
    if (lines.length === 0) return;
    const ids = [
      ...new Set(
        lines.flatMap((line) => (line.ingredientId ? [line.ingredientId] : [])),
      ),
    ];
    if (ids.length > 0) {
      const found = await tx
        .select({ id: ingredients.id })
        .from(ingredients)
        .where(inArray(ingredients.id, ids));
      if (found.length !== ids.length) {
        throw new ApiException(404, 'shopping.ingredient_not_found');
      }
    }
    await tx.insert(shoppingTemplateLines).values(
      lines.map((line, position) => {
        const name = (line.name ?? '').trim();
        const normalizedName = normalizeName(name);
        if (line.ingredientId === undefined && !normalizedName) {
          throw new ApiException(400, 'validation_failed');
        }
        return {
          templateId,
          position,
          ingredientId: line.ingredientId ?? null,
          name: line.ingredientId === undefined ? name : null,
          normalizedName:
            line.ingredientId === undefined ? normalizedName : null,
          quantity: line.quantity === undefined ? null : String(line.quantity),
          unit: line.unit ?? null,
        };
      }),
    );
  }

  private async view(
    executor: Executor,
    familyId: string,
    id: string,
    locale: CatalogLocale,
  ): Promise<TemplateView> {
    const [template] = await executor
      .select({ id: shoppingTemplates.id, name: shoppingTemplates.name })
      .from(shoppingTemplates)
      .where(
        and(
          eq(shoppingTemplates.id, id),
          eq(shoppingTemplates.familyId, familyId),
        ),
      );
    if (!template) throw notFound();

    const rows = await executor
      .select({
        id: shoppingTemplateLines.id,
        ingredientId: shoppingTemplateLines.ingredientId,
        typedName: shoppingTemplateLines.name,
        canonicalName: ingredients.name,
        quantity: shoppingTemplateLines.quantity,
        unit: shoppingTemplateLines.unit,
        aisleId: aisles.id,
        aisleName: aisles.name,
        aisleSortOrder: aisles.sortOrder,
      })
      .from(shoppingTemplateLines)
      .leftJoin(
        ingredients,
        eq(shoppingTemplateLines.ingredientId, ingredients.id),
      )
      .leftJoin(
        leafCategories,
        eq(ingredients.leafCategoryId, leafCategories.id),
      )
      .leftJoin(
        parentCategories,
        eq(leafCategories.parentId, parentCategories.id),
      )
      .leftJoin(aisles, eq(parentCategories.aisleId, aisles.id))
      .where(eq(shoppingTemplateLines.templateId, id))
      .orderBy(asc(shoppingTemplateLines.position));

    const { pick: display } = await loadDisplayNames(
      executor,
      locale,
      rows
        .flatMap((row) => [row.ingredientId, row.aisleId])
        .filter((entityId) => entityId !== null),
    );
    const present = await this.presentIngredients(
      executor,
      familyId,
      rows.flatMap((row) => (row.ingredientId ? [row.ingredientId] : [])),
    );

    const lines: TemplateLineView[] = rows.map((row) => ({
      id: row.id,
      ingredientId: row.ingredientId,
      name:
        row.ingredientId !== null
          ? display(
              'ingredient',
              row.ingredientId,
              row.canonicalName ?? row.typedName ?? '',
            )
          : (row.typedName ?? ''),
      quantity: row.quantity === null ? null : Number(row.quantity),
      unit: row.unit,
      unmatched: row.ingredientId === null,
      inPantry: row.ingredientId !== null && present.has(row.ingredientId),
      aisle:
        row.aisleId !== null && row.aisleName !== null
          ? {
              id: row.aisleId,
              name: display('aisle', row.aisleId, row.aisleName),
              sortOrder: row.aisleSortOrder ?? 0,
            }
          : null,
    }));
    return { id: template.id, name: template.name, lines };
  }

  /** Ingredients the Family holds an unexpired Batch of (quantity is ignored). */
  private async presentIngredients(
    executor: Executor,
    familyId: string,
    ingredientIds: string[],
  ): Promise<Set<string>> {
    if (ingredientIds.length === 0) return new Set();
    const today = new Date().toISOString().slice(0, 10);
    const rows = await executor
      .selectDistinct({ id: batches.ingredientId })
      .from(batches)
      .where(
        and(
          eq(batches.familyId, familyId),
          inArray(batches.ingredientId, ingredientIds),
          or(
            isNull(batches.expiryDate),
            sql`${batches.expiryDate} >= ${today}`,
          ),
        ),
      );
    return new Set(rows.flatMap((row) => (row.id ? [row.id] : [])));
  }
}
