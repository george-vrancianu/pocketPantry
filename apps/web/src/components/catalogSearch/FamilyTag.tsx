import { Box, tokens, radius } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

/** The "Family" pill after the name of a Family Ingredient: row, token. */
export function FamilyTag() {
  const { color } = tokens;
  const { t } = useTranslation('catalog');
  return (
    <Box
      component="span"
      sx={{
        flexShrink: 0,
        ml: '7px',
        px: '7px',
        py: '2px',
        borderRadius: radius.pill,
        backgroundColor: color.butter,
        color: color.butterInk,
        fontSize: 10.5,
        fontWeight: 700,
        verticalAlign: 'middle',
      }}
    >
      {t('search.familyTag')}
    </Box>
  );
}
