import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike } from 'drizzle-orm';
import request from 'supertest';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { ApiException } from '../src/common/api-exception';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { tags, unmatchedEntries } from '../src/database/schema';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { PLATE_TOKEN_TTL_MS } from '../src/scan/plate-token';
import { expectCatalogByIndex } from './support/catalog-indices';
import { offeredTagNames, tagIndexIn } from './support/tag-indices';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { signUpWithUiLanguage } from './support/stored-language';

const IMAGE = 'data:image/jpeg;base64,YQ==';
const flour = seedId.ingredient('flour');
const milk = seedId.ingredient('milk');

/** An Ingredient Line as the model writes it; the test app turns `ingredientId` into the Catalog index the model really fills in. */
const item = (overrides: Record<string, unknown> = {}) => ({
  nameAsWritten: 'Milk',
  ingredientId: milk,
  matchConfidence: 0.9,
  quantity: 200,
  unit: 'ml',
  preparation: null,
  optional: false,
  ...overrides,
});
/** The Recipe the model writes for a dish. */
const written = (overrides: Record<string, unknown> = {}) => ({
  title: 'Pancakes',
  servings: 4,
  tagIndexes: [],
  ingredients: [item()],
  steps: [{ text: 'Whisk.', timerMinutes: null }],
  tips: [],
  ...overrides,
});

type DraftView = {
  kind: string;
  baseRecipeId: string | null;
  content: {
    title: string;
    servings: string;
    tagIds: string[];
    plateScan: boolean;
    offersBases: boolean;
    pickedBaseId: string | null;
    sourceLink: string | null;
    guidance: {
      nutritionNote: string;
      pairings: unknown[];
      eatingMoments: unknown[];
    } | null;
    lines: Array<{
      ingredientId: string;
      name: string;
      quantity: string;
      unit: string;
      optional: boolean;
      note: string;
    }>;
    steps: Array<{
      text: string;
      timer: string;
      tips?: Array<{ text: string }>;
    }>;
    tips?: Array<{ text: string }>;
  };
};
type List = {
  groups: Array<{
    aisle: unknown;
    items: Array<{
      id: string;
      name: string;
      quantity: number | null;
      unit: string | null;
      unmatched: boolean;
      checked: boolean;
    }>;
  }>;
};

