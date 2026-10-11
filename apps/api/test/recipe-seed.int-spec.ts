import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { SEED_BASE_RECIPES } from '../src/catalog/seed/recipes/recipe-seed-data';
import { seedRecipes } from '../src/catalog/seed/recipes/seed-recipes';
import {
  SEED_CUISINES,
  SEED_EATING_MOMENTS,
  SEED_METHODS,
} from '../src/catalog/seed/recipes/registries';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  catalogTranslations,
  cuisines,
  eatingMoments,
  methods,
  recipeEatingMomentTranslations,
  recipeEatingMoments,
  recipeIngredientLines,
  recipeNutritionNoteTranslations,
  recipePairings,
  recipePairingTranslations,
  recipes,
  recipeSteps,
  recipeStepTranslations,
  recipeTips,
  recipeTipTranslations,
  recipeTranslations,
} from '../src/database/schema';
import { createTestApp } from './support/create-test-app';

jest.setTimeout(60_000);

class Rollback extends Error {}

describe('Recipe seed (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  const all = SEED_BASE_RECIPES.flatMap((base) => [base, ...base.variants]);
  const recipeIds = all.map((recipe) => seedId.recipe(recipe.slug));
  const omelette = SEED_BASE_RECIPES.find((b) => b.slug === 'omelette');

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
  });

  afterAll(async () => {
    await app.close();
  });

  const seededRecipes = () =>
    database.select().from(recipes).where(inArray(recipes.id, recipeIds));

  it('seeds the Eating Moments with English and Romanian names, in order', async () => {
    const rows = await database
      .select()
      .from(eatingMoments)
      .where(
        inArray(
          eatingMoments.id,
          SEED_EATING_MOMENTS.map((m) => seedId.eatingMoment(m.slug)),
        ),
      )
      .orderBy(eatingMoments.sortOrder);
    expect(rows.map((r) => r.name)).toEqual([
      'Morning',
      'Brunch',
      'Light lunch',
      'Before a workout',
      'After a workout',
      'Late evening / before bed',
      'Hot day',
      'Cold day',
    ]);
    const names = await database
      .select()
      .from(catalogTranslations)
      .where(
        and(
          eq(catalogTranslations.entityType, 'eating_moment'),
          inArray(
            catalogTranslations.entityId,
            rows.map((r) => r.id),
          ),
          eq(catalogTranslations.locale, 'ro'),
          eq(catalogTranslations.kind, 'name'),
        ),
      );
    expect(names.map((n) => n.value).sort()).toEqual(
      SEED_EATING_MOMENTS.map((m) => m.ro).sort(),
    );
  });

  it('seeds the Cuisines and Methods with names in en, ro and da', async () => {
    const cuisineRows = await database
      .select()
      .from(cuisines)
      .where(
        inArray(
          cuisines.id,
          SEED_CUISINES.map((c) => seedId.cuisine(c.slug)),
        ),
      );
    const methodRows = await database
      .select()
      .from(methods)
      .where(
        inArray(
          methods.id,
          SEED_METHODS.map((m) => seedId.method(m.slug)),
        ),
      );
    expect(cuisineRows).toHaveLength(SEED_CUISINES.length);
    expect(methodRows).toHaveLength(SEED_METHODS.length);
    const translated = await database
      .select({ n: sql<number>`count(*)::int` })
      .from(catalogTranslations)
      .where(
        and(
          inArray(catalogTranslations.entityId, [
            ...cuisineRows.map((r) => r.id),
            ...methodRows.map((r) => r.id),
          ]),
          eq(catalogTranslations.kind, 'name'),
        ),
      );
    expect(translated[0].n).toBe(
      (SEED_CUISINES.length + SEED_METHODS.length) * 3,
    );
  });

  it('seeds the Omelette base with its Cuisine and Method Variants', async () => {
    const [base] = await database
      .select()
      .from(recipes)
      .where(eq(recipes.id, seedId.recipe('omelette')));
    expect(base).toMatchObject({
      title: 'Omelette',
      parentId: null,
      familyId: null,
      cuisineId: null,
      methodId: null,
    });
    const variants = await database
      .select()
      .from(recipes)
      .where(eq(recipes.parentId, base.id));
    expect(variants).toHaveLength(omelette?.variants.length ?? -1);
    expect(
      variants.filter((v) => v.cuisineId !== null).length,
    ).toBeGreaterThanOrEqual(3);
    expect(
      variants.filter((v) => v.methodId !== null).length,
    ).toBeGreaterThanOrEqual(2);
    expect(variants.every((v) => v.familyId === null)).toBe(true);
  });

  it('resolves every seeded Ingredient Line to a Catalog Ingredient', async () => {
    const lines = await database
      .select()
      .from(recipeIngredientLines)
      .where(inArray(recipeIngredientLines.recipeId, recipeIds));
    const expected = all.reduce((n, r) => n + r.lines.length, 0);
    expect(lines).toHaveLength(expected);
    expect(lines.every((l) => l.ingredientId !== null)).toBe(true);
    expect(lines.every((l) => l.rawName === null)).toBe(true);
  });

  it('has English source text and Romanian translations for all Recipe text', async () => {
    const rows = await seededRecipes();
    expect(rows).toHaveLength(all.length);
    expect(rows.every((r) => r.title.trim() !== '')).toBe(true);

    const titles = await database
      .select()
      .from(recipeTranslations)
      .where(
        and(
          inArray(recipeTranslations.recipeId, recipeIds),
          eq(recipeTranslations.locale, 'ro'),
        ),
      );
    expect(titles).toHaveLength(all.length);

    const steps = await database
      .select({ id: recipeSteps.id })
      .from(recipeSteps)
      .where(inArray(recipeSteps.recipeId, recipeIds));
    const stepTexts = await database
      .select()
      .from(recipeStepTranslations)
      .where(
        and(
          inArray(
            recipeStepTranslations.stepId,
            steps.map((s) => s.id),
          ),
          eq(recipeStepTranslations.locale, 'ro'),
        ),
      );
    expect(stepTexts).toHaveLength(steps.length);

    const tips = await database
      .select({ id: recipeTips.id })
      .from(recipeTips)
      .where(inArray(recipeTips.recipeId, recipeIds));
    const tipTexts = await database
      .select()
      .from(recipeTipTranslations)
      .where(
        inArray(
          recipeTipTranslations.tipId,
          tips.map((t) => t.id),
        ),
      );
    expect(tipTexts).toHaveLength(tips.length);
    expect(tipTexts.every((t) => t.locale === 'ro' && t.text !== '')).toBe(
      true,
    );
  });

  it('gives the Omelette base Recipe-level Tips and a Step Tip on an existing step', async () => {
    const baseId = seedId.recipe('omelette');
    const tips = await database
      .select()
      .from(recipeTips)
      .where(eq(recipeTips.recipeId, baseId));
    expect(tips.filter((t) => t.stepId === null).length).toBeGreaterThanOrEqual(
      1,
    );
    const stepTips = tips.filter((t) => t.stepId !== null);
    expect(stepTips.length).toBeGreaterThanOrEqual(1);
    const stepIds = (
      await database
        .select({ id: recipeSteps.id })
        .from(recipeSteps)
        .where(eq(recipeSteps.recipeId, baseId))
    ).map((s) => s.id);
    expect(stepTips.every((t) => stepIds.includes(t.stepId as string))).toBe(
      true,
    );
  });

  it('gives every seeded Recipe Pairings, a Nutrition Note and Eating Moment uses in en and ro', async () => {
    const rows = await seededRecipes();
    expect(rows.every((r) => (r.nutritionNote ?? '') !== '')).toBe(true);
    expect(rows.every((r) => [...(r.nutritionNote ?? '')].length <= 500)).toBe(
      true,
    );

    const noteTexts = await database
      .select()
      .from(recipeNutritionNoteTranslations)
      .where(inArray(recipeNutritionNoteTranslations.recipeId, recipeIds));
    expect(noteTexts).toHaveLength(all.length);

    const pairings = await database
      .select()
      .from(recipePairings)
      .where(inArray(recipePairings.recipeId, recipeIds));
    for (const id of recipeIds) {
      expect(
        pairings.filter((p) => p.recipeId === id).length,
      ).toBeGreaterThanOrEqual(1);
    }
    const pairingTexts = await database
      .select()
      .from(recipePairingTranslations)
      .where(
        inArray(
          recipePairingTranslations.pairingId,
          pairings.map((p) => p.id),
        ),
      );
    expect(pairingTexts).toHaveLength(pairings.length);

    const uses = await database
      .select()
      .from(recipeEatingMoments)
      .where(inArray(recipeEatingMoments.recipeId, recipeIds));
    for (const id of recipeIds) {
      expect(
        uses.filter((u) => u.recipeId === id).length,
      ).toBeGreaterThanOrEqual(1);
    }
    expect(uses.every((u) => u.reason !== null)).toBe(true);
    const useTexts = await database
      .select()
      .from(recipeEatingMomentTranslations)
      .where(
        inArray(
          recipeEatingMomentTranslations.recipeEatingMomentId,
          uses.map((u) => u.id),
        ),
      );
    expect(useTexts).toHaveLength(uses.length);
  });

  it('links the Pairings to Catalog Ingredients where the data says so', async () => {
    const pairings = await database
      .select()
      .from(recipePairings)
      .where(
        and(
          eq(recipePairings.recipeId, seedId.recipe('omelette')),
          isNotNull(recipePairings.linkedIngredientId),
        ),
      );
    expect(pairings.map((p) => p.linkedIngredientId)).toContain(
      seedId.ingredient('sourdough'),
    );
  });

  describe('re-running', () => {
    const snapshot = async () => {
      const n = async (query: Promise<{ n: number }[]>) => (await query)[0].n;
      const c = sql<number>`count(*)::int`;
      return {
        recipes: await n(
          database
            .select({ n: c })
            .from(recipes)
            .where(inArray(recipes.id, recipeIds)),
        ),
        lines: await n(
          database
            .select({ n: c })
            .from(recipeIngredientLines)
            .where(inArray(recipeIngredientLines.recipeId, recipeIds)),
        ),
        steps: await n(
          database
            .select({ n: c })
            .from(recipeSteps)
            .where(inArray(recipeSteps.recipeId, recipeIds)),
        ),
        tips: await n(
          database
            .select({ n: c })
            .from(recipeTips)
            .where(inArray(recipeTips.recipeId, recipeIds)),
        ),
        pairings: await n(
          database
            .select({ n: c })
            .from(recipePairings)
            .where(inArray(recipePairings.recipeId, recipeIds)),
        ),
        uses: await n(
          database
            .select({ n: c })
            .from(recipeEatingMoments)
            .where(inArray(recipeEatingMoments.recipeId, recipeIds)),
        ),
        titles: await n(
          database
            .select({ n: c })
            .from(recipeTranslations)
            .where(inArray(recipeTranslations.recipeId, recipeIds)),
        ),
        moments: await n(
          database
            .select({ n: c })
            .from(eatingMoments)
            .where(
              inArray(
                eatingMoments.id,
                SEED_EATING_MOMENTS.map((m) => seedId.eatingMoment(m.slug)),
              ),
            ),
        ),
      };
    };

    it('inserts nothing new when the Catalog and Recipe seeds run again', async () => {
      const before = await snapshot();
      expect(before.recipes).toBe(all.length);
      await seedCatalog(database);
      await seedRecipes(database);
      await seedRecipes(database);
      expect(await snapshot()).toEqual(before);
    });

    it('does not overwrite an Admin edit, nor bring back what an Admin deleted', async () => {
      const baseId = seedId.recipe('omelette');
      const tipsOf = async (tx: Pick<Database, 'select'>) =>
        tx.select().from(recipeTips).where(eq(recipeTips.recipeId, baseId));
      await expect(
        database.transaction(async (tx) => {
          await tx
            .update(recipes)
            .set({ title: 'Admin omelette' })
            .where(eq(recipes.id, baseId));
          await tx.delete(recipeTips).where(eq(recipeTips.recipeId, baseId));
          await seedRecipes(tx);
          const [after] = await tx
            .select()
            .from(recipes)
            .where(eq(recipes.id, baseId));
          expect(after.title).toBe('Admin omelette');
          expect(await tipsOf(tx)).toHaveLength(0);
          throw new Rollback();
        }),
      ).rejects.toBeInstanceOf(Rollback);
      expect((await tipsOf(database)).length).toBeGreaterThan(0);
    });

    it('restores a deleted seed Recipe with all its content', async () => {
      const variant = omelette?.variants[0];
      const id = seedId.recipe(variant?.slug ?? '');
      await expect(
        database.transaction(async (tx) => {
          await tx.delete(recipes).where(eq(recipes.id, id));
          await seedRecipes(tx);
          const lines = await tx
            .select()
            .from(recipeIngredientLines)
            .where(eq(recipeIngredientLines.recipeId, id));
          expect(lines).toHaveLength(variant?.lines.length ?? -1);
          const pairs = await tx
            .select()
            .from(recipePairings)
            .where(eq(recipePairings.recipeId, id));
          expect(pairs).toHaveLength(variant?.pairings.length ?? -1);
          throw new Rollback();
        }),
      ).rejects.toBeInstanceOf(Rollback);
    });
  });
});
