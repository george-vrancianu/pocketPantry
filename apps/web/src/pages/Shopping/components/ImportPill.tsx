import { Box, ImportIcon, radius, tokens } from '@pocket-pantry/ui';
import { forwardRef, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

/** The "Import" pill that opens the Import sheet; shown in the Shopping summary card. */
export const ImportPill = forwardRef<
  HTMLButtonElement,
  { onClick: (event: MouseEvent<HTMLButtonElement>) => void }
>(function ImportPill({ onClick }, ref) {
  const { t } = useTranslation('shopping');
  return (
    <Box
      ref={ref}
      component="button"
      type="button"
      aria-label={t('import.aria')}
      onClick={onClick}
      sx={{
        height: 40,
        p: '0 14px 0 11px',
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        border: 0,
        borderRadius: radius.pill,
        cursor: 'pointer',
        backgroundColor: tokens.color.surface,
        boxShadow: `inset 0 0 0 1px ${tokens.color.line}`,
        color: tokens.color.ink,
        font: 'inherit',
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{ display: 'flex', color: tokens.color.accent }}
      >
        <ImportIcon size={18} />
      </Box>
      {t('import.button')}
    </Box>
  );
});
