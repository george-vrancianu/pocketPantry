import {
  ActionMenu,
  Alert,
  Box,
  Button,
  GlobeIcon,
  Sheet,
  Typography,
  palette,
  radius,
} from '@pocket-pantry/ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SCAN_LANGUAGES } from '../../i18n/resources';
import { usePreferredSpokenLanguage } from '../../lib/usePreferredSpokenLanguage';
import { formatClock } from '../../lib/voice';
import {
  MAX_APPLY_ACTIONS,
  useVoiceNoteState,
  voiceNote,
} from '../../lib/voiceNote';
import { failureReason } from './failureReason';
import { noteListMeta } from './noteMeta';

const glyph: Record<VoiceInboxPhase, string> = {
  reading: '…',
  review: '✓',
  answers: '✓',
  applying: '…',
  failed: '!',
};

type VoiceInboxPhase = ReturnType<
  typeof useVoiceNoteState
>['inbox']['notes'][number]['phase'];

/** The Voice Inbox sheet: one row per Voice Note in recording order, with Review / See or Cancel. */
export function VoiceInboxSheet({
  open,
  onClose,
  onExited,
}: {
  open: boolean;
  onClose: () => void;
  onExited: () => void;
}) {
  const { t } = useTranslation(['voice', 'settings', 'errors']);
  const { inbox, voiceCap } = useVoiceNoteState();
  const { spokenLanguage } = usePreferredSpokenLanguage();
  const title = useRef<HTMLHeadingElement>(null);
  // "Review all" was refused: too many Voice Actions for one Apply.
  const [refusedAt, setRefusedAt] = useState<number | null>(null);
  const reviewable = inbox.notes.filter((n) => n.hasActions).length;
  // The refusal holds only for the notes it was made for.
  const tooMany = refusedAt === reviewable;

  /** Why a note failed, in the words the pill used. */
  const failureText = (note: (typeof inbox.notes)[number]) => {
    if (note.phase !== 'failed') return undefined;
    const reason = failureReason(
      t,
      note.error,
      note.rawError,
      voiceCap?.cap ?? 0,
    );
    if (!reason) return undefined;
    return note.error === 'nothingHeard' || note.error === 'capReached'
      ? `${reason.title}. ${reason.hint}`
      : reason.hint;
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      onExited={onExited}
      onEntered={() => title.current?.focus()}
      label={t('voice:inbox.sheetTitle')}
      footer={
        reviewable > 1 ? (
          <Box sx={{ p: '12px 16px calc(20px + env(safe-area-inset-bottom))' }}>
            {tooMany ? (
              <Box sx={{ mb: '10px' }}>
                <Alert>
                  {t('voice:inbox.reviewAllTooMany', {
                    max: MAX_APPLY_ACTIONS,
                  })}
                </Alert>
              </Box>
            ) : null}
            <Button
              fullWidth
              onClick={() => {
                const outcome = voiceNote.openMerged();
                setRefusedAt(outcome === 'tooMany' ? reviewable : null);
                if (outcome === 'opened') onClose();
              }}
            >
              {t('voice:inbox.reviewAll', { count: reviewable })}
            </Button>
          </Box>
        ) : null
      }
      header={
        <Box sx={{ px: 2.5, pt: 1.5, pb: 1.5 }}>
          <Typography
            component="h2"
            variant="h2"
            tabIndex={-1}
            ref={title}
            sx={{ outline: 'none' }}
          >
            {t('voice:inbox.sheetTitle')}
          </Typography>
        </Box>
      }
    >
      <Box
        component="ul"
        aria-label={t('voice:inbox.sheetTitle')}
        sx={{ m: 0, px: 2, pb: 2, listStyle: 'none' }}
      >
        {inbox.notes.map((note) => {
          const { phase } = note;
          const noteLanguage = note.spokenLanguage ?? spokenLanguage;
          const isReady = phase === 'review' || phase === 'answers';
          const preview = note.transcript
            ? note.transcript.split('\n')[0]
            : t('voice:inbox.preview', {
                duration: formatClock(note.durationMs ?? 0),
              });
          const reason = failureText(note);
          const meta = noteListMeta(t, note.defaultTarget, noteLanguage);
          return (
            <Box
              component="li"
              key={note.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                py: 1.25,
                borderBottom: `1px solid ${palette('pp-line')}`,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  flex: 'none',
                  width: 32,
                  height: 32,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: radius.control,
                  backgroundColor: palette('background-paper'),
                  fontWeight: 700,
                }}
              >
                {glyph[phase]}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {preview}
                </Box>
                <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{meta}</Box>
                <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {reason ?? t(`voice:inbox.state.${phase}`)}
                </Box>
              </Box>
              {isReady ? (
                <Button
                  size="sm"
                  shape="pill"
                  aria-label={t(
                    phase === 'answers'
                      ? 'voice:inbox.seeNote'
                      : 'voice:inbox.reviewNote',
                    { preview },
                  )}
                  onClick={() => {
                    onClose();
                    voiceNote.open(note.id);
                  }}
                >
                  {phase === 'answers'
                    ? t('voice:inbox.see')
                    : t('voice:inbox.review')}
                </Button>
              ) : phase === 'reading' ? (
                <Button
                  size="sm"
                  shape="pill"
                  variant="secondary"
                  aria-label={t('voice:inbox.cancelNote', { preview })}
                  onClick={() => {
                    // The row goes with the note; focus would fall to the page.
                    title.current?.focus();
                    voiceNote.cancelReading(note.id);
                  }}
                >
                  {t('voice:inbox.cancel')}
                </Button>
              ) : phase === 'failed' ? (
                <Box sx={{ display: 'flex', gap: '8px', flex: 'none' }}>
                  <Button
                    size="sm"
                    shape="pill"
                    variant="secondary"
                    aria-label={t('voice:inbox.discardNote', { preview })}
                    onClick={() => {
                      title.current?.focus();
                      // Only a kept recording is "discarded"; otherwise the row just closes.
                      if (note.canRetry) voiceNote.discardFailed(note.id);
                      else voiceNote.dismiss(note.id);
                    }}
                  >
                    {t('voice:send.discard')}
                  </Button>
                  {note.canRetry ? (
                    <>
                      <ActionMenu
                        label={t('voice:inbox.retryOtherNote', { preview })}
                        icon={<GlobeIcon size={20} aria-hidden="true" />}
                        items={SCAN_LANGUAGES.map((language) => {
                          const name = t(`settings:languageNames.${language}`);
                          return {
                            label:
                              language === noteLanguage
                                ? t('voice:inbox.currentLanguage', {
                                    language: name,
                                  })
                                : name,
                            onClick: () => {
                              // The menu returns focus to its trigger, which is gone once the row is read again.
                              requestAnimationFrame(() =>
                                title.current?.focus(),
                              );
                              void voiceNote.retry(note.id, language);
                            },
                          };
                        })}
                      />
                      <Button
                        size="sm"
                        shape="pill"
                        aria-label={t('voice:inbox.retryNote', { preview })}
                        onClick={() => {
                          title.current?.focus();
                          void voiceNote.retry(note.id);
                        }}
                      >
                        {t('voice:send.retry')}
                      </Button>
                    </>
                  ) : null}
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Sheet>
  );
}
