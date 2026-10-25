import { Box, tokens } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { SetupNextButton, type SetupLeave } from './SetupLeave';
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
  /** The "‹ label" link back, when the screen has one. */
  back?: { label: string; onClick: () => void };
  /** Next and Skip, with the Skip confirm: from `useSetupLeave`. */
  leave: SetupLeave;
};

/** The Setup Review's top row on the cream ground: an optional "‹ Back" link, the step's progress ("1 of 2"), Skip. */
export function SetupTopRow({ back, leave }: Props) {
  const { t } = useTranslation('onboarding');
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {back ? (
          <Box
            component="button"
            type="button"
            onClick={back.onClick}
            sx={linkButton}
          >
            <span aria-hidden>‹ </span>
            {back.label}
          </Box>
        ) : null}
        <SetupProgress tone="cream" />
        <SetupNextButton leave={leave} tone="cream" />
        <Box
          component="button"
          type="button"
          onClick={leave.onSkip}
          sx={linkButton}
        >
          {t('setupStep.skip')}
        </Box>
      </Box>
      {leave.prompt}
    </>
  );
}