describe('Plate Scan (integration)', () => {
  let app: NestFastifyApplication;
  let next: (
    request: StructuredOutputRequest,
  ) => Promise<{ data: unknown; requestId: string | null }>;
  const prompts: StructuredOutputRequest[] = [];
  const signals: (AbortSignal | undefined)[] = [];
  let counter = 0;

  beforeAll(async () => {
    app = await createTestApp([], {
      generate: (input, options) => {
        prompts.push(input);
        signals.push(options?.signal);
        return next(input);
      },
    });
  });
  afterAll(async () => {
    await app.close();
  });

  const respondWith = (
    data: object | ((request: StructuredOutputRequest) => object),
  ) => {
    next = (request) =>
      Promise.resolve({
        data:
          typeof data === 'function'
            ? (data as (request: StructuredOutputRequest) => object)(request)
            : data,
        requestId: 'fake-request',
      });
  };

  async function signUp() {
    const n = ++counter;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.15.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `Plate ${n}`,
        email: `plate-${Date.now()}-${n}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    return [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
  }

  /** A Member whose stored UI Language is `locale` (the API ignores the request's own `?locale=`). */
  const signUpIn = (locale: string) =>
    signUpWithUiLanguage(app, signUp, locale);

  // `locale` is sent as the web used to; a signed-in request ignores it.
  const post = (cookie: string, path: string, body: object, locale = 'en') =>
    request(app.getHttpServer())
      .post(`/api/${path}`)
      .query({ locale })
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie)
      .send(body);
  const dishes = (cookie: string, body: object = { plateImage: IMAGE }) =>
    post(cookie, 'scan/plate', body);
  /** A genuine token for this Member, from a real Plate Scan that guessed Pancakes and Crepes. */
  const tokenFor = async (cookie: string) => {
    const saved = next;
    const seen = prompts.length;
    respondWith({
      matches: [
        { title: 'Pancakes', confidence: 0.7 },
        { title: 'Crepes', confidence: 0.2 },
      ],
    });
    const { token } = (await dishes(cookie).expect(201)).body as {
      token: string;
    };
    next = saved;
    prompts.length = seen; // The photo step's prompt is not the one under test.
    return token;
  };
  /** Writes a dish as a Recipe Draft; gets a genuine token first unless one (or null for none) is given. */
  const recipe = (
    cookie: string,
    dishTitle = 'Pancakes',
    locale = 'en',
    token?: string | null,
  ) => ({
    expect: async (status: number) => {
      const plateToken = token === undefined ? await tokenFor(cookie) : token;
      const response = await post(
        cookie,
        'scan/plate/recipe',
        { dishTitle, ...(plateToken === null ? {} : { plateToken }) },
        locale,
      );
      expect(response.status).toBe(status);
      return response;
    },
  });
  const draftOf = async (cookie: string, id: string) =>
    (
      await request(app.getHttpServer())
        .get(`/api/recipe-drafts/${id}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .expect(200)
    ).body as DraftView;
  const draftCount = async (cookie: string) =>
    (
      (
        await request(app.getHttpServer())
          .get('/api/recipe-drafts')
          .set('origin', TEST_ORIGIN)
          .set('cookie', cookie)
          .expect(200)
      ).body as unknown[]
    ).length;
  const bulk = (cookie: string, items: object[]) =>
    post(cookie, 'shopping-list/items/bulk', { items });

  it('requires authentication on every endpoint', async () => {
    for (const path of [
      'scan/plate',
      'scan/plate/recipe',
      'shopping-list/items/bulk',
    ]) {
      await request(app.getHttpServer())
        .post(`/api/${path}`)
        .send({})
        .expect(401);
    }
  });

  describe('POST /scan/plate', () => {
    it('returns up to five dish guesses with confidence, most likely first', async () => {
      respondWith({
        matches: [
          { title: 'Crepes', confidence: 0.2 },
          { title: 'Pancakes', confidence: 0.7 },
        ],
      });
      prompts.length = 0;
      const response = await dishes(await signUp()).expect(201);
      expect(response.body).toEqual({
        dishes: [
          { title: 'Pancakes', confidence: 0.7 },
          { title: 'Crepes', confidence: 0.2 },
        ],
        token: expect.stringMatching(/^[\w-]+\.[\w-]+$/) as string,
      });
      expect(prompts[0].images).toEqual([IMAGE]);
    });

    it('asks for dish titles in the Member’s UI language, Danish included', async () => {
      respondWith({ matches: [{ title: 'Æbleskiver', confidence: 0.8 }] });
      prompts.length = 0;
      await post(
        await signUpIn('da'),
        'scan/plate',
        { plateImage: IMAGE },
        'da',
      )
        .query({ locale: 'da' })
        .expect(201);
      expect(prompts[0].prompt).toMatch(/recipe titles in Danish/);
    });

    it('rejects a result the model got wrong with a stable code', async () => {
      respondWith({ matches: [{ title: 'Pancakes', confidence: 9 }] });
      const failed = await dishes(await signUp()).expect(502);
      expect(failed.body).toEqual({ code: 'scan.result_invalid', params: {} });
    });

    it('validates the image like every Scan, without using up a Scan', async () => {
      const cookie = await signUp();
      respondWith({ matches: [{ title: 'Pancakes', confidence: 0.7 }] });
      for (let i = 0; i < 5; i++) {
        const bad = await dishes(cookie, { plateImage: 'nope' }).expect(400);
        expect(bad.body).toEqual({
          code: 'scan.image_invalid',
          params: { field: 'plateImage' },
        });
      }
      const huge = `data:image/jpeg;base64,${'A'.repeat(7_100_000)}`;
      await dishes(cookie, { plateImage: huge }).expect(413);
      await dishes(cookie).expect(201);
    });

    it('counts against the Scan Cap, and a provider failure is refunded', async () => {
      const cookie = await signUp();
      next = () =>
        Promise.reject(new ApiException(502, 'scan.provider_unavailable'));
      for (let i = 0; i < 4; i++) await dishes(cookie).expect(502);

      respondWith({ matches: [{ title: 'Pancakes', confidence: 0.7 }] });
      for (let i = 0; i < 3; i++) await dishes(cookie).expect(201);
      prompts.length = 0;
      const blocked = await dishes(cookie).expect(429);
      expect(blocked.body).toEqual({
        code: 'scan.cap_reached',
        params: { cap: 3 },
      });
      expect(prompts).toHaveLength(0);
    });
  });

  describe('POST /scan/plate/recipe', () => {
    it('writes the dish as a Recipe Draft: lines with notes, Steps with timers, Tips, Servings and Tags; returns its id', async () => {
      const dinner = seedId.tag('meal:dinner');
      respondWith((request) => ({
        title: 'Fluffy pancakes',
        servings: 4,
        tagIndexes: [tagIndexIn(request.prompt, 'Dinner')],
        ingredients: [
          item(),
          item({
            ingredientId: flour,
            nameAsWritten: 'Flour',
            quantity: 250,
            unit: 'g',
            preparation: 'sifted',
          }),
          item({
            ingredientId: null,
            matchConfidence: 0,
            nameAsWritten: 'Grandma spice',
            quantity: null,
            unit: null,
            optional: true,
          }),
        ],
        steps: [
          { text: 'Whisk everything.', timerMinutes: null },
          { text: 'Fry each side.', timerMinutes: 2 },
        ],
        tips: [
          { stepIndex: null, text: 'Rest the batter first.' },
          { stepIndex: 1, text: 'Keep the heat medium.' },
        ],
      }));
      const cookie = await signUp();
      prompts.length = 0;
      const { recipeDraftId } = (await recipe(cookie).expect(201)).body as {
        recipeDraftId: string;
      };
      expect(recipeDraftId).toEqual(expect.any(String));
      expect(prompts[0].images ?? []).toEqual([]);
      expect(prompts[0].prompt).toContain('"Pancakes"');

      const draft = await draftOf(cookie, recipeDraftId);
      expect(draft).toMatchObject({ kind: 'new_recipe', baseRecipeId: null });
      expect(draft.content).toMatchObject({
        title: 'Fluffy pancakes',
        servings: '4',
        tagIds: [dinner],
        plateScan: true,
        // Standalone: no base picked.
        pickedBaseId: null,
        sourceLink: null,
      });
      expect(draft.content.lines).toMatchObject([
        {
          ingredientId: milk,
          quantity: '200',
          unit: 'ml',
          optional: false,
          note: '',
        },
        { ingredientId: flour, quantity: '250', unit: 'g', note: 'sifted' },
        { ingredientId: '', name: 'Grandma spice', optional: true },
      ]);
      expect(draft.content.steps).toMatchObject([
        { text: 'Whisk everything.', timer: '' },
        {
          text: 'Fry each side.',
          timer: '2',
          tips: [{ text: 'Keep the heat medium.' }],
        },
      ]);
      // The Tip of the whole Recipe stays a Recipe Tip; it is not folded onto a Step.
      expect(draft.content.tips).toEqual([{ text: 'Rest the batter first.' }]);
      expect(draft.content.steps[0].tips).toBeUndefined();
      // No Guidance is produced.
      expect(draft.content.guidance).toEqual({
        nutritionNote: '',
        pairings: [],
        eatingMoments: [],
      });
      expect(await draftCount(cookie)).toBe(1);
    });

    it('keeps a Step Tip on its own Step when a blank Step is dropped before it, and drops a Tip whose Step is gone', async () => {
      respondWith(
        written({
          steps: [
            { text: 'Whisk.', timerMinutes: null },
            { text: '   ', timerMinutes: null },
            { text: 'Fry.', timerMinutes: null },
          ],
          tips: [
            { stepIndex: 2, text: 'Medium heat.' },
            { stepIndex: 1, text: 'On the blank one.' },
            { stepIndex: 9, text: 'Nowhere.' },
          ],
        }),
      );
      const cookie = await signUp();
      const { recipeDraftId } = (await recipe(cookie).expect(201)).body as {
        recipeDraftId: string;
      };
      const { content } = await draftOf(cookie, recipeDraftId);
      expect(content.steps).toMatchObject([
        { text: 'Whisk.' },
        { text: 'Fry.', tips: [{ text: 'Medium heat.' }] },
      ]);
      expect(content.steps[0].tips).toBeUndefined();
      expect(content.tips ?? []).toEqual([]);
    });

    it('never trusts the model: an index outside the Catalog, a UUID or other value that is not an index, or a weak Match, is Unmatched', async () => {
      const lines = [
        item({
          ingredientIndex: '4b3f1f0a-0000-4000-8000-000000000000',
          ingredientId: undefined,
          nameAsWritten: 'Pixie dust',
        }),
        item({ matchConfidence: 0.2 }),
        item({ ingredientId: null, matchConfidence: 0 }),
        item({ ingredientIndex: 100_000, ingredientId: undefined }),
        item({ ingredientIndex: -1, ingredientId: undefined }),
        item({ ingredientIndex: 2.5, ingredientId: undefined }),
        item({ ingredientIndex: 'milk', ingredientId: undefined }),
      ];
      respondWith({ ...written(), ingredients: lines });
      prompts.length = 0;
      const cookie = await signUp();
      const { recipeDraftId } = (await recipe(cookie).expect(201)).body as {
        recipeDraftId: string;
      };
      const draft = await draftOf(cookie, recipeDraftId);
      expect(draft.content.lines.map((l) => l.ingredientId)).toEqual(
        lines.map(() => ''),
      );
      expectCatalogByIndex(prompts[0].prompt);
      expect(draft.content.lines[0].name).toBe('Pixie dust');
    });

    describe('Tags (#714)', () => {
      const dinner = seedId.tag('meal:dinner');
      const vegan = seedId.tag('diet:vegan');
      const database = () => app.get<Database>(DATABASE);
      const tagCount = async () =>
        (await database().select({ id: tags.id }).from(tags)).length;
      const familyTag = async (cookie: string, name: string) =>
        (
          (await post(cookie, 'recipes/tags', { name }).expect(200)).body as {
            id: string;
          }
        ).id;
      const stamp = Date.now();
      const tagIdsOf = async (cookie: string, response: { body: unknown }) =>
        (
          await draftOf(
            cookie,
            (response.body as { recipeDraftId: string }).recipeDraftId,
          )
        ).content.tagIds;

      it("offers the Catalog Tags and the Family's own, never another Family's, and proposes ids from them", async () => {
        const cookie = await signUp();
        const mine = `Mine plate ${stamp}`;
        const mineId = await familyTag(cookie, mine);
        const theirs = `Theirs plate ${stamp}`;
        await familyTag(await signUp(), theirs);
        respondWith((request) => ({
          ...written(),
          tagIndexes: [
            tagIndexIn(request.prompt, 'Dinner'),
            tagIndexIn(request.prompt, mine),
            tagIndexIn(request.prompt, 'Vegan'),
            100_000,
            -1,
            2.5,
            'Vegan',
            tagIndexIn(request.prompt, 'Dinner'),
          ],
        }));
        prompts.length = 0;
        const response = await recipe(cookie).expect(201);
        expect(await tagIdsOf(cookie, response)).toEqual([
          dinner,
          mineId,
          vegan,
        ]);
        const names = offeredTagNames(prompts[0].prompt);
        expect(names).toEqual(expect.arrayContaining(['Dinner', mine]));
        expect(names).not.toContain(theirs);
        expect(names.indexOf(mine)).toBe(names.length - 1);
      });

      it('creates no Tag, whatever the model names, and proposes none when it names none', async () => {
        const cookie = await signUp();
        const before = await tagCount();
        respondWith({ ...written(), tagIndexes: [0, 1], tags: ['Brand new'] });
        expect(
          await tagIdsOf(cookie, await recipe(cookie).expect(201)),
        ).toHaveLength(2);
        expect(await tagCount()).toBe(before);
        respondWith(written());
        expect(
          await tagIdsOf(cookie, await recipe(cookie).expect(201)),
        ).toEqual([]);
      });

      it('caps the proposals at 10', async () => {
        respondWith((request) => ({
          ...written(),
          tagIndexes: offeredTagNames(request.prompt).map((_, i) => i),
        }));
        const cookie = await signUp();
        expect(
          await tagIdsOf(cookie, await recipe(cookie).expect(201)),
        ).toHaveLength(10);
      });
    });

    it('is written in the Catalog Language and names Ingredients in it', async () => {
      respondWith(written({ title: 'Clătite' }));
      prompts.length = 0;
      const cookie = await signUpIn('ro');
      const { recipeDraftId } = (
        await recipe(cookie, 'Pancakes', 'ro').expect(201)
      ).body as { recipeDraftId: string };
      expect(prompts[0].prompt).toMatch(/in Romanian/);
      const draft = await draftOf(cookie, recipeDraftId);
      expect(draft.content.title).toBe('Clătite');
      expect(draft.content.lines[0].name).not.toBe('Milk');
    });

    it('rejects a result the model got wrong with a stable code, and keeps no Recipe Draft', async () => {
      respondWith({ ...written(), servings: 'four' });
      const cookie = await signUp();
      const failed = await recipe(cookie).expect(502);
      expect(failed.body).toEqual({ code: 'scan.result_invalid', params: {} });
      expect(await draftCount(cookie)).toBe(0);
    });

    it('requires a bounded dish title and does not call the provider otherwise', async () => {
      const cookie = await signUp();
      const token = await tokenFor(cookie);
      prompts.length = 0;
      await post(cookie, 'scan/plate/recipe', {}).expect(400);
      await recipe(cookie, '   ', 'en', token).expect(400);
      await recipe(cookie, 'x'.repeat(121), 'en', token).expect(400);
      expect(prompts).toHaveLength(0);
    });

    it('is gone from the old route', async () => {
      await post(await signUp(), 'scan/plate/ingredients', {}).expect(404);
    });

    describe('Plate token', () => {
      const rejected = { code: 'scan.plate_token_invalid', params: {} };
      const refuse = async (
        cookie: string,
        dishTitle: string,
        token: string | null,
      ) => {
        prompts.length = 0;
        const response = await recipe(cookie, dishTitle, 'en', token).expect(
          400,
        );
        expect(response.body).toEqual(rejected);
        expect(prompts).toHaveLength(0);
      };

      it('works for any dish the Scan guessed', async () => {
        const cookie = await signUp();
        respondWith(written());
        await recipe(cookie, 'Pancakes').expect(201);
        await recipe(cookie, 'Crepes').expect(201);
      });

      it('refuses a missing token, a made-up one and a title the Scan did not guess', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith(written());
        await refuse(cookie, 'Pancakes', null);
        await refuse(cookie, 'Pancakes', 'not-a-token');
        await refuse(cookie, 'Lasagne', token);
        expect(await draftCount(cookie)).toBe(0);
      });

      it('refuses a tampered token', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        const [body, signature] = token.split('.');
        const payload = JSON.parse(
          Buffer.from(body, 'base64url').toString(),
        ) as { t: string[] };
        payload.t.push('Lasagne');
        const forged = Buffer.from(JSON.stringify(payload)).toString(
          'base64url',
        );
        respondWith(written());
        await refuse(cookie, 'Lasagne', `${forged}.${signature}`);
      });

      it("refuses another Member's token", async () => {
        const token = await tokenFor(await signUp());
        respondWith(written());
        await refuse(await signUp(), 'Pancakes', token);
      });

      it('refuses an expired token', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith(written());
        const now = Date.now();
        const clock = jest
          .spyOn(Date, 'now')
          .mockReturnValue(now + PLATE_TOKEN_TTL_MS + 60_000);
        try {
          await refuse(cookie, 'Pancakes', token);
        } finally {
          clock.mockRestore();
        }
        await recipe(cookie, 'Pancakes', 'en', token).expect(201);
      });

      it('writes one dish per token: a replay is refused without a provider call, and makes no second draft', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith(written());
        await recipe(cookie, 'Pancakes', 'en', token).expect(201);
        await refuse(cookie, 'Pancakes', token);
        await refuse(cookie, ' Pancakes ', token);
        expect(await draftCount(cookie)).toBe(1);
      });

      it('refuses another signed title on the same token once one was written', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith(written());
        await recipe(cookie, 'Pancakes', 'en', token).expect(201);
        await refuse(cookie, 'Crepes', token);
      });

      it('lets exactly one of two concurrent requests on one token through', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        next = () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ data: written(), requestId: 'slow' }),
              50,
            ),
          );
        prompts.length = 0;
        const responses = await Promise.all([
          post(cookie, 'scan/plate/recipe', {
            dishTitle: 'Pancakes',
            plateToken: token,
          }),
          post(cookie, 'scan/plate/recipe', {
            dishTitle: 'Pancakes',
            plateToken: token,
          }),
        ]);
        expect(responses.map((r) => r.status).sort()).toEqual([201, 400]);
        expect(prompts).toHaveLength(1);
        expect(await draftCount(cookie)).toBe(1);
      });

      it('gives the token back when the provider fails, so the Member can retry', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith({ ...written(), servings: 'four' });
        await recipe(cookie, 'Pancakes', 'en', token).expect(502);
        next = () =>
          Promise.reject(new ApiException(502, 'scan.provider_unavailable'));
        await recipe(cookie, 'Pancakes', 'en', token).expect(502);
        respondWith(written());
        await recipe(cookie, 'Pancakes', 'en', token).expect(201);
        await refuse(cookie, 'Pancakes', token);
        expect(await draftCount(cookie)).toBe(1);
      });

      it('lets the Member pick another signed title after a provider failure', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith({ ...written(), servings: 'four' });
        await recipe(cookie, 'Pancakes', 'en', token).expect(502);
        respondWith(written());
        await recipe(cookie, 'Crepes', 'en', token).expect(201);
        await refuse(cookie, 'Pancakes', token);
      });

      it('refuses after 3 attempts in total, even when each failed', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith({ ...written(), servings: 'four' });
        await recipe(cookie, 'Pancakes', 'en', token).expect(502);
        await recipe(cookie, 'Pancakes', 'en', token).expect(502);
        await recipe(cookie, 'Pancakes', 'en', token).expect(502);
        respondWith(written());
        await refuse(cookie, 'Pancakes', token);
        expect(await draftCount(cookie)).toBe(0);
      });

      it('is the same Scan: writing the Recipe does not touch the Scan Cap', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith(written());
        await recipe(cookie, 'Pancakes', 'en', token).expect(201);
        // Cap is 3 and one Scan was used: two more photos still work, the third is blocked.
        respondWith({ matches: [{ title: 'Pancakes', confidence: 0.7 }] });
        await dishes(cookie).expect(201);
        await dishes(cookie).expect(201);
        await dishes(cookie).expect(429);
      });
    });
  });

  describe('a pick the server refuses or closes (ADR 0035)', () => {
    const blank = (title: string) => ({
      kind: 'new_recipe',
      content: {
        title,
        servings: '4',
        prepMinutes: '',
        cookMinutes: '',
        difficulty: '',
        lines: [],
        steps: [],
      },
    });
    const fillDrafts = async (cookie: string, count: number) => {
      for (let i = 0; i < count; i++) {
        await post(cookie, 'recipe-drafts', blank(`Held ${i}`)).expect(201);
      }
    };
    const balanceOf = async (cookie: string) =>
      (
        (
          await request(app.getHttpServer())
            .get('/api/credits')
            .set('origin', TEST_ORIGIN)
            .set('cookie', cookie)
            .expect(200)
        ).body as { balance: number }
      ).balance;

    it('refuses at 20 Recipe Drafts before the provider is called, charges nothing, and the token is still usable', async () => {
      const cookie = await signUp();
      const token = await tokenFor(cookie);
      await fillDrafts(cookie, 20);
      const before = await balanceOf(cookie);
      respondWith(written());
      prompts.length = 0;
      const refused = await recipe(cookie, 'Pancakes', 'en', token).expect(409);
      expect(refused.body).toEqual({
        code: 'recipe_drafts.limit_reached',
        params: { max: 20 },
      });
      expect(prompts).toHaveLength(0);
      expect(await balanceOf(cookie)).toBe(before);
      // Room again (one Recipe Draft discarded): the same token writes the dish.
      const [first] = (
        await request(app.getHttpServer())
          .get('/api/recipe-drafts')
          .set('origin', TEST_ORIGIN)
          .set('cookie', cookie)
          .expect(200)
      ).body as Array<{ id: string }>;
      await request(app.getHttpServer())
        .delete(`/api/recipe-drafts/${first.id}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .expect(204);
      await recipe(cookie, 'Pancakes', 'en', token).expect(201);
      expect(prompts).toHaveLength(1);
    });

    it('creates no Recipe Draft, charges no Credit and leaves the token usable when the request closes while writing', async () => {
      const cookie = await signUp();
      const token = await tokenFor(cookie);
      const before = await balanceOf(cookie);
      let release: () => void = () => undefined;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      next = async () => {
        await gate;
        return { data: written(), requestId: 'late' };
      };
      prompts.length = 0;
      signals.length = 0;
      const pending = post(cookie, 'scan/plate/recipe', {
        dishTitle: 'Pancakes',
        plateToken: token,
      });
      void pending.then(
        () => undefined,
        () => undefined,
      );
      const until = async (done: () => boolean) => {
        for (let i = 0; i < 300 && !done(); i++) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
        expect(done()).toBe(true);
      };
      await until(() => prompts.length === 1);
      pending.abort();
      await until(() => signals[0]?.aborted === true);
      release();
      // The server lets go: the held Credit is given back and the token claim released.
      respondWith(written());
      let retried: request.Response | undefined;
      for (let i = 0; i < 100; i++) {
        retried = await post(cookie, 'scan/plate/recipe', {
          dishTitle: 'Pancakes',
          plateToken: token,
        });
        if (retried.status !== 400) break;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      expect(retried?.status).toBe(201);
      // One draft (the retry's), one Credit charged (the retry's): the closed request left nothing.
      expect(await draftCount(cookie)).toBe(1);
      expect(await balanceOf(cookie)).toBe(before - 1);
    });
  });

  describe('POST /shopping-list/items/bulk', () => {
    const listOf = async (cookie: string) =>
      (
        await request(app.getHttpServer())
          .get('/api/shopping-list')
          .set('origin', TEST_ORIGIN)
          .set('cookie', cookie)
          .expect(200)
      ).body as List;
    const flat = (list: List) => list.groups.flatMap((g) => g.items);

    it('adds every line, merging with existing items and with each other', async () => {
      const cookie = await signUp();
      await post(cookie, 'shopping-list/items', {
        ingredientId: milk,
        quantity: 100,
        unit: 'ml',
      }).expect(200);
      const response = await bulk(cookie, [
        { ingredientId: milk, quantity: 200, unit: 'ml' },
        { ingredientId: flour, quantity: 60, unit: 'g' },
        { ingredientId: flour, quantity: 40, unit: 'g' },
        { name: 'Pixie dust', quantity: 1, unit: 'pcs' },
        { name: 'pixie  DUST', quantity: 2, unit: 'pcs' },
      ]).expect(200);
      const items = flat(response.body as List).map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        unmatched: i.unmatched,
      }));
      expect(items).toEqual(
        expect.arrayContaining([
          { name: 'Milk', quantity: 300, unit: 'ml', unmatched: false },
          { name: 'Flour', quantity: 100, unit: 'g', unmatched: false },
          { name: 'Pixie dust', quantity: 3, unit: 'pcs', unmatched: true },
        ]),
      );
      expect(items).toHaveLength(3);
      const { createdIds, insertedIds, ...list } = response.body as List & {
        createdIds: string[];
        insertedIds: string[];
      };
      expect(createdIds).toHaveLength(5);
      expect(insertedIds).toHaveLength(2); // flour and Pixie dust; milk merged
      expect(await listOf(cookie)).toEqual(list);
    });

    it('returns createdIds in request order: new lines get their own id, merged lines the id they merged into', async () => {
      const cookie = await signUp();
      const first = await post(cookie, 'shopping-list/items', {
        ingredientId: milk,
        quantity: 100,
        unit: 'ml',
      }).expect(200);
      const milkId = flat(first.body as List)[0].id;
      const response = await bulk(cookie, [
        { ingredientId: flour, quantity: 60, unit: 'g' },
        { ingredientId: milk, quantity: 200, unit: 'ml' },
        { ingredientId: flour, quantity: 40, unit: 'g' },
      ]).expect(200);
      const body = response.body as List & { createdIds: string[] };
      const flourId = flat(body).find((i) => i.name === 'Flour')?.id;
      expect(body.createdIds).toEqual([flourId, milkId, flourId]);
    });

    it('returns insertedIds apart from createdIds, so deleting them leaves a merged-into line alone', async () => {
      const cookie = await signUp();
      const first = await post(cookie, 'shopping-list/items', {
        ingredientId: milk,
        quantity: 100,
        unit: 'ml',
      }).expect(200);
      const milkId = flat(first.body as List)[0].id;
      const response = await bulk(cookie, [
        { ingredientId: milk, quantity: 200, unit: 'ml' },
        { ingredientId: flour, quantity: 60, unit: 'g' },
        { ingredientId: flour, quantity: 40, unit: 'g' },
      ]).expect(200);
      const body = response.body as List & {
        createdIds: string[];
        insertedIds: string[];
      };
      const flourId = flat(body).find((i) => i.name === 'Flour')?.id;
      expect(body.createdIds).toEqual([milkId, flourId, flourId]);
      expect(body.insertedIds).toEqual([flourId]);

      for (const id of body.insertedIds)
        await request(app.getHttpServer())
          .delete(`/api/shopping-list/items/${id}`)
          .set('Cookie', cookie)
          .expect(200);
      expect(flat(await listOf(cookie)).map((i) => i.id)).toEqual([milkId]);
    });

    describe('Unmatched queue', () => {
      const entriesFor = async (rawName: string) =>
        app
          .get<Database>(DATABASE)
          .select({
            source: unmatchedEntries.source,
            locale: unmatchedEntries.locale,
            shoppingItemId: unmatchedEntries.shoppingItemId,
          })
          .from(unmatchedEntries)
          .where(ilike(unmatchedEntries.rawName, rawName));

      it('queues a new free-text line once, with source manual and the stored Catalog Language; a merge adds none; a matched line adds none', async () => {
        const cookie = await signUpIn('ro');
        const raw = `Zzp pixie ${Date.now()}`;
        await post(
          cookie,
          'shopping-list/items/bulk',
          {
            items: [
              { name: raw, source: 'manual', quantity: 1, unit: 'pcs' },
              { ingredientId: milk, quantity: 100, unit: 'ml' },
            ],
          },
          'ro',
        ).expect(200);
        const first = await entriesFor(raw);
        expect(first).toHaveLength(1);
        expect(first[0]).toMatchObject({ source: 'manual', locale: 'ro' });
        expect(first[0].shoppingItemId).not.toBeNull();

        await post(
          cookie,
          'shopping-list/items/bulk',
          {
            items: [{ name: raw, source: 'manual', quantity: 2, unit: 'pcs' }],
          },
          'ro',
        ).expect(200);
        expect(await entriesFor(raw)).toHaveLength(1);

        await app
          .get<Database>(DATABASE)
          .delete(unmatchedEntries)
          .where(eq(unmatchedEntries.rawName, raw));
      });
    });

    it('is all or none: one bad line leaves the list untouched', async () => {
      const cookie = await signUp();
      await bulk(cookie, [
        { ingredientId: milk, quantity: 100, unit: 'ml' },
        { ingredientId: '4b3f1f0a-0000-4000-8000-000000000000' },
      ]).expect(404);
      expect(flat(await listOf(cookie))).toEqual([]);
    });

    it('validates the body', async () => {
      const cookie = await signUp();
      await bulk(cookie, []).expect(400);
      await bulk(cookie, [{ quantity: 1 }]).expect(400);
      await bulk(cookie, [{ ingredientId: milk, unit: 'cup' }]).expect(400);
      // A client can no longer claim the retired `plate` source (ADR 0035).
      await bulk(cookie, [{ name: 'Pixie', source: 'plate' }]).expect(400);
      await bulk(
        cookie,
        Array.from({ length: 101 }, () => ({ ingredientId: milk })),
      ).expect(400);
    });
  });

  describe('with a Catalog Language Preference', () => {
    // UI Language en, Catalog Language ro, Scan Language da: all three differ.
    async function member() {
      const cookie = await signUp();
      await request(app.getHttpServer())
        .put('/api/settings/preferences')
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .send({ locale: 'en', catalogLanguage: 'ro', scanLanguage: 'da' })
        .expect(200);
      return cookie;
    }

    it('asks for dish titles in the Catalog Language', async () => {
      const cookie = await member();
      respondWith({ matches: [{ title: 'Clatite', confidence: 0.8 }] });
      prompts.length = 0;
      await dishes(cookie).expect(201);
      expect(prompts[0].prompt).toMatch(/recipe titles in Romanian/);
    });

    it('writes the Recipe in the Catalog Language and names the match in it', async () => {
      const cookie = await member();
      respondWith(written());
      const token = await tokenFor(cookie);
      prompts.length = 0;
      const response = await post(cookie, 'scan/plate/recipe', {
        dishTitle: 'Pancakes',
        plateToken: token,
      }).expect(201);
      expect(prompts[0].prompt).toContain('in Romanian');
      const draft = await draftOf(
        cookie,
        (response.body as { recipeDraftId: string }).recipeDraftId,
      );
      expect(draft.content.lines[0].name).toBe('Lapte');
    });
  });
});
