import { Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { IngredientIconSlot } from '../IngredientIconSlot';

export type UseTypedRowProps = {
  id: string;
  /** The trimmed name the Member typed. */
  name: string;
  /** Keyboard-highlighted. */
  active: boolean;
  first: boolean;
  onSelect: () => void;
};

/** The dashed last option "Use “…” as typed": the name is saved as an Unmatched item. */
export function UseTypedRow({
  id,
  name,
  active,
  first,
  onSelect,
}: UseTypedRowProps) {
  const { color } = tokens;
  const { t } = useTranslation('catalog');
  return (
    <Box
      component="li"
      id={id}
      role="option"
      aria-selected={active}
      // Keep focus in the input so the tap still lands.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      sx={{
        minHeight: 58,
        m: first ? '10px' : '0 10px 10px',
        p: '9px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        borderRadius: `${tokens.radius.input}px`,
        border: `1.5px dashed ${active ? color.accent : color.line}`,
        backgroundColor: active ? color.subtle : 'transparent',
        '&:hover': { backgroundColor: color.subtle },
        outline: 'none',
      }}
    >
      <Box sx={{ color: color.muted, display: 'flex' }}>
        <IngredientIconSlot />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 15, fontWeight: 600 }}>
          {t('search.useTyped', { name })}
        </Box>
        <Box sx={{ fontSize: 13, color: color.muted }}>
          {t('search.useTypedHint')}
        </Box>
      </Box>
    </Box>
  );
}
