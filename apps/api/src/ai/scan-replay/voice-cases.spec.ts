import type { ModelVoiceAction } from '../../voice/voice-actions';
import type { VoiceCatalog } from './voice-catalog';
import {
  compareActions,
  compareTranscripts,
  normalizeActions,
  voiceCaseFileSchema,
} from './voice-cases';

const none = { en: [], ro: [], da: [] };
const catalog: VoiceCatalog = {
  categories: ['Dairy', 'Fruit'],
  ingredients: [
    {
      id: '00000000-0000-4000-8000-000000000001',
      category: 'Dairy',
      defaultUnit: 'l',
      names: { en: 'Milk', ro: 'Lapte', da: 'Mælk' },
      synonyms: { en: ['cow milk'], ro: [], da: ['sødmælk'] },
    },
    {
      id: '00000000-0000-4000-8000-000000000002',
      category: 'Fruit',
      defaultUnit: 'pcs',
      names: { en: 'Apple', ro: 'Mere', da: 'Æbler' },
      synonyms: none,
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      category: 'Fruit',
      defaultUnit: 'pcs',
      names: { en: 'Apple pie', ro: 'Plăcintă', da: 'Æbletærte' },
      synonyms: { en: ['pie'], ro: [], da: [] },
    },
    {
      id: '00000000-0000-4000-8000-000000000004',
      category: 'Fruit',
      defaultUnit: 'pcs',
      names: { en: 'Pear pie', ro: 'Plăcintă cu pere', da: 'Pæretærte' },
      synonyms: { en: ['pie'], ro: [], da: [] },
    },
  ],
};
const MILK = '00000000-0000-4000-8000-000000000001';

const modelAction = (
  overrides: Partial<ModelVoiceAction> = {},
): ModelVoiceAction => ({
  target: 'shopping',
  op: 'add',
  spokenText: 'milk',
  matchedIngredientId: MILK,
  matchConfidence: 0.9,
  fallbackIngredientName: 'Milk',
  quantity: null,
  unit: null,
  scope: null,
  expiresOn: null,
  noExpiry: false,
  location: null,
  ...overrides,
});

describe('normalizeActions', () => {
  it('names a confident Match by its Catalog name in the locale, as Review would show it', () => {
    const [action] = normalizeActions(
      { actions: [modelAction()], unsupported: [] },
      catalog,
      'ro',
      0.6,
    );
    expect(action.ingredient).toBe('Lapte');
  });

  it('falls back to the generic name when the Match is doubted or unknown', () => {
    const doubted = modelAction({ matchConfidence: 0.3 });
    const invented = modelAction({
      matchedIngredientId: '00000000-0000-4000-8000-0000000000ff',
      fallbackIngredientName: 'Quinoa crackers',
    });
    const out = normalizeActions(
      { actions: [doubted, invented], unsupported: [] },
      catalog,
      'en',
      0.6,
    );
    expect(out.map((a) => a.ingredient)).toEqual(['Milk', 'Quinoa crackers']);
  });

  it('rescues a doubted or missing Match by an exact name or Synonym, as the app does', () => {
    const out = normalizeActions(
      {
        actions: [
          modelAction({
            matchConfidence: 0.2,
            fallbackIngredientName: 'Cow milk',
          }),
          modelAction({
            matchedIngredientId: null,
            matchConfidence: 0,
            fallbackIngredientName: 'dairy thing',
            spokenText: 'sødmælk',
          }),
          modelAction({
            matchedIngredientId: null,
            matchConfidence: 0,
            fallbackIngredientName: 'Pie',
            spokenText: 'a pie',
          }),
          modelAction({
            matchedIngredientId: '00000000-0000-4000-8000-0000000000ff',
            matchConfidence: 0.9,
            fallbackIngredientName: 'Apple',
          }),
        ],
        unsupported: [],
      },
      catalog,
      'da',
      0.6,
    );
    // The doubted proposal gives way to the exact hit; "Pie" is claimed by two Ingredients;
    // a confident but unknown id is not looked up by name.
    expect(out.map((a) => a.ingredient)).toEqual([
      'Mælk',
      'Mælk',
      'Pie',
      'Apple',
    ]);
  });

  it('counts a bare number as pieces, and drops the date of a no-expiry action', () => {
    const [add, check] = normalizeActions(
      {
        actions: [
          modelAction({ quantity: 3, unit: null, expiresOn: '2026-10-20' }),
          modelAction({ op: 'check', quantity: 2, unit: null }),
        ],
        unsupported: [],
      },
      catalog,
      'en',
      0.6,
    );
    expect(add).toMatchObject({ quantity: 3, unit: 'pcs' });
    // Check keeps the item's own unit when none was spoken.
    expect(check).toMatchObject({ quantity: 2, unit: null });
    const [noExpiry] = normalizeActions(
      {
        actions: [modelAction({ noExpiry: true, expiresOn: '2026-10-20' })],
        unsupported: [],
      },
      catalog,
      'en',
      0.6,
    );
    expect(noExpiry).toMatchObject({ noExpiry: true, expiresOn: null });
  });
});

const expected = (overrides: Record<string, unknown> = {}) => ({
  target: 'shopping' as const,
  op: 'add' as const,
  ingredient: 'Milk',
  quantity: null,
  unit: null,
  expiresOn: null,
  noExpiry: false,
  ...overrides,
});
const actual = (overrides: Record<string, unknown> = {}) => ({
  ...expected(),
  scope: null,
  location: null,
  ...overrides,
});

