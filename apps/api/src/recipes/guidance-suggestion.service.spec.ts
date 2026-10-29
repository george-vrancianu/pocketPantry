import type { UsageRecordsService } from '../usage/usage-records.service';
import type { MeteredAiService } from '../usage/metered-ai.service';
import type { Database } from '../database/database.types';
import type { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import type { CreditsService } from '../credits/credits.service';
import { PaidReadsService } from '../scan/paid-reads.service';
import type { ScanCapService } from '../scan/scan-cap.service';
import type { SettingsService } from '../settings/settings.service';
import { GuidanceSuggestionService } from './guidance-suggestion.service';
import { suggestGuidanceBody } from './guidance-suggestion.schemas';
import type { RecipeBrowseService } from './recipe-browse.service';

const pairing = { kind: 'food', label: 'Mine', reason: 'Because.' };
const bodyOf = (guidance: object) =>
  suggestGuidanceBody.parse({
    recipe: { lines: [], steps: [] },
    guidance: {
      nutritionNote: null,
      pairings: [],
      eatingMoments: [],
      ...guidance,
    },
  });

const passthroughUsage = {
  inContext: <T>(_m: unknown, _k: unknown, run: () => Promise<T>) => run(),
} as unknown as UsageRecordsService;

describe('GuidanceSuggestionService with no Eating Moments to offer', () => {
  let generate: jest.Mock;
  let consume: jest.Mock;
  let refund: jest.Mock;
  let service: GuidanceSuggestionService;

  beforeEach(() => {
    generate = jest.fn();
    consume = jest.fn().mockResolvedValue('2026-01-01');
    refund = jest.fn().mockResolvedValue(undefined);
    service = new GuidanceSuggestionService(
      {} as unknown as Database,
      { generate } as unknown as MeteredAiService,
      {
        getCatalogIn: jest
          .fn()
          .mockResolvedValue({ categories: [], ingredients: [] }),
      } as unknown as IngredientCatalogService,
      {
        filters: jest.fn().mockResolvedValue({ tags: [], eatingMoments: [] }),
      } as unknown as RecipeBrowseService,
      {
        familyIdOf: jest.fn().mockResolvedValue('family'),
      } as unknown as SettingsService,
      new PaidReadsService(
        { consume, refund } as unknown as ScanCapService,
        {
          priceOf: jest.fn().mockReturnValue(1),
          hold: jest.fn().mockResolvedValue({ id: 'hold' }),
          release: jest.fn(),
        } as unknown as CreditsService,
        passthroughUsage,
      ),
    );
  });

  it('answers "no suggestions" without counting a use or calling the AI when only Eating Moments are empty', async () => {
    const result = await service.suggest(
      'member',
      bodyOf({ nutritionNote: 'Mine.', pairings: [pairing] }),
      'en',
    );
    expect(result).toEqual({ guidance: {}, noSuggestions: ['eatingMoments'] });
    expect(generate).not.toHaveBeenCalled();
    expect(consume).not.toHaveBeenCalled();
  });

  it('does not ask for Eating Moments when other fields are asked, and reports them in order', async () => {
    generate.mockResolvedValue({
      data: { nutritionNote: null, pairings: null, eatingMoments: null },
      requestId: 'r',
    });
    const result = await service.suggest(
      'member',
      bodyOf({ pairings: [pairing] }),
      'en',
    );
    expect(result).toEqual({
      guidance: {},
      noSuggestions: ['nutritionNote', 'eatingMoments'],
    });
    const { prompt } = (generate.mock.calls as [{ prompt: string }][])[0][0];
    expect(prompt).toContain('nutritionNote:');
    expect(prompt).not.toContain('eatingMoments:');
    expect(consume).toHaveBeenCalledTimes(1);
    expect(refund).toHaveBeenCalledTimes(1);
  });
});
