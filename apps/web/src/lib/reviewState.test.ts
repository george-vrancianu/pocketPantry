import { describe, expect, it } from 'vitest';
import type { CatalogSearchResult } from './catalog';
import { toReviewLine, type ReviewLine } from './review';
import {
  initReviewState,
  reviewCounts,
  reviewGroups,
  reviewReducer,
  type ReviewAction,
  type ReviewState,
} from './reviewState';
import type { ProposedLine } from './scan';

const today = new Date(2026, 9, 1);

const butter: CatalogSearchResult = {
  id: 'butter-id',
  name: 'Butter',
  defaultUnit: 'g',
  leafCategory: { id: 'butter', name: 'Butter' },
  parentCategory: { id: 'dairy', name: 'Dairy', aisle: 'Dairy' },
  defaults: { expiryDays: 30, location: 'fridge' },
};
const milk: CatalogSearchResult = {
  ...butter,
  id: 'milk-id',
  name: 'Milk',
  defaultUnit: 'l',
};

const proposed = (overrides: Partial<ProposedLine>): ProposedLine => ({
  name: 'Butter',
  match: butter,
  lowConfidence: false,
  quantity: 180,
  unit: 'g',
  expiryDate: null,
  productDescription: null,
  ...overrides,
});

/** Receipt order: ok, qty, low, Unmatched, ok, excluded. */
function start(): ReviewState {
  const lines: ReviewLine[] = [
    proposed({ name: 'Butter' }),
    proposed({ name: 'Milk', match: milk, quantity: null }),
    proposed({ name: 'Beer', lowConfidence: true }),
    proposed({ name: 'Mystery', match: null }),
    proposed({ name: 'Butter 2' }),
    proposed({ name: 'Bag', match: null, excluded: { reason: 'not_food' } }),
  ].map((line, index) => toReviewLine(line, `k${index}`, today));
  return initReviewState(lines);
}

const run = (state: ReviewState, ...actions: ReviewAction[]) =>
  actions.reduce(reviewReducer, state);
const keys = (lines: ReviewLine[]) => lines.map((line) => line.key);

describe('review groups', () => {
  it('puts low rows first, then missing quantities, each in receipt order', () => {
    const groups = reviewGroups(start());
    expect(keys(groups.review)).toEqual(['k2', 'k3', 'k1']);
    expect(keys(groups.sure)).toEqual(['k0', 'k4']);
    expect(keys(groups.excluded)).toEqual(['k5']);
  });

  it('counts lines to save, to check and excluded', () => {
    expect(reviewCounts(start())).toEqual({ save: 5, check: 3, excluded: 1 });
  });
});

describe('initReviewState', () => {
  it('opens the low rows only, with the sure group shown', () => {
    const state = start();
    expect(state.open).toEqual({ k2: true, k3: true });
    expect(state.sureOpen).toBe(true);
  });
});

describe('reviewReducer', () => {
  it('toggles a row open and shut', () => {
    const opened = run(start(), { type: 'toggle', key: 'k1' });
    expect(opened.open.k1).toBe(true);
    expect(run(opened, { type: 'toggle', key: 'k1' }).open.k1).toBeFalsy();
  });

  it('confirming moves a row to Sigure and shuts it', () => {
    const state = run(start(), { type: 'confirm', key: 'k2' });
    expect(state.open.k2).toBeFalsy();
    expect(keys(reviewGroups(state).sure)).toEqual(['k0', 'k2', 'k4']);
    expect(reviewCounts(state).check).toBe(2);
  });

  it('keeps an open row in its group while the Member edits it, and moves it once shut', () => {
    const typing = run(
      start(),
      { type: 'toggle', key: 'k1' },
      { type: 'update', key: 'k1', patch: { quantity: '2' } },
    );
    expect(keys(reviewGroups(typing).review)).toContain('k1');
    const shut = run(typing, { type: 'toggle', key: 'k1' });
    expect(keys(reviewGroups(shut).sure)).toContain('k1');
  });

  it('keeps an edited sure row sure, even when its quantity is cleared', () => {
    const state = run(
      start(),
      { type: 'toggle', key: 'k0' },
      { type: 'update', key: 'k0', patch: { quantity: '' } },
      { type: 'toggle', key: 'k0' },
    );
    expect(keys(reviewGroups(state).sure)).toContain('k0');
  });

  it('removing moves a line to Excluse; restoring brings it back open when it needs checking', () => {
    const removed = run(start(), { type: 'remove', key: 'k3' });
    expect(keys(reviewGroups(removed).excluded)).toEqual(['k3', 'k5']);
    expect(removed.lines.find((l) => l.key === 'k3')?.excluded).toEqual({
      reason: 'removed',
    });
    expect(reviewCounts(removed)).toEqual({ save: 4, check: 2, excluded: 2 });

    const restored = run(removed, { type: 'restore', key: 'k3' });
    expect(keys(reviewGroups(restored).review)).toEqual(['k2', 'k3', 'k1']);
    expect(restored.open.k3).toBe(true);
  });

  it('restores a confident line shut, into Sigure', () => {
    const state = run(
      start(),
      { type: 'remove', key: 'k0' },
      { type: 'restore', key: 'k0' },
    );
    expect(keys(reviewGroups(state).sure)).toEqual(['k0', 'k4']);
    expect(state.open.k0).toBeFalsy();
  });

  it('changing the Match takes the new defaults and clears low confidence', () => {
    const state = run(start(), {
      type: 'changeMatch',
      key: 'k2',
      match: milk,
      today,
    });
    expect(state.lines.find((l) => l.key === 'k2')).toMatchObject({
      match: milk,
      unit: 'l',
      lowConfidence: false,
    });
  });

  it('opens a row on request without shutting an open one', () => {
    const state = run(
      start(),
      { type: 'open', key: 'k0' },
      { type: 'open', key: 'k0' },
    );
    expect(state.open.k0).toBe(true);
  });

  it('collapses and shows the sure group', () => {
    const state = run(start(), { type: 'toggleSureGroup' });
    expect(state.sureOpen).toBe(false);
    expect(run(state, { type: 'toggleSureGroup' }).sureOpen).toBe(true);
  });
});
