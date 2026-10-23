import {
  Box,
  Button,
  CheckIcon,
  color,
  GatorImage,
  Link,
  radius,
  tokens,
  Typography,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { AppDock } from '../../components/AppDock';
import { IntroLook } from '../../components/IntroLook';
import { SetupCallout } from '../../components/SetupReview/SetupCallout';
import { SetupProgress } from '../../components/SetupReview/SetupProgress';
import { VoiceNote } from '../../components/VoiceNote';
import {
  useDockRaised,
  VoiceHostProvider,
  VoiceHostSlot,
} from '../../components/voice/VoiceHost';
import { introPath, nextStep, skipStep } from '../../lib/intro';
import { useGatorAlt } from '../../lib/useGatorAlt';
import { useIntro } from '../../lib/useIntro';
import { useVoiceConfig } from '../../lib/voice';
import { aboveMic, PILL_OFFSET, VOICE_LAYER } from '../../lib/voicePlacement';

/** Where Skip goes: the Intro module's rule, never a path written here. */
const SKIP_TO = introPath(skipStep('say-it') ?? 'all-set');
/** Where "Continue" goes when there is nothing to say it to. */
const CONTINUE_TO = introPath(nextStep('say-it'));

/** Keyboard rings are the olive page colour by default, which vanishes on the olive ground: make them cream. */
const creamFocus = {
  '&& :focus-visible, && .Mui-focusVisible, && label:has(:focus-visible), && a:focus-visible':
    { outlineColor: color.cardBg },
} as const;

/** The Setup Voice Note's Default List: the Pantry, whatever the route says (ADR 0021, Setup only). */
const SETUP_DEFAULT_TARGET = 'pantry';

function ExampleCard({ phrase, result }: { phrase: string; result: string }) {
  return (
    <Box
      component="li"
      sx={{
        listStyle: 'none',
        px: '14px',
        py: '10px',
        borderRadius: radius.control,
        backgroundColor: color.accentOnTint,
        color: color.cardBg,
      }}
    >
      <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{phrase}</Typography>
      <Typography variant="meta" sx={{ display: 'block', opacity: 0.85 }}>
        {result}
      </Typography>
    </Box>
  );
}

/** "Keep holding while you talk. / Let go when you're done." over the scrim while the mic is held. */
function CoachLine() {
  const { t } = useTranslation('onboarding');
  return (
    <Typography
      role="status"
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: aboveMic(PILL_OFFSET + 112),
        zIndex: VOICE_LAYER.card,
        px: '24px',
        textAlign: 'center',
        pointerEvents: 'none',
        color: color.cardBg,
        fontSize: 20,
        fontWeight: 700,
      }}
    >
      <Box component="span" sx={{ display: 'block' }}>
        {t('sayIt.coach.keepHolding')}
      </Box>
      <Box component="span" sx={{ display: 'block' }}>
        {t('sayIt.coach.letGo')}
      </Box>
    </Typography>
  );
}

function SayItScreen() {
  const { t } = useTranslation('onboarding');
  const gatorAlt = useGatorAlt();
  const { counts } = useIntro();
  const voice = useVoiceConfig();
  const holding = useDockRaised();

  return (
    <>
      <Box
        component="main"
        sx={[
          {
            boxSizing: 'border-box',
            maxWidth: 520,
            mx: 'auto',
            px: '24px',
            pt: '48px',
            pb: '260px',
            color: color.cardBg,
          },
          creamFocus,
        ]}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <SetupProgress tone="olive" step={2} />
          <Link
            href={SKIP_TO}
            underline="always"
            sx={{
              color: color.cardBg,
              fontWeight: 600,
              fontSize: 15,
              '&:hover': { color: color.cardBg },
            }}
          >
            {t('sayIt.skip')}
          </Link>
        </Box>

        {counts.batches > 0 ? (
          <Box
            role="status"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              mt: '20px',
              px: '12px',
              height: 32,
              borderRadius: radius.pill,
              backgroundColor: color.accentOnTint,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <Box
              aria-hidden
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: tokens.color.butter,
                color: tokens.color.butterInk,
              }}
            >
              <CheckIcon size={13} />
            </Box>
            {t('sayIt.pill', { count: counts.batches })}
          </Box>
        ) : null}

        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '20px' }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <GatorImage mood="talking" size={132} alt={gatorAlt('talking')} />
          </Box>
          <Typography
            sx={{
              flex: 1,
              px: '16px',
              py: '14px',
              borderRadius: radius.sheet,
              backgroundColor: 'pp.cardBg',
              color: 'text.primary',
              fontSize: 15.5,
              fontWeight: 600,
            }}
          >
            {voice === 'off' ? t('sayIt.noVoice.bubble') : t('sayIt.bubble')}
          </Typography>
        </Box>

        {voice === 'off' ? null : (
          <Box
            component="ul"
            aria-label={t('sayIt.examplesLabel')}
            sx={{
              display: 'grid',
              gap: '10px',
              m: 0,
              mt: '28px',
              p: 0,
            }}
          >
            <ExampleCard
              phrase={t('sayIt.examples.pantry.phrase')}
              result={t('sayIt.examples.pantry.result')}
            />
            <ExampleCard
              phrase={t('sayIt.examples.shopping.phrase')}
              result={t('sayIt.examples.shopping.result')}
            />
          </Box>
        )}

        {voice === 'off' ? (
          <Box sx={{ mt: '28px' }}>
            <Typography sx={{ mb: '16px' }}>
              {t('sayIt.noVoice.callout')}
            </Typography>
            <Button href={CONTINUE_TO}>{t('sayIt.noVoice.continue')}</Button>
          </Box>
        ) : null}
      </Box>

      {voice === 'on' ? (
        <>
          {holding ? (
            <CoachLine />
          ) : (
            <SetupCallout
              title={t('sayIt.callout.title')}
              body={t('sayIt.callout.body')}
              bottom={aboveMic(10)}
            />
          )}
          <VoiceHostSlot />
          <VoiceNote defaultTarget={SETUP_DEFAULT_TARGET} />
          <AppDock teach="mic" />
        </>
      ) : null}
    </>
  );
}

/**
 * Setup 2, Say it: the olive screen that teaches where the mic lives. The real Dock is shown with only the
 * mic lit, and holding it runs the real Voice Note flow (recording, permission, Voice Cap, Review) in the
 * Member's Spoken Language, with the Pantry as its Default List. This screen is outside the app layout, so
 * it hosts the Voice Note itself.
 */
export function SayItPage() {
  return (
    <IntroLook ground="olive">
      <VoiceHostProvider>
        <SayItScreen />
      </VoiceHostProvider>
    </IntroLook>
  );
}
