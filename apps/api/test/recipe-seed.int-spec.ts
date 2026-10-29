import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm';
import {
  seedCatalog,
  seedId,
  stableId,
} from '../src/catalog/seed/seed-catalog';
import { SEED_BASE_RECIPES } from '../src/catalog/seed/recipes/recipe-seed-data';
import { seedRecipes } from '../src/catalog/seed/recipes/seed-recipes';
import {
  SEED_EATING_MOMENTS,
  SEED_TAGS,
} from '../src/catalog/seed/recipes/registries';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  catalogTranslations,
  eatingMoments,
  recipeEatingMomentTranslations,
  recipeHiddenTips,
  recipeEatingMoments,
  recipeIngredientLines,
  recipeNutritionNoteTranslations,
  recipePairings,
  recipePairingTranslations,
  recipes,
  recipeSteps,
  recipeStepTranslations,
  recipeTags,
  recipeTips,
  recipeTipTranslations,
  recipeTranslations,
  tagGroups,
  tags,
} from '../src/database/schema';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { storeUiLanguage } from './support/stored-language';

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

  it('seeds Tag Groups in order, with the Catalog Tags of every group, in en, ro and da', async () => {
    const groups = await database
      .select({ name: tagGroups.name, position: tagGroups.position })
      .from(tagGroups)
      .orderBy(tagGroups.position);
    expect(groups).toEqual([
      { name: 'Meal', position: 1 },
      { name: 'Diet', position: 2 },
      { name: 'Cuisine', position: 3 },
      { name: 'Method', position: 4 },
    ]);
    const catalogTags = await database
      .select({ id: tags.id, group: tagGroups.name, name: tags.name })
      .from(tags)
      .innerJoin(tagGroups, eq(tagGroups.id, tags.groupId))
      .where(isNull(tags.familyId));
    const inGroup = (group: string) =>
      catalogTags
        .filter((t) => t.group === group)
        .map((t) => t.name)
        .sort();
    for (const [slug, group] of [
      ['meal', 'Meal'],
      ['diet', 'Diet'],
      ['cuisine', 'Cuisine'],
      ['method', 'Method'],
    ] as const) {
      expect(inGroup(group)).toEqual(SEED_TAGS[slug].map((t) => t.en).sort());
    }
    // Each Tag has en, ro and da names.
    const translated = await database
      .select({ n: sql<number>`count(*)::int` })
      .from(catalogTranslations)
      .where(
        and(
          inArray(
            catalogTranslations.entityId,
            catalogTags.map((t) => t.id),
          ),
          eq(catalogTranslations.entityType, 'tag'),
          eq(catalogTranslations.kind, 'name'),
        ),
      );
    expect(translated[0].n).toBe(Object.values(SEED_TAGS).flat().length * 3);
    const named = await database
      .select({
        locale: catalogTranslations.locale,
        value: catalogTranslations.value,
      })
      .from(catalogTranslations)
      .where(
        and(
          eq(catalogTranslations.entityType, 'tag'),
          eq(catalogTranslations.entityId, seedId.tag('meal:breakfast')),
          eq(catalogTranslations.kind, 'name'),
        ),
      )
      .orderBy(catalogTranslations.locale);
    expect(named).toEqual([
      { locale: 'da', value: 'Morgenmad' },
      { locale: 'en', value: 'Breakfast' },
      { locale: 'ro', value: 'Mic dejun' },
    ]);
  });

  it('tags a seeded Variant with the Tag it is made by', async () => {
    const variant = SEED_BASE_RECIPES.flatMap((b) => b.variants).find((v) =>
      v.tag.startsWith('cuisine:'),
    );
    expect(variant).toBeDefined();
    const linked = await database
      .select({ tagId: recipeTags.tagId })
      .from(recipeTags)
      .where(eq(recipeTags.recipeId, seedId.recipe(variant!.slug)));
    expect(linked.map((l) => l.tagId)).toEqual([seedId.tag(variant!.tag)]);
  });

  it('reads a seeded Variant through the Member API, in Romanian, with inherited Tips and guidance', async () => {
    const cookie = await signUp(
      app,
      `recipe-seed-${Date.now()}@example.com`,
      'Seed Reader',
    );
    const member = client(app, cookie, '/api/recipes');
    // A signed-in request's `?locale=` is ignored: the stored UI Language decides.
    await storeUiLanguage(app, cookie, 'ro');
    const res = await member
      .get(`/${seedId.recipe('omelette-mediterranean')}`)
      .expect(200);
    const body = res.body as {
      title: string;
      tips: { inherited: boolean }[];
      guidance: {
        nutritionNote: string;
        pairings: unknown[];
        eatingMoments: { name: string }[];
      };
    };
    expect(body.title).toBe('Omletă mediteraneană');
    expect(body.guidance.nutritionNote).toContain('Uleiul de măsline');
    expect(body.guidance.pairings.length).toBeGreaterThanOrEqual(1);
    expect(body.guidance.eatingMoments[0].name).toBeTruthy();
    expect(body.tips.filter((t) => t.inherited)).toHaveLength(
      omelette?.tips?.length ?? -1,
    );
  });

  it('hides the base Tips a Variant opts out of and keeps one position sequence per Recipe', async () => {
    const variantId = seedId.recipe('omelette-middle-eastern');
    const hidden = await database
      .select()
      .from(recipeHiddenTips)
      .where(eq(recipeHiddenTips.recipeId, variantId));
    expect(hidden.map((h) => h.tipId)).toEqual([
      stableId('recipe-tip:omelette:0'),
    ]);
    const tips = await database
      .select()
      .from(recipeTips)
      .where(inArray(recipeTips.recipeId, recipeIds));
    for (const id of recipeIds) {
      const positions = tips
        .filter((t) => t.recipeId === id)
        .map((t) => t.position)
        .sort((a, b) => a - b);
      expect(positions).toEqual(positions.map((_, i) => i));
    }
  });

  /** The Tags a Recipe carries (ids). */
  const tagsOf = async (recipeId: string) =>
    (
      await database
        .select({ tagId: recipeTags.tagId })
        .from(recipeTags)
        .where(eq(recipeTags.recipeId, recipeId))
    ).map((r) => r.tagId);

  /** How many Variants of `baseId` carry a Tag of the Tag Group named `groupName`. */
  const variantsTaggedIn = async (groupName: string, baseId: string) =>
    (
      await database
        .selectDistinct({ id: recipes.id })
        .from(recipes)
        .innerJoin(recipeTags, eq(recipeTags.recipeId, recipes.id))
        .innerJoin(tags, eq(tags.id, recipeTags.tagId))
        .innerJoin(tagGroups, eq(tagGroups.id, tags.groupId))
        .where(and(eq(recipes.parentId, baseId), eq(tagGroups.name, groupName)))
    ).length;

  it('seeds the Omelette base with its Variants', async () => {
    const [base] = await database
      .select()
      .from(recipes)
      .where(eq(recipes.id, seedId.recipe('omelette')));
    expect(base).toMatchObject({
      title: 'Omelette',
      parentId: null,
      familyId: null,
    });
    expect(await tagsOf(base.id)).toEqual([]);
    const variants = await database
      .select()
      .from(recipes)
      .where(eq(recipes.parentId, base.id));
    expect(variants).toHaveLength(omelette?.variants.length ?? -1);
    expect(await variantsTaggedIn('Cuisine', base.id)).toBeGreaterThanOrEqual(
      3,
    );
    expect(await variantsTaggedIn('Method', base.id)).toBeGreaterThanOrEqual(2);
    expect(variants.every((v) => v.familyId === null)).toBe(true);
  });

  it('meets the acceptance counts: five bases with their Variant minimums', async () => {
    const minimums: Record<string, [number, number]> = {
      omelette: [3, 2],
      'potato-puree': [3, 1],
      'fried-chicken': [3, 1],
      'chicken-salad': [3, 1],
      'appetizer-platter': [5, 0],
    };
    for (const [slug, [cuisineMin, methodMin]] of Object.entries(minimums)) {
      const baseId = seedId.recipe(slug);
      const [base] = await database
        .select()
        .from(recipes)
        .where(eq(recipes.id, baseId));
      expect(base?.parentId).toBeNull();
      expect(await variantsTaggedIn('Cuisine', baseId)).toBeGreaterThanOrEqual(
        cuisineMin,
      );
      expect(await variantsTaggedIn('Method', baseId)).toBeGreaterThanOrEqual(
        methodMin,
      );
    }
  });

  it('links at least three Pairings to a Recipe of another base', async () => {
    const rows = await database
      .select({
        from: recipes.id,
        fromParent: recipes.parentId,
        link: recipePairings.linkedRecipeId,
      })
      .from(recipePairings)
      .innerJoin(recipes, eq(recipes.id, recipePairings.recipeId))
      .where(
        and(
          inArray(recipePairings.recipeId, recipeIds),
          isNotNull(recipePairings.linkedRecipeId),
        ),
      );
    const targets = await database
      .select({ id: recipes.id, parentId: recipes.parentId })
      .from(recipes)
      .where(
        inArray(
          recipes.id,
          rows.map((r) => r.link as string),
        ),
      );
    const family = (id: string, parentId: string | null) => parentId ?? id;
    const familyOf = new Map(
      targets.map((t) => [t.id, family(t.id, t.parentId)]),
    );
    const crossing = rows.filter((r) => {
      const target = familyOf.get(r.link as string);
      return target !== undefined && target !== family(r.from, r.fromParent);
    });
    expect(crossing.length).toBeGreaterThanOrEqual(3);
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

  it('gives every base Recipe-level Tips and a Step Tip on an existing step', async () => {
    for (const seed of SEED_BASE_RECIPES) {
      const baseId = seedId.recipe(seed.slug);
      const tips = await database
        .select()
        .from(recipeTips)
        .where(eq(recipeTips.recipeId, baseId));
      expect([
        seed.slug,
        tips.filter((t) => t.stepId === null).length > 0,
      ]).toEqual([seed.slug, true]);
      const stepTips = tips.filter((t) => t.stepId !== null);
      expect([seed.slug, stepTips.length > 0]).toEqual([seed.slug, true]);
      const stepIds = (
        await database
          .select({ id: recipeSteps.id })
          .from(recipeSteps)
          .where(eq(recipeSteps.recipeId, baseId))
      ).map((s) => s.id);
      expect(stepTips.every((t) => stepIds.includes(t.stepId as string))).toBe(
        true,
      );
    }
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

    it('skips a Variant whose base is archived, as the API refuses new Variants there', async () => {
      const baseId = seedId.recipe('omelette');
      const variantId = seedId.recipe('omelette-frittata');
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await expect(
          database.transaction(async (tx) => {
            await tx.delete(recipes).where(eq(recipes.id, variantId));
            await tx
              .update(recipes)
              .set({ archivedAt: new Date() })
              .where(eq(recipes.id, baseId));
            await seedRecipes(tx);
            expect(
              await tx.select().from(recipes).where(eq(recipes.id, variantId)),
            ).toHaveLength(0);
            expect(log).toHaveBeenCalledWith(
              expect.stringContaining('omelette-frittata'),
            );
            throw new Rollback();
          }),
        ).rejects.toBeInstanceOf(Rollback);
      } finally {
        log.mockRestore();
      }
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
