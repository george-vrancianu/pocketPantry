import { Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { RecipeOwner } from '../../../lib/recipes';

/** The one place a Family-owned Recipe is marked; renders nothing for the Catalog's. */
export function OwnerBadge({ owner }: { owner: RecipeOwner }) {
  const { t } = useTranslation('recipes');
  if (owner !== 'family') return null;
  return (
    <Typography variant="meta" color="text.secondary" component="span">
      {t('familyBadge')}
    </Typography>
  );
}
