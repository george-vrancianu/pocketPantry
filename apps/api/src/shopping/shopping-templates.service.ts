import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, eq, inArray } from 'drizzle-orm';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import { normalizeName } from '../catalog/normalize';
import { ApiException } from '../common/api-exception';
import { DATABASE } from '../database/database.constants';
import type { Database, Executor, Tx } from '../database/database.types';
import {
  batches,
  ingredients,
  shoppingItems,
  shoppingLists,
  shoppingTemplateLines,
  shoppingTemplates,
} from '../database/schema';
import { lockFamilies } from '../family/family-locks';
import { SettingsService } from '../settings/settings.service';
import { unexpiredBatch, utcToday } from './batch-presence';
import { loadIngredientPlacements } from './ingredient-placement';
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

const notFound = () => new ApiException(404, 'shopping.template_not_found');
const tooManyLines = () =>
  new ApiException(400, 'shopping.template_too_many_lines', {
    max: MAX_TEMPLATE_LINES,
  });

/**
 * Shopping Templates are Family data: any Member reads and edits them. Writes
 * lock the Family row first (as every Family-level mutation does), which
 * serialises the 50-Template cap.
 */
@Injectable()
export class ShoppingTemplatesService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly settings: SettingsService,
  ) {}

  async list(memberId: string): Promise<{ templates: TemplateSummaryView[] }> {
    const familyId = await this.settings.familyIdOf(memberId);
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
    today?: string,
  ): Promise<TemplateView> {
    const familyId = await this.settings.familyIdOf(memberId);
    return this.view(this.database, familyId, id, locale, today);
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
    const familyId = await this.settings.familyIdOf(memberId);
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

  private async lockFamily(tx: Tx, memberId: string): Promise<string> {
    const familyId = await this.settings.familyIdOf(memberId);
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
      throw new ApiException(409, 'shopping.template_limit_reached', {
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
    today?: string,
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
        quantity: shoppingTemplateLines.quantity,
        unit: shoppingTemplateLines.unit,
      })
      .from(shoppingTemplateLines)
      .where(eq(shoppingTemplateLines.templateId, id))
      .orderBy(asc(shoppingTemplateLines.position));

    const ingredientIds = rows.flatMap((row) =>
      row.ingredientId ? [row.ingredientId] : [],
    );
    const placements = await loadIngredientPlacements(
      executor,
      locale,
      ingredientIds,
    );
    const present = await this.presentIngredients(
      executor,
      familyId,
      ingredientIds,
      today,
    );

    const lines: TemplateLineView[] = rows.map((row) => {
      const placement = row.ingredientId
        ? placements.get(row.ingredientId)
        : undefined;
      return {
        id: row.id,
        ingredientId: row.ingredientId,
        name:
          row.ingredientId !== null
            ? (placement?.name ?? '')
            : (row.typedName ?? ''),
        quantity: row.quantity === null ? null : Number(row.quantity),
        unit: row.unit,
        unmatched: row.ingredientId === null,
        inPantry: row.ingredientId !== null && present.has(row.ingredientId),
        aisle: placement?.aisle ?? null,
      };
    });
    return { id: template.id, name: template.name, lines };
  }

  /** Ingredients the Family holds an unexpired Batch of (quantity is ignored); `localToday` is the Member's date, default the server's UTC date. */
  private async presentIngredients(
    executor: Executor,
    familyId: string,
    ingredientIds: string[],
    localToday?: string,
  ): Promise<Set<string>> {
    if (ingredientIds.length === 0) return new Set();
    const today = localToday ?? utcToday();
    const rows = await executor
      .selectDistinct({ id: batches.ingredientId })
      .from(batches)
      .where(
        and(
          eq(batches.familyId, familyId),
          inArray(batches.ingredientId, ingredientIds),
          unexpiredBatch(today),
        ),
      );
    return new Set(rows.flatMap((row) => (row.id ? [row.id] : [])));
  }
}
