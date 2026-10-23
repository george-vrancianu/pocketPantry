import {
  Box,
  Button,
  CheckIcon,
  color,
  radius,
  tokens,
  Typography,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppDock } from '../../components/AppDock';
import { IntroLook } from '../../components/IntroLook';
import { creamFocus } from '../../components/Setup/creamFocus';
import { GatorBubble } from '../../components/Setup/GatorBubble';
import { SetupCallout } from '../../components/Setup/SetupCallout';
import { SetupOliveTopRow } from '../../components/Setup/SetupOliveTopRow';
import { VoiceNote } from '../../components/VoiceNote';
import {
  useDockRaised,
  VoiceHostProvider,
  VoiceHostSlot,
} from '../../components/voice/VoiceHost';
import { introPath, nextStep, savedByVoice, skipStep } from '../../lib/intro';
import { useIntro } from '../../lib/useIntro';
import {
  useVoiceConfig,
  type VoiceApplyResult,
  type VoiceReviewAction,
} from '../../lib/voice';
import { useVoiceNoteState } from '../../lib/voiceNote';
import { aboveMic, PILL_OFFSET, VOICE_LAYER } from '../../lib/voicePlacement';

/** Where Skip goes: the Intro module's rule, never a path written here. */
const SKIP_TO = introPath(skipStep('say-it'));
/** Where the step after Say it is: "Continue" when there is no mic, and "Do these N" once saved. */
const CONTINUE_TO = introPath(nextStep('say-it'));

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
function CoachLine({ held }: { held: boolean }) {
  const { t } = useTranslation('onboarding');
  // Always mounted so the live region exists before its text arrives and the line is announced.
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
      {held ? (
        <>
          <Box component="span" sx={{ display: 'block' }}>
            {t('sayIt.coach.keepHolding')}
          </Box>
          <Box component="span" sx={{ display: 'block' }}>
            {t('sayIt.coach.letGo')}
          </Box>
        </>
      ) : null}
    </Typography>
  );
}

function SayItScreen() {
  const { t } = useTranslation('onboarding');
  const { counts, recordSaved } = useIntro();
  const voice = useVoiceConfig();
  const holding = useDockRaised();
  const { phase } = useVoiceNoteState();
  const navigate = useNavigate();
  // "Do these N" ran: count only what was really saved, then on to All set.
  const setup = {
    onApplied: (result: VoiceApplyResult, actions: VoiceReviewAction[]) => {
      recordSaved(savedByVoice(result.applied, actions));
      void navigate(CONTINUE_TO, { replace: true });
    },
  };

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
        <SetupOliveTopRow
          step={2}
          skipTo={SKIP_TO}
          skipDisabled={phase === 'reading'}
        />

        {counts.batches > 0 ? (
          <Box
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

        <GatorBubble>
          {voice === 'off' ? t('sayIt.noVoice.bubble') : t('sayIt.bubble')}
        </GatorBubble>

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
          <CoachLine held={holding} />
          {/* Only at rest: after release the status pill owns the space above the mic. */}
          {!holding && phase === 'idle' ? (
            <SetupCallout
              title={t('sayIt.callout.title')}
              body={t('sayIt.callout.body')}
              bottom={aboveMic(10)}
            />
          ) : null}
          <VoiceHostSlot />
          <VoiceNote defaultTarget={SETUP_DEFAULT_TARGET} setup={setup} />
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
