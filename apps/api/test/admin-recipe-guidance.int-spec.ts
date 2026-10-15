import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike, isNull } from 'drizzle-orm';
import { catalogScope, SHARED_ONLY } from '../src/catalog/catalog-scope';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  catalogTranslations,
  eatingMoments,
  family,
  ingredients,
  recipePairings,
  recipes,
} from '../src/database/schema';
import { writeGuidance } from '../src/recipes/recipe-guidance-write';
import { loadResolvedGuidance } from '../src/recipes/recipe-guidance';
import { loadCatalogRecipe } from '../src/recipes/recipe-view';
import type { ResolvedGuidance } from '../src/recipes/recipe-guidance.schemas';
import type { AdminRecipeDetail } from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

const code = (res: { body: unknown }) => (res.body as { code: string }).code;

jest.setTimeout(30_000);

describe('Recipe guidance (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let catalog: ReturnType<typeof client>;
  let member: ReturnType<typeof client>;
  let flour: string;
  let familyId: string;
  let familyRecipeId: string;
  const stamp = Date.now();
  let n = 0;
  const title = (label: string) => `${label} ${stamp}-${++n}`;

  const createBase = async () =>
    (
      await admin
        .post('', {
          title: title('Guided'),
          servings: 2,
          lines: [{ ingredientId: flour }],
          steps: [{ text: 'Cook' }],
        })
        .expect(201)
    ).body as AdminRecipeDetail;
  const detail = async (id: string) =>
    (await admin.get(`/${id}`).expect(200)).body as AdminRecipeDetail;
  const moment = async (name: string) =>
    (
      (
        await catalog.post('/eating-moments', {
          name: `${name} ${stamp}-${++n}`,
        })
      ).body as { id: string }
    ).id;
  const pairing = (overrides: Record<string, unknown> = {}) => ({
    kind: 'drink',
    label: 'a glass of dry white wine',
    reason: 'its acidity cuts through the butter',
    ...overrides,
  });

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const email = `guidance-admin-${stamp}@example.com`;
    const cookie = await signUp(app, email, 'Guidance Admin');
    admin = client(app, cookie, '/api/admin/recipes');
    catalog = client(app, cookie, '/api/admin/catalog');
    member = client(app, cookie, '/api/recipes');
    await promoteToAdmin(database, email);
    [{ id: flour }] = await database
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(isNull(ingredients.ownerFamilyId))
      .limit(1);
    familyId = crypto.randomUUID();
    await database.insert(family).values({
      id: familyId,
      inviteCode: `g${stamp}`,
      inviteCodeExpiresAt: new Date(),
    });
    familyRecipeId = crypto.randomUUID();
    await database.insert(recipes).values({
      id: familyRecipeId,
      familyId,
      title: title('Family dish'),
      servings: 2,
    });
  });

  afterAll(async () => {
    const like = `%${stamp}%`;
    await database.delete(recipes).where(ilike(recipes.title, like));
    await database.delete(family).where(eq(family.id, familyId));
    await database.delete(eatingMoments).where(ilike(eatingMoments.name, like));
    await database
      .delete(catalogTranslations)
      .where(ilike(catalogTranslations.value, like));
    await app.close();
  });

  describe('writing guidance', () => {
    it('stores ordered Pairings, the Nutrition Note and Eating Moment uses', async () => {
      const base = await createBase();
      const dinner = await moment('Dinner');
      const breakfast = await moment('Breakfast');
      const res = await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: 'Rich in fat; fine as a treat, heavy before sleep.',
          pairings: [
            pairing({ principle: 'acid_cuts_fat', linkedIngredientId: flour }),
            pairing({ kind: 'food', label: 'steamed greens', reason: 'light' }),
          ],
          eatingMoments: [
            { eatingMomentId: dinner, polarity: 'good_for', reason: 'filling' },
            { eatingMomentId: breakfast, polarity: 'avoid' },
          ],
        })
        .expect(200);
      const body = res.body as AdminRecipeDetail;
      expect(body.nutritionNote).toBe(
        'Rich in fat; fine as a treat, heavy before sleep.',
      );
      expect(
        body.pairings.map((p) => [
          p.kind,
          p.label,
          p.principle,
          p.linkedIngredientId,
          p.linkedRecipeId,
        ]),
      ).toEqual([
        ['drink', 'a glass of dry white wine', 'acid_cuts_fat', flour, null],
        ['food', 'steamed greens', null, null, null],
      ]);
      expect(
        body.eatingMoments.map((m) => [m.eatingMomentId, m.polarity, m.reason]),
      ).toEqual([
        [dinner, 'good_for', 'filling'],
        [breakfast, 'avoid', null],
      ]);
      expect(await detail(base.id)).toEqual(body);
    });

    it('keeps Pairing ids that are sent back, reorders, and removes the rest', async () => {
      const base = await createBase();
      const first = (
        await admin
          .put(`/${base.id}/guidance`, {
            nutritionNote: null,
            pairings: [pairing({ label: 'one' }), pairing({ label: 'two' })],
            eatingMoments: [],
          })
          .expect(200)
      ).body as AdminRecipeDetail;
      const [one, two] = first.pairings;
      const after = (
        await admin
          .put(`/${base.id}/guidance`, {
            nutritionNote: null,
            pairings: [{ ...pairing({ label: 'two!' }), id: two.id }],
            eatingMoments: [],
          })
          .expect(200)
      ).body as AdminRecipeDetail;
      expect(after.pairings.map((p) => [p.id, p.label])).toEqual([
        [two.id, 'two!'],
      ]);
      expect(after.pairings.some((p) => p.id === one.id)).toBe(false);
      const stranger = await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: [{ ...pairing(), id: crypto.randomUUID() }],
          eatingMoments: [],
        })
        .expect(400);
      expect(code(stranger)).toBe('recipes.item_not_found');
    });

    it('refuses an empty label or reason with the generic validation error', async () => {
      const base = await createBase();
      await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: [pairing({ label: '  ' })],
          eatingMoments: [],
        })
        .expect(400);
    });

    it('returns 404 for an unknown Recipe', async () => {
      await admin
        .put(`/${crypto.randomUUID()}/guidance`, {
          nutritionNote: null,
          pairings: [],
          eatingMoments: [],
        })
        .expect(404);
    });
  });

  describe('limits', () => {
    it('refuses more than 10 Pairings', async () => {
      const base = await createBase();
      const res = await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: Array.from({ length: 11 }, (_, i) =>
            pairing({ label: `p${i}` }),
          ),
          eatingMoments: [],
        })
        .expect(400);
      expect(code(res)).toBe('recipes.pairings_too_many');
      await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: Array.from({ length: 10 }, (_, i) =>
            pairing({ label: `p${i}` }),
          ),
          eatingMoments: [],
        })
        .expect(200);
    });

    it('refuses more than 10 Eating Moments', async () => {
      const base = await createBase();
      const ids = await Promise.all(
        Array.from({ length: 11 }, (_, i) => moment(`Many${i}`)),
      );
      const uses = (list: string[]) =>
        list.map((eatingMomentId) => ({ eatingMomentId, polarity: 'avoid' }));
      const res = await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: [],
          eatingMoments: uses(ids),
        })
        .expect(400);
      expect(code(res)).toBe('recipes.eating_moments_too_many');
      await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: [],
          eatingMoments: uses(ids.slice(0, 10)),
        })
        .expect(200);
    });

    it('refuses a Nutrition Note over 500 characters', async () => {
      const base = await createBase();
      const put = (nutritionNote: string) =>
        admin.put(`/${base.id}/guidance`, {
          nutritionNote,
          pairings: [],
          eatingMoments: [],
        });
      const res = await put('x'.repeat(501)).expect(400);
      expect(code(res)).toBe('recipes.nutrition_note_too_long');
      await put('é'.repeat(500)).expect(200);
    });
  });

  describe('Eating Moment uses', () => {
    it('refuses the same Eating Moment twice', async () => {
      const base = await createBase();
      const dinner = await moment('Twice');
      const res = await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: [],
          eatingMoments: [
            { eatingMomentId: dinner, polarity: 'good_for' },
            { eatingMomentId: dinner, polarity: 'avoid' },
          ],
        })
        .expect(400);
      expect(code(res)).toBe('recipes.eating_moment_duplicate');
    });

    it('refuses an unknown Eating Moment', async () => {
      const base = await createBase();
      const res = await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: [],
          eatingMoments: [
            { eatingMomentId: crypto.randomUUID(), polarity: 'avoid' },
          ],
        })
        .expect(404);
      expect(code(res)).toBe('recipes.eating_moment_not_found');
    });

    it('keeps an archived Eating Moment on the Recipe when guidance is saved again', async () => {
      const base = await createBase();
      const dinner = await moment('Archived');
      const body = {
        nutritionNote: null,
        pairings: [],
        eatingMoments: [{ eatingMomentId: dinner, polarity: 'avoid' }],
      };
      await admin.put(`/${base.id}/guidance`, body).expect(200);
      await catalog.post(`/eating-moments/${dinner}/archive`).expect(200);
      const again = await admin.put(`/${base.id}/guidance`, body).expect(200);
      expect((again.body as AdminRecipeDetail).eatingMoments).toHaveLength(1);
    });
  });

  describe('Pairing link rules', () => {
    const put = (id: string, p: Record<string, unknown>) =>
      admin.put(`/${id}/guidance`, {
        nutritionNote: null,
        pairings: [pairing(p)],
        eatingMoments: [],
      });

    it('links to a Catalog Recipe, including an archived one', async () => {
      const base = await createBase();
      const other = await createBase();
      const res = await put(base.id, { linkedRecipeId: other.id }).expect(200);
      expect((res.body as AdminRecipeDetail).pairings[0].linkedRecipeId).toBe(
        other.id,
      );
      await admin.post(`/${other.id}/archive`).expect(200);
      await put(base.id, { linkedRecipeId: other.id }).expect(200);
    });

    it('refuses a Catalog Recipe linking to Family content', async () => {
      const base = await createBase();
      const res = await put(base.id, {
        linkedRecipeId: familyRecipeId,
      }).expect(409);
      expect(code(res)).toBe('recipes.pairing_link_not_allowed');
    });

    it('refuses linking to both an Ingredient and a Recipe', async () => {
      const base = await createBase();
      const other = await createBase();
      const res = await put(base.id, {
        linkedIngredientId: flour,
        linkedRecipeId: other.id,
      }).expect(400);
      expect(code(res)).toBe('recipes.pairing_link_conflict');
    });

    it('refuses a link to something that does not exist', async () => {
      const base = await createBase();
      for (const key of ['linkedIngredientId', 'linkedRecipeId']) {
        const res = await put(base.id, { [key]: crypto.randomUUID() }).expect(
          404,
        );
        expect(code(res)).toBe('recipes.pairing_link_not_found');
      }
    });

    it('refuses a Recipe linking to itself', async () => {
      const base = await createBase();
      const res = await put(base.id, { linkedRecipeId: base.id }).expect(400);
      expect(code(res)).toBe('recipes.pairing_self_link');
    });
  });

  /** A Recipe with a note, a food and a drink Pairing and two Eating Moments. */
  async function guided(extra: { linkedRecipeId?: string } = {}) {
    const base = await createBase();
    const dinner = await moment('Dinner');
    const snack = await moment('Snack');
    const res = await admin
      .put(`/${base.id}/guidance`, {
        nutritionNote: 'Rich in fat; fine as a treat.',
        pairings: [
          pairing({ principle: 'acid_cuts_fat', linkedIngredientId: flour }),
          pairing({
            kind: 'food',
            label: 'steamed greens',
            reason: 'light',
            ...extra,
          }),
        ],
        eatingMoments: [
          { eatingMomentId: dinner, polarity: 'good_for', reason: 'filling' },
          { eatingMomentId: snack, polarity: 'avoid' },
        ],
      })
      .expect(200);
    return { base, dinner, snack, detail: res.body as AdminRecipeDetail };
  }

  describe('translations', () => {
    it('round-trips guidance translations per locale, with null deleting', async () => {
      const { base, dinner, detail: d } = await guided();
      const [wine, greens] = d.pairings;
      const res = await admin
        .put(`/${base.id}/translations/ro`, {
          nutritionNote: 'Bogat in grasimi.',
          pairings: {
            [wine.id]: { label: 'un pahar de vin alb', reason: 'aciditate' },
          },
          eatingMoments: { [dinner]: 'satios' },
        })
        .expect(200);
      expect((res.body as AdminRecipeDetail).translations.ro).toMatchObject({
        nutritionNote: 'Bogat in grasimi.',
        pairings: {
          [wine.id]: { label: 'un pahar de vin alb', reason: 'aciditate' },
        },
        eatingMoments: { [dinner]: 'satios' },
      });
      // Saving the guidance again keeps the translations of what stays.
      await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: d.nutritionNote,
          pairings: d.pairings.map(({ id, ...rest }) => ({ id, ...rest })),
          eatingMoments: d.eatingMoments,
        })
        .expect(200);
      expect((await detail(base.id)).translations.ro.pairings).toHaveProperty(
        wine.id,
      );
      const cleared = await admin
        .put(`/${base.id}/translations/ro`, {
          nutritionNote: null,
          pairings: { [wine.id]: null },
          eatingMoments: { [dinner]: null },
        })
        .expect(200);
      const ro = (cleared.body as AdminRecipeDetail).translations.ro;
      expect(ro?.nutritionNote ?? null).toBeNull();
      expect(ro?.pairings ?? {}).toEqual({});
      expect(ro?.eatingMoments ?? {}).toEqual({});
      expect(greens.id).toBeDefined();
    });

    it('refuses a translated Nutrition Note over 500 characters', async () => {
      const { base } = await guided();
      const res = await admin
        .put(`/${base.id}/translations/da`, { nutritionNote: 'x'.repeat(501) })
        .expect(400);
      expect(code(res)).toBe('recipes.nutrition_note_too_long');
    });

    it('refuses translations of things the Recipe does not have', async () => {
      const { base, snack } = await guided();
      const stranger = await admin
        .put(`/${base.id}/translations/ro`, {
          pairings: {
            [crypto.randomUUID()]: { label: 'x', reason: 'y' },
          },
        })
        .expect(400);
      expect(code(stranger)).toBe('recipes.item_not_found');
      // The `snack` use has no source reason, so there is nothing to translate.
      const nothing = await admin
        .put(`/${base.id}/translations/ro`, { eatingMoments: { [snack]: 'x' } })
        .expect(400);
      expect(code(nothing)).toBe('recipes.nothing_to_translate');
      const bare = await createBase();
      const noNote = await admin
        .put(`/${bare.id}/translations/ro`, { nutritionNote: 'x' })
        .expect(400);
      expect(code(noNote)).toBe('recipes.nothing_to_translate');
      await admin
        .put(`/${base.id}/translations/ro`, {
          eatingMoments: { [crypto.randomUUID()]: 'x' },
        })
        .expect(400);
    });
  });

  describe('the member read model', () => {
    it('resolves guidance for the locale, falling back to the source text', async () => {
      const other = await createBase();
      const {
        base,
        dinner,
        detail: d,
      } = await guided({
        linkedRecipeId: other.id,
      });
      await admin
        .put(`/${other.id}/translations/ro`, { title: 'Alta reteta' })
        .expect(200);
      await catalog
        .post('/translations', {
          entityType: 'eating_moment',
          entityId: dinner,
          locale: 'ro',
          kind: 'name',
          value: `Cina ${stamp}`,
        })
        .expect(201);
      await admin
        .put(`/${base.id}/translations/ro`, {
          nutritionNote: 'Bogat in grasimi.',
          pairings: {
            [d.pairings[0].id]: { label: 'vin alb', reason: 'acid' },
          },
          eatingMoments: { [dinner]: 'satios' },
        })
        .expect(200);

      const en = await loadCatalogRecipe(database, base.id, 'en');
      expect(en?.guidance.nutritionNote).toBe('Rich in fat; fine as a treat.');
      expect(en?.guidance.pairings.map((p) => [p.kind, p.label])).toEqual([
        ['drink', 'a glass of dry white wine'],
        ['food', 'steamed greens'],
      ]);
      expect(en?.guidance.pairings[0].principle).toBe('acid_cuts_fat');
      expect(en?.guidance.pairings[0].link).toMatchObject({
        type: 'ingredient',
        id: flour,
      });
      expect(en?.guidance.pairings[1].link).toMatchObject({
        type: 'recipe',
        id: other.id,
        title: other.title,
      });
      expect(
        en?.guidance.eatingMoments.map((m) => [m.polarity, m.reason]),
      ).toEqual([
        ['good_for', 'filling'],
        ['avoid', null],
      ]);

      const ro = await loadCatalogRecipe(database, base.id, 'ro');
      expect(ro?.guidance.nutritionNote).toBe('Bogat in grasimi.');
      expect(ro?.guidance.pairings[0]).toMatchObject({
        label: 'vin alb',
        reason: 'acid',
      });
      // No translation: the source text shows.
      expect(ro?.guidance.pairings[1]).toMatchObject({
        label: 'steamed greens',
        link: { type: 'recipe', title: 'Alta reteta' },
      });
      expect(ro?.guidance.eatingMoments[0]).toMatchObject({
        name: `Cina ${stamp}`,
        reason: 'satios',
      });
      // No Romanian name for the second moment: the English one shows.
      expect(ro?.guidance.eatingMoments[1].name).toContain('Snack');
    });

    it('hides the link of an archived Recipe but keeps the label, and hides archived Eating Moments', async () => {
      const other = await createBase();
      const { base, snack } = await guided({ linkedRecipeId: other.id });
      await admin.post(`/${other.id}/archive`).expect(200);
      await catalog.post(`/eating-moments/${snack}/archive`).expect(200);
      const view = await loadCatalogRecipe(database, base.id, 'en');
      expect(view?.guidance.pairings[1]).toMatchObject({
        label: 'steamed greens',
        link: null,
      });
      expect(view?.guidance.eatingMoments).toHaveLength(1);
      expect(view?.guidance.eatingMoments[0].polarity).toBe('good_for');
      // The Admin still sees everything.
      const admined = await detail(base.id);
      expect(admined.pairings[1].linkedRecipeId).toBe(other.id);
      expect(admined.eatingMoments).toHaveLength(2);
    });

    it('serves guidance on GET /api/recipes/:id in the Member locale, hiding archived targets', async () => {
      const other = await createBase();
      const { base, snack } = await guided({ linkedRecipeId: other.id });
      await admin
        .put(`/${base.id}/translations/ro`, {
          nutritionNote: 'Bogat in grasimi.',
        })
        .expect(200);
      const open = (await member.get(`/${base.id}?locale=ro`).expect(200))
        .body as { guidance: ResolvedGuidance };
      expect(open.guidance.nutritionNote).toBe('Bogat in grasimi.');
      expect(open.guidance.pairings[1].link).toMatchObject({
        type: 'recipe',
        id: other.id,
      });
      expect(open.guidance.eatingMoments).toHaveLength(2);

      await admin.post(`/${other.id}/archive`).expect(200);
      await catalog.post(`/eating-moments/${snack}/archive`).expect(200);
      const hidden = (await member.get(`/${base.id}?locale=en`).expect(200))
        .body as { guidance: ResolvedGuidance };
      expect(hidden.guidance.pairings[1]).toMatchObject({
        label: 'steamed greens',
        link: null,
      });
      expect(hidden.guidance.eatingMoments).toHaveLength(1);
    });

    it('does not expose a link to a Recipe of another Family', async () => {
      const otherFamilyId = crypto.randomUUID();
      await database.insert(family).values({
        id: otherFamilyId,
        inviteCode: `h${stamp}`,
        inviteCodeExpiresAt: new Date(),
      });
      const foreign = crypto.randomUUID();
      const mine = crypto.randomUUID();
      await database.insert(recipes).values([
        {
          id: foreign,
          familyId: otherFamilyId,
          title: title('Foreign dish'),
          servings: 2,
        },
        {
          id: mine,
          familyId,
          title: title('Own dish'),
          servings: 2,
        },
      ]);
      const ownId = crypto.randomUUID();
      await database.insert(recipePairings).values([
        {
          id: crypto.randomUUID(),
          recipeId: mine,
          position: 0,
          kind: 'food',
          label: 'foreign side',
          reason: 'r',
          linkedRecipeId: foreign,
        },
        {
          id: ownId,
          recipeId: mine,
          position: 1,
          kind: 'food',
          label: 'own side',
          reason: 'r',
          linkedRecipeId: familyRecipeId,
        },
      ]);
      try {
        const view = await loadResolvedGuidance(
          database,
          catalogScope(SHARED_ONLY),
          mine,
          'en',
        );
        expect(view.pairings[0]).toMatchObject({
          label: 'foreign side',
          link: null,
        });
        expect(view.pairings[1].link).toMatchObject({
          type: 'recipe',
          id: familyRecipeId,
        });
      } finally {
        await database.delete(recipes).where(eq(recipes.id, mine));
        await database.delete(family).where(eq(family.id, otherFamilyId));
      }
    });

    it('is empty for a Recipe without guidance', async () => {
      const base = await createBase();
      const view = await loadCatalogRecipe(database, base.id, 'en');
      expect(view?.guidance).toEqual({
        nutritionNote: null,
        pairings: [],
        eatingMoments: [],
      });
    });
  });

  describe('Make a variant', () => {
    it('copies all guidance with its translations; later base edits do not reach the Variant', async () => {
      const other = await createBase();
      const {
        base,
        dinner,
        detail: d,
      } = await guided({
        linkedRecipeId: other.id,
      });
      await admin
        .put(`/${base.id}/translations/ro`, {
          nutritionNote: 'Bogat in grasimi.',
          pairings: {
            [d.pairings[0].id]: { label: 'vin alb', reason: 'acid' },
          },
          eatingMoments: { [dinner]: 'satios' },
        })
        .expect(200);

      const variant = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Variant') })
          .expect(201)
      ).body as AdminRecipeDetail;
      expect(variant.nutritionNote).toBe(d.nutritionNote);
      const content = (p: AdminRecipeDetail['pairings'][number]) => ({
        ...p,
        id: undefined,
      });
      expect(variant.pairings.map(content)).toEqual(d.pairings.map(content));
      expect(variant.pairings.map((p) => p.id)).not.toContain(d.pairings[0].id);
      expect(
        variant.eatingMoments.map((m) => [
          m.eatingMomentId,
          m.polarity,
          m.reason,
        ]),
      ).toEqual(
        d.eatingMoments.map((m) => [m.eatingMomentId, m.polarity, m.reason]),
      );
      expect(variant.translations.ro).toMatchObject({
        nutritionNote: 'Bogat in grasimi.',
        pairings: {
          [variant.pairings[0].id]: { label: 'vin alb', reason: 'acid' },
        },
        eatingMoments: { [dinner]: 'satios' },
      });

      // Independent from here on, in both directions.
      await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: 'Changed.',
          pairings: [],
          eatingMoments: [],
        })
        .expect(200);
      const after = await detail(variant.id);
      expect(after.nutritionNote).toBe(d.nutritionNote);
      expect(after.pairings).toHaveLength(2);
      expect(after.eatingMoments).toHaveLength(2);
      await admin
        .put(`/${variant.id}/guidance`, {
          nutritionNote: null,
          pairings: [],
          eatingMoments: [],
        })
        .expect(200);
      expect((await detail(base.id)).nutritionNote).toBe('Changed.');
    });
  });

  describe('writeGuidance for the seed', () => {
    const body = (id: string) => ({
      nutritionNote: null,
      pairings: [
        {
          id,
          kind: 'food' as const,
          label: 'bread',
          reason: 'soaks up the sauce',
          principle: null,
          linkedIngredientId: null,
          linkedRecipeId: null,
        },
      ],
      eatingMoments: [],
    });
    const write = (recipeId: string, id: string, allowNewIds: boolean) =>
      database.transaction((tx) =>
        writeGuidance(tx, { id: recipeId, familyId: null }, body(id), {
          allowNewIds,
        }),
      );

    it('inserts a new stable Pairing id only when allowNewIds is set', async () => {
      const base = await createBase();
      const stable = crypto.randomUUID();
      await expect(write(base.id, stable, false)).rejects.toMatchObject({
        code: 'recipes.item_not_found',
      });
      await write(base.id, stable, true);
      expect((await detail(base.id)).pairings.map((p) => p.id)).toEqual([
        stable,
      ]);
    });

    it('refuses an id that another Recipe already owns', async () => {
      const owner = await createBase();
      const other = await createBase();
      const stable = crypto.randomUUID();
      await write(owner.id, stable, true);
      await expect(write(other.id, stable, true)).rejects.toMatchObject({
        code: 'recipes.item_not_found',
      });
    });
  });

  describe('Admin only', () => {
    it('refuses a Member', async () => {
      const member = client(
        app,
        await signUp(app, `guidance-member-${stamp}@example.com`, 'Member'),
        '/api/admin/recipes',
      );
      await member
        .put(`/${crypto.randomUUID()}/guidance`, {
          nutritionNote: null,
          pairings: [],
          eatingMoments: [],
        })
        .expect(403);
    });
  });
});
