import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { ApiException } from '../src/common/api-exception';
import { user } from '../src/database/schema';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { PantryService } from '../src/pantry/pantry.service';
import { ShoppingService } from '../src/shopping/shopping.service';
import type { VoiceActionDraft } from '../src/voice/voice-actions';
import { VoiceService } from '../src/voice/voice.service';
import { catalogIndexIn, UUID_PATTERN } from './support/catalog-indices';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

describe('VoiceService without audio or Review (integration)', () => {
  let app: NestFastifyApplication;
  let voice: VoiceService;
  let shopping: ShoppingService;
  let pantry: PantryService;
  let reading: { actions: object[]; unsupported: string[] };
  let aiFailure: ApiException | null = null;
  const aiCalls: StructuredOutputRequest[] = [];
  let counter = 0;

  /** Builds the reading from the request, for a test that needs the prompt's Catalog. */
  let readingFor: ((input: StructuredOutputRequest) => void) | null = null;

  beforeAll(async () => {
    const ai = {
      generate: (input: StructuredOutputRequest) => {
        aiCalls.push(input);
        if (aiFailure) return Promise.reject(aiFailure);
        readingFor?.(input);
        return Promise.resolve({
          data: { spokenLanguage: null, ...reading },
          requestId: 'req-1',
        });
      },
    };
    app = await createTestApp([], ai);
    voice = app.get(VoiceService);
    shopping = app.get(ShoppingService);
    pantry = app.get(PantryService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    reading = { actions: [], unsupported: [] };
    readingFor = null;
    aiFailure = null;
    aiCalls.length = 0;
  });

  async function signUpMember(): Promise<string> {
    const n = ++counter;
    const email = `voice-service-${Date.now()}-${n}@example.com`;
    await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.44.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `VoiceService ${n}`,
        email,
        password: 'correct-horse-staple',
      })
      .expect(200);
    const [row] = await app
      .get<Database>(DATABASE)
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email));
    return row.id;
  }

  const model = (overrides: Record<string, unknown>) => ({
    target: 'shopping',
    op: 'add',
    spokenText: 'eggs',
    matchedIngredientId: seedId.ingredient('eggs'),
    matchConfidence: 0.95,
    fallbackIngredientName: 'Eggs',
    spokenName: 'Eggs',
    quantity: null,
    unit: null,
    scope: null,
    expiresOn: null,
    noExpiry: false,
    location: null,
    ...overrides,
  });

  const draft = (fields: Partial<VoiceActionDraft>): VoiceActionDraft => ({
    id: 'a1',
    target: 'shopping',
    op: 'add',
    text: '',
    ingredientId: null,
    name: null,
    quantity: null,
    unit: null,
    scope: null,
    expiresOn: null,
    noExpiry: false,
    location: null,
    batchId: null,
    batchIds: [],
    ...fields,
  });

  const textInput = {
    text: 'add eggs to the list',
    spokenLanguage: 'en',
    locale: 'en',
    today: '2026-10-16',
    defaultTarget: 'shopping',
  } as const;

  const shoppingNames = async (memberId: string) =>
    ((await shopping.peekList(memberId, 'en'))?.groups ?? [])
      .flatMap((group) => group.items)
      .map((item) => item.name);

  describe('readText', () => {
    it('reads plain text into resolved Voice Actions without audio or a cap charge', async () => {
      const memberId = await signUpMember();
      reading = {
        actions: [model({ quantity: 6, unit: 'pcs' })],
        unsupported: ['do a barrel roll'],
      };

      const { actions } = await voice.readText(memberId, textInput);

      expect(actions.map((a) => [a.op, a.status, a.text])).toEqual([
        ['add', 'ready', 'eggs'],
        [null, 'notUnderstood', 'do a barrel roll'],
      ]);
      expect(actions[0]).toMatchObject({
        target: 'shopping',
        quantity: 6,
        unit: 'pcs',
        ingredient: { id: seedId.ingredient('eggs') },
      });
      expect(aiCalls).toHaveLength(1);
      expect(JSON.stringify(aiCalls[0])).toContain('add eggs to the list');
      expect(await shoppingNames(memberId)).toEqual([]);
    });

    it('resolves against the Member current Shopping List', async () => {
      const memberId = await signUpMember();
      await shopping.addItem(
        memberId,
        { ingredientId: seedId.ingredient('eggs') },
        'en',
      );
      reading = { actions: [model({ op: 'check' })], unsupported: [] };

      const {
        actions: [action],
      } = await voice.readText(memberId, textInput);

      expect(action.rows.shoppingItem).toMatchObject({ name: 'Eggs' });
    });

    it('names Catalog Ingredients by index, never by UUID, and resolves the index the model chose', async () => {
      const memberId = await signUpMember();
      readingFor = (input) => {
        reading = {
          actions: [
            model({
              matchedIngredientId: catalogIndexIn(input.prompt, 'Eggs'),
            }),
          ],
          unsupported: [],
        };
      };

      const { actions } = await voice.readText(memberId, textInput);

      expect(actions[0]).toMatchObject({
        ingredient: { id: seedId.ingredient('eggs') },
      });
      expect(aiCalls[0].prompt).not.toMatch(UUID_PATTERN);
    });

    it('leaves an action Unmatched when the model gives an index outside the Catalog, or not an index', async () => {
      const memberId = await signUpMember();
      reading = {
        actions: [100_000, -1, 2.5, 'eggs'].map((index) =>
          model({
            matchedIngredientId: index,
            spokenText: 'zzyzx',
            fallbackIngredientName: 'Zzyzx mystery',
          }),
        ),
        unsupported: [],
      };

      const { actions } = await voice.readText(memberId, textInput);

      expect(actions.map((a) => a.ingredient)).toEqual([
        null,
        null,
        null,
        null,
      ]);
    });

    it('maps a provider failure to voice.provider_unavailable', async () => {
      const memberId = await signUpMember();
      aiFailure = new ApiException(502, 'scan.provider_unavailable');

      await expect(voice.readText(memberId, textInput)).rejects.toMatchObject({
        code: 'voice.provider_unavailable',
      });
    });
  });

  describe('applyActions', () => {
    const eggs = { ingredientId: seedId.ingredient('eggs') };
    const milk = { ingredientId: seedId.ingredient('milk') };
    const base = { locale: 'en', today: '2026-10-16' } as const;
    const safe = new Set(['shopping.add', 'pantry.runningLow'] as const);

    it('applies everything when no allowed set is given', async () => {
      const memberId = await signUpMember();

      const result = await voice.applyActions(memberId, {
        ...base,
        actions: [
          draft({ id: 'add', ...eggs }),
          draft({ id: 'pantry', target: 'pantry', ...milk }),
        ],
      });

      expect(result.applied.map((a) => a.actionId)).toEqual(['add', 'pantry']);
      expect(result.refused).toBeUndefined();
      expect(await shoppingNames(memberId)).toEqual(['Eggs']);
      expect(await pantry.list(memberId, 'en')).toHaveLength(1);
    });

    it('applies an allowed action', async () => {
      const memberId = await signUpMember();

      const result = await voice.applyActions(memberId, {
        ...base,
        allowedKinds: safe,
        actions: [draft({ id: 'add', ...eggs })],
      });

      expect(result).toMatchObject({
        applied: [{ actionId: 'add', list: 'shopping' }],
        skipped: [],
        refused: [],
      });
      expect(await shoppingNames(memberId)).toEqual(['Eggs']);
    });

    it('refuses a kind outside the allowed set and writes nothing', async () => {
      const memberId = await signUpMember();
      await shopping.addItem(memberId, eggs, 'en');

      const result = await voice.applyActions(memberId, {
        ...base,
        allowedKinds: safe,
        actions: [
          draft({ id: 'rm', op: 'remove', scope: 'one', ...eggs }),
          draft({ id: 'pantry', target: 'pantry', ...milk }),
        ],
      });

      expect(result.applied).toEqual([]);
      expect(result.skipped).toEqual([]);
      expect(result.refused).toEqual([
        { id: 'rm', kind: 'shopping.remove', reason: 'voice.kind_not_allowed' },
        {
          id: 'pantry',
          kind: 'pantry.add',
          reason: 'voice.kind_not_allowed',
        },
      ]);
      expect(await shoppingNames(memberId)).toEqual(['Eggs']);
      expect(await pantry.list(memberId, 'en')).toEqual([]);
    });

    it('applies only the allowed part of a mixed list', async () => {
      const memberId = await signUpMember();
      await shopping.addItem(memberId, eggs, 'en');

      const result = await voice.applyActions(memberId, {
        ...base,
        allowedKinds: safe,
        actions: [
          draft({ id: 'rm', op: 'remove', scope: 'one', ...eggs }),
          draft({ id: 'add', ...milk }),
        ],
      });

      expect(result.applied.map((a) => a.actionId)).toEqual(['add']);
      expect(result.refused?.map((r) => r.id)).toEqual(['rm']);
      expect((await shoppingNames(memberId)).sort()).toEqual(['Eggs', 'Milk']);
    });
  });
});
