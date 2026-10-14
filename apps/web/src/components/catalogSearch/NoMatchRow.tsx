import { Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { IngredientIconSlot } from '../IngredientIconSlot';

/** The non-interactive "No match for “…”" row with its hint. */
export function NoMatchRow({ query }: { query: string }) {
  const { color } = tokens;
  const { t } = useTranslation('catalog');
  return (
    <Box
      onMouseDown={(event) => event.preventDefault()}
      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: '10px 14px' }}
    >
      <Box sx={{ color: color.muted, display: 'flex' }}>
        <IngredientIconSlot />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ fontSize: 15, fontWeight: 600 }}>
          {t('search.noMatchFor', { query })}
        </Box>
        <Box sx={{ fontSize: 13, color: color.muted }}>
          {t('search.noMatchHint')}
        </Box>
      </Box>
    </Box>
  );
}
