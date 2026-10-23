import { Button, Stack, Typography } from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { IntroLook } from '../../components/IntroLook';
import { INTRO_PATHS, nextStep } from '../../lib/intro';

/** Placeholder until ticket 497 phase C builds the real Languages screen. */
export function LanguagesPage() {
  const { t } = useTranslation('onboarding');
  return (
    <IntroLook>
      <Stack
        component="main"
        spacing={3}
        sx={{ p: '24px', maxWidth: 420, mx: 'auto' }}
      >
        <Typography variant="h1">{t('languages.title')}</Typography>
        <Button href={INTRO_PATHS[nextStep('languages')]}>
          {t('languages.continue')}
        </Button>
      </Stack>
    </IntroLook>
  );
}
