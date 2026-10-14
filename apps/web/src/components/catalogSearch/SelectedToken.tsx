import { Box, CloseIcon, IconButton, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import type { CatalogSearchResult } from '../../lib/catalog';
import { IngredientIconSlot } from '../IngredientIconSlot';
import { resultMeta } from './SearchResultRow';

/** The picked ingredient as a tinted pill with icon, name, meta and ×; tapping it clears the pick. */
export function SelectedToken({
  selected,
  onClear,
}: {
  selected: CatalogSearchResult;
  onClear: () => void;
}) {
  const { color } = tokens;
  const { t } = useTranslation('catalog');
  return (
    <Box
      // Focus stays in the (visually hidden) input.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClear}
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pl: '12px',
        pr: '6px',
        borderRadius: '16px',
        backgroundColor: color.accentTint,
        color: color.accent,
        cursor: 'pointer',
      }}
    >
      <IngredientIconSlot
        ingredientId={selected.id}
        aisleId={selected.parentCategory.aisle.id}
        color={color.accent}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            fontSize: 15,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {selected.name}
        </Box>
        <Box
          sx={{
            fontSize: 12,
            fontWeight: 500,
            opacity: 0.8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {resultMeta(selected)}
        </Box>
      </Box>
      <IconButton
        label={t('search.change')}
        tone="plain"
        size={34}
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.stopPropagation();
          onClear();
        }}
      >
        <CloseIcon size={18} />
      </IconButton>
    </Box>
  );
}
