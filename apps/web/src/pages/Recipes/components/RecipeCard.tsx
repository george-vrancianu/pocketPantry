import { Box, Link, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { RecipeListItem } from '../../../lib/recipes';
import { OwnerBadge } from './OwnerBadge';
import { RecipeMeta } from './RecipeMeta';

/** A list row: a Base Recipe with its Variant count, or a Variant labelled with its base. */
export function RecipeCard({ recipe }: { recipe: RecipeListItem }) {
  const { t } = useTranslation('recipes');
  return (
    <Box component="li">
      <Link href={`/recipes/${recipe.id}`}>{recipe.title}</Link>{' '}
      <OwnerBadge owner={recipe.owner} />
      <Typography variant="meta" color="text.secondary" component="p">
        {recipe.base
          ? t('variantOf', { base: recipe.base.title })
          : t('variantCount', { count: recipe.variantCount })}
      </Typography>
      <RecipeMeta
        cuisine={recipe.cuisine}
        method={recipe.method}
        prepMinutes={recipe.prepMinutes}
        cookMinutes={recipe.cookMinutes}
        difficulty={recipe.difficulty}
      />
    </Box>
  );
}