describe('compareActions', () => {
  it('passes when every expected action was read and nothing else', () => {
    const result = compareActions(
      { actions: [expected()], unsupported: 1 },
      { actions: [actual()], unsupported: ['what is the weather'] },
    );
    expect(result).toMatchObject({
      passed: true,
      matched: 1,
      mismatched: [],
      missing: [],
      extra: [],
    });
  });

  it('reports a field that differs as a mismatch, not a match', () => {
    const result = compareActions(
      { actions: [expected({ quantity: 3, unit: 'pcs' })], unsupported: 0 },
      { actions: [actual({ quantity: 2, unit: 'pcs' })], unsupported: [] },
    );
    expect(result.passed).toBe(false);
    expect(result.matched).toBe(0);
    expect(result.mismatched).toEqual([
      expect.objectContaining({
        diffs: [{ field: 'quantity', expected: 3, actual: 2 }],
      }),
    ]);
  });

  it('reports an action not read as missing and one not asked for as extra', () => {
    const result = compareActions(
      {
        actions: [expected(), expected({ ingredient: 'Apples' })],
        unsupported: 0,
      },
      {
        actions: [actual(), actual({ ingredient: 'Pears' })],
        unsupported: [],
      },
    );
    expect(result.matched).toBe(1);
    expect(result.missing).toEqual([
      expect.objectContaining({ ingredient: 'Apples' }),
    ]);
    expect(result.extra).toEqual([
      expect.objectContaining({ ingredient: 'Pears' }),
    ]);
  });

  it('pairs actions by target, op and Ingredient whatever the order, and by Ingredient alone as a mismatch', () => {
    const result = compareActions(
      {
        actions: [
          expected({ ingredient: 'Apples' }),
          expected({ op: 'remove' }),
        ],
        unsupported: 0,
      },
      {
        actions: [actual({ op: 'uncheck' }), actual({ ingredient: 'Apples' })],
        unsupported: [],
      },
    );
    expect(result.matched).toBe(1);
    expect(result.mismatched).toEqual([
      expect.objectContaining({
        diffs: [{ field: 'op', expected: 'remove', actual: 'uncheck' }],
      }),
    ]);
    expect(result.missing).toEqual([]);
    expect(result.extra).toEqual([]);
  });

  it('accepts any listed name for an Ingredient, ignoring case', () => {
    const result = compareActions(
      {
        actions: [expected({ ingredient: ['Yoghurt', 'Yogurt'] })],
        unsupported: 0,
      },
      { actions: [actual({ ingredient: 'yogurt' })], unsupported: [] },
    );
    expect(result.passed).toBe(true);
  });

  it('checks scope and location only when the case states them', () => {
    const base = { unsupported: 0 };
    expect(
      compareActions(
        { ...base, actions: [expected()] },
        {
          actions: [actual({ scope: 'all', location: 'fridge' })],
          unsupported: [],
        },
      ).passed,
    ).toBe(true);
    expect(
      compareActions(
        { ...base, actions: [expected({ scope: 'all' })] },
        { actions: [actual({ scope: 'one' })], unsupported: [] },
      ).mismatched,
    ).toHaveLength(1);
  });

  it('fails when the number of unsupported phrases differs', () => {
    const result = compareActions(
      { actions: [], unsupported: 1 },
      { actions: [], unsupported: [] },
    );
    expect(result.passed).toBe(false);
    expect(result.unsupported).toEqual({ expected: 1, actual: 0 });
  });
});

describe('compareTranscripts', () => {
  it('ignores case, punctuation and spacing', () => {
    expect(
      compareTranscripts('Add milk, please.', 'add  milk please'),
    ).toMatchObject({ exact: true, wordErrors: 0, words: 3 });
  });

  it('counts word substitutions, insertions and deletions', () => {
    const result = compareTranscripts('add two apples', 'add to apples please');
    expect(result).toMatchObject({ exact: false, wordErrors: 2, words: 3 });
    expect(result.wer).toBeCloseTo(2 / 3);
  });

  it('keeps diacritics', () => {
    expect(compareTranscripts('adaugă lapte', 'adauga lapte').wordErrors).toBe(
      1,
    );
  });
});

describe('voiceCaseFileSchema', () => {
  const file = (caseOverrides: Record<string, unknown> = {}) => ({
    source: 'synthetic',
    cases: [
      {
        id: 'en-01',
        scanLanguage: 'en',
        tags: ['units'],
        transcript: 'add milk',
        expected: { actions: [expected()] },
        ...caseOverrides,
      },
    ],
  });

  it('fills in the context a read needs', () => {
    const [parsed] = voiceCaseFileSchema.parse(file()).cases;
    expect(parsed).toMatchObject({
      locale: 'en',
      defaultTarget: 'shopping',
      shoppingList: [],
      pantry: [],
      expected: { unsupported: 0 },
    });
    expect(parsed.today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('rejects a quantity without a unit, an unknown tag and a bad date', () => {
    const bad = (overrides: Record<string, unknown>) =>
      voiceCaseFileSchema.safeParse(file(overrides)).success;
    expect(
      bad({ expected: { actions: [expected({ quantity: 2, unit: null })] } }),
    ).toBe(false);
    expect(bad({ tags: ['nonsense'] })).toBe(false);
    expect(bad({ today: '2026-02-31' })).toBe(false);
    expect(bad({ tags: [] })).toBe(false);
  });
});
