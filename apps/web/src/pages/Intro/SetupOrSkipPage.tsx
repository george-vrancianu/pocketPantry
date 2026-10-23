import {
  Alert,
  Box,
  ChevronRightIcon,
  color,
  GatorImage,
  MicIcon,
  radius,
  ScanIcon,
  Stack,
  Typography,
  focusRingStyle,
  palette,
} from '@pocket-pantry/ui';
import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IntroLook } from '../../components/IntroLook';
import { translateApiError } from '../../i18n/translateApiError';
import { useIntro } from '../../lib/useIntro';
import type { LanguagePicks } from '../../lib/intro';

type CardProps = {
  children: ReactNode;
  emphasised?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

/** A big choice card: the emphasised one has the accent border, the other the card line. */
function ChoiceCard({ children, emphasised, disabled, onClick }: CardProps) {
  return (
    <Box
      component="button"
      type="button"
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box',
        p: '16px',
        textAlign: 'start',
        font: 'inherit',
        color: 'text.primary',
        backgroundColor: 'pp.cardBg',
        border: emphasised ? '2px solid' : '1px solid',
        borderColor: emphasised ? 'pp.accent' : 'pp.cardLine',
        borderRadius: '16px',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        '&:focus-visible': focusRingStyle,
      }}
    >
      {children}
      <Box
        aria-hidden
        sx={{
          display: 'inline-flex',
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: emphasised ? 'pp.accent' : 'pp.chip',
          color: emphasised ? color.accentInk : 'text.secondary',
        }}
      >
        <ChevronRightIcon size={18} />
      </Box>
    </Box>
  );
}

/** What the Member chose on Languages, for the note when saving them failed. */
function useChoices() {
  const { t } = useTranslation(['onboarding', 'settings']);
  return (picks: LanguagePicks) => {
    const own = (locale: string) => t(`settings:languageNames.${locale}`);
    const rows: [string, string | null][] = [
      [t('onboarding:languages.app'), picks.locale],
      [t('onboarding:languages.voiceNotes.label'), picks.spokenLanguage],
      [t('onboarding:languages.receipts.label'), picks.scanLanguage],
      [t('onboarding:languages.groceryNames.label'), picks.catalogLanguage],
    ];
    return rows
      .filter((row): row is [string, string] => row[1] !== null)
      .map(([name, locale]) => `${name}: ${own(locale)}`)
      .join(', ');
  };
}

/**
 * Set up or skip: where a Member who is not done with the Intro lands, and where leaving Setup halfway
 * resumes. "Show me how" is inert until Setup 1 (ticket 498): it says "Coming soon" and does nothing.
 */
export function SetupOrSkipPage() {
  const { t } = useTranslation(['onboarding', 'common']);
  const { resumeSetup, finishIntro, finishing, finishError, unsavedLanguages } =
    useIntro();
  const choices = useChoices();

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
        {unsavedLanguages ? (
          <Alert>
            {t('onboarding:setup.languagesNotSaved', {
              choices: choices(unsavedLanguages),
            })}
          </Alert>
        ) : null}
        {finishError ? (
          <Alert>{translateApiError(t, finishError)}</Alert>
        ) : null}
        <Stack spacing={2}>
          <ChoiceCard emphasised disabled>
            <Stack spacing={0.5}>
              <Typography variant="h2">
                {t('onboarding:setup.showMe')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ScanIcon size={18} aria-hidden />
                <span>{t('onboarding:setup.showMeSnap')}</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MicIcon size={18} aria-hidden />
                <span>{t('onboarding:setup.showMeSay')}</span>
              </Box>
              <Typography variant="meta" color="text.secondary">
                {t('onboarding:setup.showMeSoon')}
              </Typography>
            </Stack>
          </ChoiceCard>
          <ChoiceCard disabled={finishing} onClick={finishIntro}>
            <Stack spacing={0.5}>
              <Typography variant="h2">{t('onboarding:setup.skip')}</Typography>
              <Typography variant="meta" color="text.secondary">
                {t('onboarding:setup.skipHint')}
              </Typography>
            </Stack>
          </ChoiceCard>
        </Stack>
      </Stack>
    </IntroLook>
  );
}
