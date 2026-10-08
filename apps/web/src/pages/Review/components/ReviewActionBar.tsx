import { Box, Button, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

type Props = {
  saveLabel: string;
  canSave: boolean;
  onSave: () => void;
  onDiscard: () => void;
};

/** Fixed to the bottom in place of the Dock; clear of the home indicator on phones. */
export function ReviewActionBar({
  saveLabel,
  canSave,
  onSave,
  onDiscard,
}: Props) {
  const { t } = useTranslation('review');
  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        bgcolor: tokens.color.surface,
        borderTop: `1px solid ${tokens.color.line}`,
        p: '12px 20px calc(24px + env(safe-area-inset-bottom))',
      }}
    >
      <Box sx={{ display: 'flex', gap: '10px', maxWidth: 960, mx: 'auto' }}>
        <Button
          variant="text"
          onClick={onDiscard}
          sx={{
            bgcolor: tokens.color.surface,
            border: `1px solid ${tokens.color.line}`,
            color: tokens.color.ink,
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          {t('discard')}
        </Button>
        <Button
          onClick={onSave}
          disabled={!canSave}
          sx={{ flexGrow: 1, fontSize: 15, fontWeight: 700 }}
        >
          {saveLabel}
        </Button>
      </Box>
    </Box>
  );
}
