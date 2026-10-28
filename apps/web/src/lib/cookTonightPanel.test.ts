import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import type { CookTonightCard } from './cookTonight';
import { cookTonightPanelState } from './cookTonightPanel';

// Echoes the key and count, so the test sees which line was chosen without the locale files.
const t = ((key: string, options?: { count?: number }) =>
  options?.count === undefined
    ? key
    : `${key}:${options.count}`) as TFunction<'recipes'>;

const card = (
  id: string,
  over: Partial<Pick<CookTonightCard, 'canMake' | 'expiringCount'>> = {},
): CookTonightCard => ({
  canMake: true,
  missing: null,
  expiringCount: 0,
  otherVariantsCount: 0,
  ...over,
  base: { id, title: id, archived: false },
  recipe: {
    id,
    title: id,
    parentId: null,
    owner: 'family',
    familyCopyId: null,
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 15,
    tags: [],
    allergyWarning: null,
  },
});
const short = (id: string) => card(id, { canMake: false });

describe('cookTonightPanelState', () => {
  it('can make: chef, the count and the expiring count, to the Cook Tonight page', () => {
    expect(
      cookTonightPanelState(
        [card('a', { expiringCount: 2 }), card('b'), short('c')],
        false,
        t,
      ),
    ).toEqual({
      kind: 'canMake',
      mood: 'chef',
      to: '/recipes/cook-tonight',
      lines: ['cookTonight.canMake:2', 'cookTonight.expiring:1'],
    });
  });

  it('leaves out the expiring line when nothing it counts expires soon', () => {
    expect(cookTonightPanelState([card('a')], false, t).lines).toEqual([
      'cookTonight.canMake:1',
    ]);
  });

  it('one short: the disappointed chef, to the Cook Tonight page', () => {
    expect(cookTonightPanelState([short('a'), short('b')], false, t)).toEqual({
      kind: 'oneShort',
      mood: 'chef-flop',
      to: '/recipes/cook-tonight',
      lines: ['cookTonight.nothingYet', 'cookTonight.oneShort:2'],
    });
  });

  it('nothing: the disappointed chef, to the Pantry', () => {
    expect(cookTonightPanelState([], false, t)).toEqual({
      kind: 'nothing',
      mood: 'chef-flop',
      to: '/pantry',
      lines: ['cookTonight.nothingInPantry', 'cookTonight.addWhatYouHave'],
    });
  });

  it('no Recipes wins over the card counts: chef, no link, no lines', () => {
    expect(cookTonightPanelState([card('a')], true, t)).toEqual({
      kind: 'noRecipes',
      mood: 'chef',
      to: null,
      lines: [],
    });
  });
});
