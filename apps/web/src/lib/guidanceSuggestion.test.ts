import { describe, expect, it } from 'vitest';
import type { GuidanceDraft } from './guidanceDraft';
import { guidanceForRequest, mergeSuggestion } from './guidanceSuggestion';

const empty: GuidanceDraft = {
  nutritionNote: '',
  pairings: [],
  eatingMoments: [],
};
const use = {
  eatingMomentId: 'em1',
  polarity: 'avoid' as const,
  reason: 'Heavy.',
};

describe('mergeSuggestion: Eating Moments', () => {
  it('creates rows marked suggested, a missing reason becoming blank', () => {
    const { draft, filled } = mergeSuggestion(empty, {
      guidance: {
        eatingMoments: [use, { ...use, eatingMomentId: 'em2', reason: null }],
      },
      noSuggestions: [],
    });
    expect(filled).toEqual(['eatingMoments']);
    expect(draft.eatingMoments).toEqual([
      { ...use, suggested: true },
      { eatingMomentId: 'em2', polarity: 'avoid', reason: '', suggested: true },
    ]);
  });

  it('leaves Eating Moments the Member has now alone', () => {
    const own = {
      eatingMomentId: 'em9',
      polarity: 'good_for' as const,
      reason: '',
    };
    const { draft, filled } = mergeSuggestion(
      { ...empty, eatingMoments: [own] },
      { guidance: { eatingMoments: [use] }, noSuggestions: [] },
    );
    expect(filled).toEqual([]);
    expect(draft.eatingMoments).toEqual([own]);
  });

  it('never sends the mark in a request', () => {
    const { draft } = mergeSuggestion(empty, {
      guidance: { eatingMoments: [use] },
      noSuggestions: [],
    });
    const sent = guidanceForRequest(draft);
    expect(sent.eatingMoments).toEqual([use]);
    expect(JSON.stringify(sent)).not.toMatch(/suggested/);
  });
});
