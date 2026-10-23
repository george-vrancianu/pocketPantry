import {
  Alert,
  Box,
  Button,
  GatorImage,
  palette,
  radius,
  Stack,
  Typography,
} from '@pocket-pantry/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IntroLook } from '../../components/IntroLook';
import { translateApiError } from '../../i18n/translateApiError';
import { useIntro } from '../../lib/useIntro';

/**
 * Set up or skip: where a Member who is not done with the Intro lands, and where leaving Setup halfway
 * resumes. "Show me how" is a placeholder until Setup 1 (ticket 498).
 */
export function SetupOrSkipPage() {
  const { t } = useTranslation(['onboarding', 'common']);
  const { resumeSetup, finishIntro, finishing, finishError } = useIntro();

  useEffect(() => resumeSetup(), [resumeSetup]);

  return (
    <IntroLook>
      <Stack
        component="main"
        spacing={3}
        sx={{ p: '24px', maxWidth: 420, mx: 'auto' }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: '16px',
            borderRadius: radius.sheet,
            backgroundColor: palette('pp-accentTint'),
          }}
        >
          <GatorImage
            mood="shopping-buddy"
            size={220}
            alt={t('onboarding:alt.shoppingBuddy')}
          />
        </Box>
        <Stack spacing={1}>
          <Typography variant="h1">{t('onboarding:setup.title')}</Typography>
          <Typography color="text.secondary">
            {t('onboarding:setup.body')}
          </Typography>
        </Stack>
        {finishError ? (
          <Alert>{translateApiError(t, finishError)}</Alert>
        ) : null}
        <Stack spacing={2}>
          <Button disabled>
            <Stack sx={{ alignItems: 'flex-start' }}>
              <span>{t('onboarding:setup.showMe')}</span>
              <span>{t('onboarding:setup.showMeSnap')}</span>
              <span>{t('onboarding:setup.showMeSay')}</span>
            </Stack>
          </Button>
          <Button
            variant="secondary"
            disabled={finishing}
            onClick={finishIntro}
          >
            <Stack sx={{ alignItems: 'flex-start' }}>
              <span>{t('onboarding:setup.skip')}</span>
              <span>{t('onboarding:setup.skipHint')}</span>
            </Stack>
          </Button>
        </Stack>
      </Stack>
    </IntroLook>
  );
}
