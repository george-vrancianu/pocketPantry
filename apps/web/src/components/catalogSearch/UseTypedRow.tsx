import { Box, PlusIcon, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { RowTag } from './RowTag';

export type UseTypedRowProps = {
  id: string;
  /** The trimmed name the Member typed. */
  name: string;
  /** Keyboard-highlighted. */
  active: boolean;
  first: boolean;
  /** The host's pill for this row, if any. */
  tag?: string | null;
  onSelect: () => void;
};

/** The dashed last option "Use “…” as typed": the name is saved as an Unmatched item. */
export function UseTypedRow({
  id,
  name,
  active,
  first,
  tag = null,
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
        position: 'relative',
        minHeight: 58,
        p: '9px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        backgroundColor: active ? color.subtle : 'transparent',
        // A dashed top rule sets it apart from the results above.
        borderTop: first ? 0 : `1px dashed ${color.tickBorder}`,
        '&:hover': { backgroundColor: color.subtle },
        ...(active
          ? {
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 10,
                bottom: 10,
                width: 3,
                borderRadius: 2,
                backgroundColor: color.accent,
              },
            }
          : {}),
        outline: 'none',
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          flexShrink: 0,
          width: 38,
          height: 38,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '11px',
          backgroundColor: color.chipNeutral,
          color: color.muted,
        }}
      >
        <PlusIcon size={20} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 15, fontWeight: 600, color: color.accent }}>
          {t('search.useTyped', { name })}
        </Box>
        <Box sx={{ fontSize: 13, color: color.muted }}>
          {t('search.useTypedHint')}
        </Box>
      </Box>
      {tag ? <RowTag>{tag}</RowTag> : null}
    </Box>
  );
}
