import {
  Box,
  Button,
  CheckIcon,
  CloseIcon,
  Sheet,
  Typography,
  palette,
  radius,
  shadow,
} from '@pocket-pantry/ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { focusVoiceButton } from '../../lib/voiceFocus';
import type { VoiceAnswer, VoiceAnswerKind } from '../../lib/voice';
import { useScanLanguage } from '../../pages/Scan/hooks/useScanLanguage';
import { useVoiceNoteState, voiceNote } from '../../lib/voiceNote';
import { IngredientIconSlot } from '../IngredientIconSlot';
import { HeardCard } from './HeardCard';

/**
 * How each kind of answer looks: its mark and its words (voice namespace). The one place to add a
 * kind: a new member of `VoiceAnswer` needs an entry here, and a `detail` line when it carries more.
 */
const ANSWER: Record<
  VoiceAnswerKind,
  { icon: React.ReactNode; verdict: string; tone: string }
> = {
  yes: {
    icon: <CheckIcon size={18} />,
    verdict: 'answers.verdict.yes',
    tone: 'success-main',
  },
  no: {
    icon: <CloseIcon size={18} />,
    verdict: 'answers.verdict.no',
    tone: 'text-secondary',
  },
};

/** The answer sheet for a Voice Note of only Pantry Questions: read-only, closed with Done. */
export function VoiceAnswers() {
  const { phase } = useVoiceNoteState();
  return phase === 'answers' ? <AnswerSheet /> : null;
}

function AnswerSheet() {
  const { t } = useTranslation('voice');
  const { proposal, recording } = useVoiceNoteState();
  const { scanLanguage } = useScanLanguage();
  const title = useRef<HTMLHeadingElement>(null);
  const answers = proposal?.answers ?? [];

  const done = () => {
    voiceNote.closeAnswers();
    focusVoiceButton();
  };

  return (
    <Sheet
      open
      onClose={done}
      onEntered={() => title.current?.focus()}
      label={t('answers.title')}
      header={
        <Box sx={{ px: 2.5, pt: 1.5, pb: 1.5 }}>
          <Typography
            component="h2"
            variant="h2"
            tabIndex={-1}
            ref={title}
            sx={{ outline: 'none' }}
          >
            {t('answers.title')}
          </Typography>
          <Typography sx={{ fontSize: 13, color: palette('text-secondary') }}>
            {t('answers.subline')}
          </Typography>
        </Box>
      }
      footer={
        <Box sx={{ p: '12px 16px calc(20px + env(safe-area-inset-bottom))' }}>
          <Button fullWidth onClick={done}>
            {t('answers.done')}
          </Button>
        </Box>
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          px: 2,
          pb: 2,
        }}
      >
        <HeardCard
          transcript={proposal?.transcript ?? ''}
          language={recording?.scanLanguage ?? scanLanguage}
          durationMs={recording?.durationMs}
          defaultOpen={false}
        />
        <Box
          component="ul"
          aria-label={t('answers.list')}
          sx={{
            m: 0,
            p: 0,
            listStyle: 'none',
            backgroundColor: palette('background-paper'),
            border: `1px solid ${palette('pp-line')}`,
            borderRadius: radius.card,
            boxShadow: shadow.card,
            overflow: 'hidden',
          }}
        >
          {answers.map((answer) => (
            <AnswerRow key={answer.id} answer={answer} />
          ))}
        </Box>
      </Box>
    </Sheet>
  );
}

/** One answer: the Ingredient Icon and name, then the verdict for its kind. */
export function AnswerRow({ answer }: { answer: VoiceAnswer }) {
  const { t } = useTranslation('voice');
  const look = ANSWER[answer.kind];
  return (
    <Box
      component="li"
      data-voice-answer={answer.id}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
        minHeight: 60,
        py: '9px',
        px: '12px',
        '& + &': { borderTop: `1px solid ${palette('divider')}` },
      }}
    >
      <IngredientIconSlot
        ingredientId={answer.ingredient.id}
        aisleId={answer.ingredient.parentCategory.aisle.id}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 15, fontWeight: 600 }}>
          {answer.ingredient.name}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: 13,
            color: palette(look.tone),
          }}
        >
          <Box component="span" aria-hidden sx={{ display: 'flex' }}>
            {look.icon}
          </Box>
          {t(look.verdict)}
        </Box>
      </Box>
    </Box>
  );
}
