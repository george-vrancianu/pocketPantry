import { Box, radius, tokens, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';

const linkButton = {
  p: 0,
  border: 0,
  background: 'none',
  color: tokens.color.accent,
  font: 'inherit',
  fontSize: 15,
  fontWeight: 600,
  textDecoration: 'underline',
  cursor: 'pointer',
} as const;

type Props = {
  /** Back to the Scan screen, in the same mode. */
  onCamera: () => void;
  /** Leave Setup's photo step without adding anything. */
  onSkip: () => void;
};

/** The Setup Review's top row on the cream ground: "‹ Camera", the step's progress ("1 of 2"), Skip. */
export function SetupTopRow({ onCamera, onSkip }: Props) {
  const { t } = useTranslation('onboarding');
  const { t: tReview } = useTranslation('review');
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Box component="button" type="button" onClick={onCamera} sx={linkButton}>
        <span aria-hidden>‹ </span>
        {tReview('overview.camera')}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <Box aria-hidden sx={{ display: 'flex', gap: '6px', flex: 1 }}>
          <Box
            sx={{
              flex: 1,
              height: 6,
              borderRadius: radius.pill,
              backgroundColor: tokens.color.accent,
            }}
          />
          <Box
            sx={{
              flex: 1,
              height: 6,
              borderRadius: radius.pill,
              backgroundColor: tokens.color.line,
            }}
          />
        </Box>
        <Typography
          component="span"
          sx={{
            fontWeight: 600,
            whiteSpace: 'nowrap',
            color: tokens.color.muted,
          }}
        >
          {t('snap.progress', { step: 1 })}
        </Typography>
      </Box>
      <Box component="button" type="button" onClick={onSkip} sx={linkButton}>
        {t('snap.skip')}
      </Box>
    </Box>
  );
}
