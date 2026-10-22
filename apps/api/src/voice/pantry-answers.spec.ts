import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import {
  answerPantryQuestions,
  type AnswerBatch,
  type AnswerContext,
} from './pantry-answers';
import type { VoiceLocation, VoiceUnit } from './voice-actions';

type FixtureBatch = {
  quantity: number | null;
  unit: VoiceUnit | null;
  location: VoiceLocation;
  expiryDate: string | null;
};
const fixture = JSON.parse(
  readFileSync(
    resolve(process.cwd(), '../../fixtures/pantry-answers.json'),
    'utf8',
  ),
) as {
  today: string;
  cases: Array<{
    name: string;
    staleThresholdDays: number;
    batches: FixtureBatch[];
    expected: {
      totals: Array<{ unit: string; quantity: number }>;
      locations: string[];
      expiringSoon: boolean;
    };
  }>;
};

const MILK = 'milk-id';
const ingredient = (id: string): CatalogSearchResult =>
  ({ id, name: id }) as CatalogSearchResult;
const question = (id: string = MILK) => ({
  id: `q-${id}`,
  text: id,
  ingredient: ingredient(id),
  name: null,
});
const unmatchedQuestion = (name: string) => ({
  id: `q-${name}`,
  text: name,
  ingredient: null,
  name,
});
const batch = (overrides: Partial<AnswerBatch> = {}): AnswerBatch => ({
  ingredientId: MILK,
  name: 'Milk',
  quantity: 1,
  unit: 'l',
  location: 'fridge',
  expiryDate: null,
  ...overrides,
});
const context = (overrides: Partial<AnswerContext> = {}): AnswerContext => ({
  batches: [],
  shoppingIngredientIds: new Set(),
  unmatchedShoppingNames: [],
  runningLowIds: new Set(),
  pantryBasicIds: new Set(),
  staleThresholdDays: 3,
  today: fixture.today,
  ...overrides,
});
const ask = (overrides: Partial<AnswerContext>, id = MILK) =>
  answerPantryQuestions([question(id)], context(overrides))[0];

// Spec: #461, ADR 0020. The same fixture runs against the web Pantry roll-up.
describe('answerPantryQuestions', () => {
  describe.each(fixture.cases)('shared fixture: $name', (testCase) => {
    it('reports totals, Locations and Expiring Soon', () => {
      const answer = ask({
        batches: testCase.batches.map((entry) => batch(entry)),
        staleThresholdDays: testCase.staleThresholdDays,
      });
      expect(answer).toMatchObject({ kind: 'yes', ...testCase.expected });
    });
  });

  it('flags Running low on a yes', () => {
    expect(
      ask({ batches: [batch()], runningLowIds: new Set([MILK]) }),
    ).toMatchObject({ kind: 'yes', runningLow: true });
    expect(ask({ batches: [batch()] })).toMatchObject({
      kind: 'yes',
      runningLow: false,
    });
  });

  it('ignores the Batches of other Ingredients', () => {
    const answer = ask({
      batches: [
        batch(),
        batch({ ingredientId: 'eggs', quantity: 6, unit: 'pcs' }),
      ],
    });
    expect(answer).toMatchObject({
      totals: [{ unit: 'l', quantity: 1 }],
    });
  });

  it('answers only expired when every Batch is Expired, with the Shopping List', () => {
    const batches = [batch({ expiryDate: '2026-06-01' })];
    expect(ask({ batches })).toMatchObject({
      kind: 'onlyExpired',
      onShoppingList: false,
    });
    expect(
      ask({ batches, shoppingIngredientIds: new Set([MILK]) }),
    ).toMatchObject({ kind: 'onlyExpired', onShoppingList: true });
  });

  it('answers no with no Batch, with the Shopping List', () => {
    expect(ask({})).toMatchObject({ kind: 'no', onShoppingList: false });
    expect(ask({ shoppingIngredientIds: new Set([MILK]) })).toMatchObject({
      kind: 'no',
      onShoppingList: true,
    });
  });

  it('answers yes for a Pantry Basic with no Batch, with no details', () => {
    expect(ask({ pantryBasicIds: new Set(['salt']) }, 'salt')).toMatchObject({
      kind: 'yes',
      totals: [],
      locations: [],
      expiringSoon: false,
    });
  });

  it('answers a Pantry Basic by its Batches when it has some', () => {
    expect(
      ask(
        {
          batches: [batch({ ingredientId: 'salt', expiryDate: '2026-06-01' })],
          pantryBasicIds: new Set(['salt']),
        },
        'salt',
      ),
    ).toMatchObject({ kind: 'onlyExpired' });
  });

  describe('a name with no Match', () => {
    const zorblax = (overrides: Partial<AnswerBatch> = {}) =>
      batch({ ingredientId: null, name: 'Zorblax', ...overrides });
    const askName = (name: string, overrides: Partial<AnswerContext> = {}) =>
      answerPantryQuestions([unmatchedQuestion(name)], context(overrides))[0];

    it('is not sure with no Unmatched row, never no', () => {
      // Matched rows of the same spelling do not count: only Unmatched rows are looked up.
      expect(
        askName('zorblax', {
          batches: [batch({ name: 'zorblax' })],
          shoppingIngredientIds: new Set(['zorblax']),
        }),
      ).toMatchObject({ kind: 'notSure', ingredient: null, name: 'zorblax' });
    });

    it('answers yes from an Unmatched Batch of the same normalised name', () => {
      expect(
        askName('  ZORBLAX ', {
          batches: [zorblax({ quantity: 2, unit: 'kg' })],
        }),
      ).toMatchObject({
        kind: 'yes',
        totals: [{ unit: 'kg', quantity: 2 }],
        locations: ['fridge'],
        runningLow: false,
      });
    });

    it('answers only expired when every Unmatched Batch is Expired', () => {
      expect(
        askName('zorblax', {
          batches: [zorblax({ expiryDate: '2026-06-01' })],
        }),
      ).toMatchObject({ kind: 'onlyExpired', onShoppingList: false });
    });

    it('answers no on the Shopping List from an Unmatched Shopping Item alone', () => {
      expect(
        askName('Zorblax', { unmatchedShoppingNames: ['zorblax'] }),
      ).toMatchObject({ kind: 'no', onShoppingList: true });
    });
  });
});
