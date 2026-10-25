import type { GatorMood } from '@pocket-pantry/ui';
import type { TFunction } from 'i18next';
import { canMakeCards, type CookTonightCard } from './cookTonight';

export type CookTonightPanelKind =
  'canMake' | 'oneShort' | 'nothing' | 'noRecipes';

export type CookTonightPanelState = {
  kind: CookTonightPanelKind;
  /** 'chef' for canMake and noRecipes, 'chef-flop' otherwise. */
  mood: GatorMood;
  /** canMake and oneShort lead to the Cook Tonight page, nothing to the Pantry; noRecipes has no link. */
  to: string | null;
  /** The status lines after the "Cook tonight" label; empty for noRecipes. */
  lines: string[];
};

/**
 * The one place that works out what the Cook Tonight Gator panel says and where it leads, so the
 * Recipes page and the Dashboard Widget can't disagree. `noRecipes` (the Family has no Recipes,
 * none hidden by Allergies) wins over the card counts. Call it only once Cook Tonight has loaded.
 */
export function cookTonightPanelState(
  cards: CookTonightCard[],
  noRecipes: boolean,
  t: TFunction<'recipes'>,
): CookTonightPanelState {
  if (noRecipes)
    return { kind: 'noRecipes', mood: 'chef', to: null, lines: [] };
  // One card per Base Recipe, so Variants never count separately.
  const canMake = canMakeCards(cards);
  const oneShort = cards.length - canMake.length;
  if (canMake.length > 0) {
    const expiring = canMake.filter((card) => card.expiringCount > 0).length;
    return {
      kind: 'canMake',
      mood: 'chef',
      to: '/recipes/cook-tonight',
      lines: [
        t('cookTonight.canMake', { count: canMake.length }),
        ...(expiring > 0
          ? [t('cookTonight.expiring', { count: expiring })]
          : []),
      ],
    };
  }
  if (oneShort > 0)
    return {
      kind: 'oneShort',
      mood: 'chef-flop',
      to: '/recipes/cook-tonight',
      lines: [
        t('cookTonight.nothingYet'),
        t('cookTonight.oneShort', { count: oneShort }),
      ],
    };
  return {
    kind: 'nothing',
    mood: 'chef-flop',
    to: '/pantry',
    lines: [t('cookTonight.nothingInPantry'), t('cookTonight.addWhatYouHave')],
  };
}
