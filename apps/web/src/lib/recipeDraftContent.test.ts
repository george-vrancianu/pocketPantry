import { describe, expect, it } from 'vitest';
import { emptyDraft } from './recipeDraft';
import { toGuidanceDraft } from './guidanceDraft';
import { contentOfForm, formOfContent } from './recipeDraftContent';

const blank = {
  draft: emptyDraft(),
  guidance: toGuidanceDraft({
    nutritionNote: null,
    pairings: [],
    eatingMoments: [],
  }),
};

describe('Recipe Draft content', () => {
  it('carries the origin: Source Link, language, picked base and Plate Scan flag, through a round trip', () => {
    const content = contentOfForm({
      ...blank,
      sourceLink: 'https://www.example.org/pancakes',
      sourceLanguage: 'fr',
      pickedBaseId: 'base-1',
      plateScan: true,
    });
    expect(content).toMatchObject({
      sourceLink: 'https://www.example.org/pancakes',
      sourceLanguage: 'fr',
      pickedBaseId: 'base-1',
      plateScan: true,
    });
    expect(formOfContent(content)).toMatchObject({
      sourceLink: 'https://www.example.org/pancakes',
      sourceLanguage: 'fr',
      pickedBaseId: 'base-1',
      plateScan: true,
    });
  });

  it('keeps the suggested markers of Guidance through a round trip and leaves them out when not set', () => {
    const guidance = {
      nutritionNote: 'Iron',
      nutritionNoteSuggested: true,
      pairings: [
        {
          key: 1,
          kind: 'food' as const,
          label: 'Salad',
          reason: 'Fresh',
          principle: '' as const,
          linkType: 'none' as const,
          linkTarget: '',
          suggested: true,
        },
        {
          key: 2,
          kind: 'food' as const,
          label: 'Bread',
          reason: 'Mine',
          principle: '' as const,
          linkType: 'none' as const,
          linkTarget: '',
        },
      ],
      eatingMoments: [
        {
          eatingMomentId: 'breakfast',
          polarity: 'good_for' as const,
          reason: '',
          suggested: true,
        },
      ],
    };
    const content = contentOfForm({ ...blank, guidance });
    expect(content.guidance?.nutritionNoteSuggested).toBe(true);
    expect(content.guidance?.pairings.map((p) => p.suggested)).toEqual([
      true,
      undefined,
    ]);
    expect(content.guidance?.pairings[0]).not.toHaveProperty('key');
    const back = formOfContent(content).guidance;
    expect(back?.nutritionNoteSuggested).toBe(true);
    expect(back?.pairings.map((p) => p.suggested)).toEqual([true, undefined]);
    expect(back?.eatingMoments[0].suggested).toBe(true);
    expect(contentOfForm({ ...blank }).guidance).not.toHaveProperty(
      'nutritionNoteSuggested',
    );
  });
});
