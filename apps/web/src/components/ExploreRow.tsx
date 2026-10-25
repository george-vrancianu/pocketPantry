import { Box, PeopleIcon, radius, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { CookTonightCard } from '../lib/cookTonight';
import type { AddState } from '../lib/addToFamily';
import { totalMinutes, type RecipeListItem } from '../lib/recipes';
import {
  RecipeRowLayout,
  StatusPills,
} from '../pages/Recipes/components/RecipeRow';
import { AddToFamilyButton } from './AddToFamilyButton';

type Props = {
  recipe: RecipeListItem;
  state: AddState;
  onAdd: () => void;
  /** The Recipe's Cook Tonight card, when it has one. */
  card?: CookTonightCard | undefined;
  /** Variants are labelled with their Base only while a search or filter is active. */
  filtering?: boolean;
  /** Where tapping the row body goes (the quick view, later); without it the body is not a control. */
  onOpen?: () => void;
  /** In "You can make this", which already says it: leaves out the Can make pill. */
  hideCanMake?: boolean;
};

/** A Catalog Recipe row with its one-tap add button; shared by Explore and the empty Recipes page. */
export function ExploreRow({
  recipe,
  state,
  onAdd,
  card,
  filtering = false,
  onOpen,
  hideCanMake = false,
}: Props) {
  const { t } = useTranslation('recipes');
  const meta = [
    recipe.cuisine?.name,
    recipe.method?.name,
    recipe.difficulty ? t(`difficulty.${recipe.difficulty}`) : null,
    recipe.variantCount > 0
      ? t('variantCount', { count: recipe.variantCount })
      : null,
  ].filter((part): part is string => Boolean(part));
  return (
    <RecipeRowLayout
      title={
        <>
          {recipe.title}
          {state.status === 'none' ? null : (
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                ml: '8px',
                px: '8px',
                py: '2px',
                borderRadius: radius.pill,
                bgcolor: tokens.color.butter,
                color: tokens.color.butterInk,
                fontSize: 11,
                fontWeight: 700,
                verticalAlign: 'middle',
              }}
            >
              <PeopleIcon size={13} />
              {t('explore.inFamily')}
            </Box>
          )}
        </>
      }
      above={
        filtering && recipe.base ? (
          <Box
            sx={{ fontSize: 13, fontWeight: 600, color: tokens.color.accent }}
          >
            {t('variantOf', { base: recipe.base.title })}
          </Box>
        ) : null
      }
      meta={meta}
      minutes={totalMinutes(recipe)}
      pills={
        card || recipe.allergyWarning ? (
          <StatusPills
            recipeId={recipe.id}
            card={card}
            warning={recipe.allergyWarning}
            hideCanMake={hideCanMake}
          />
        ) : null
      }
      onClick={onOpen}
      trailing={
        <AddToFamilyButton title={recipe.title} state={state} onAdd={onAdd} />
      }
    />
  );
}
