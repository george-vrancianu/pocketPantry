import { Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { SetupProgress } from './SetupProgress';

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
      <SetupProgress tone="cream" />
      <Box component="button" type="button" onClick={onSkip} sx={linkButton}>
        {t('setupStep.skip')}
      </Box>
    </Box>
  );
}
