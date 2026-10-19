import {
  Alert,
  Box,
  Button,
  Sheet,
  Stack,
  Typography,
} from '@pocket-pantry/ui';
import { useTranslation } from 'react-i18next';
import { VoiceReview } from './voice/VoiceReview';
import { VoiceButton } from './voice/VoiceButton';
import { StatusPill } from './voice/StatusPill';
import { useVoiceConfigured, type VoiceList } from '../lib/voice';
import { useVoiceNote } from '../lib/useVoiceNote';

/**
 * Voice Notes on the Shopping List and the Pantry: the floating hold-to-talk button with its
 * Scan Language chip, its notices, and the Review sheet that shows "What I heard". Hidden until the server says
 * transcription is configured.
 */
export function VoiceNote({
  defaultTarget = 'shopping',
}: {
  /** The list the page this sits on acts on. */
  defaultTarget?: VoiceList;
}) {
  const configured = useVoiceConfigured();
  if (!configured) return null;
  return <VoiceNoteControls defaultTarget={defaultTarget} />;
}

function VoiceNoteControls({ defaultTarget }: { defaultTarget: VoiceList }) {
  const { t } = useTranslation(['voice', 'scan', 'common']);
  const voice = useVoiceNote(defaultTarget);

  return (
    <>
      <VoiceButton voice={voice} target={defaultTarget} />

      <StatusPill voice={voice} />

      {voice.notice ? (
        <Alert>
          <Stack spacing={1}>
            <span>
              {voice.notice.kind === 'denied'
                ? `${t('voice:denied.title')} ${t('voice:denied.body')}`
                : t('voice:unavailable')}
            </span>
            <Box sx={{ display: 'flex', gap: '8px' }}>
              <Button onClick={voice.dismiss}>{t('voice:dismiss')}</Button>
            </Box>
          </Stack>
        </Alert>
      ) : null}

      <Sheet
        open={voice.explaining}
        onClose={voice.dismissExplainer}
        label={t('voice:explainer.title')}
        size="content"
      >
        <Stack spacing={2}>
          <Typography variant="h2">{t('voice:explainer.title')}</Typography>
          <Typography>{t('voice:explainer.body')}</Typography>
          <Button onClick={() => void voice.allowMicrophone()}>
            {t('voice:explainer.allow')}
          </Button>
          <Button onClick={voice.dismissExplainer}>
            {t('voice:explainer.notNow')}
          </Button>
        </Stack>
      </Sheet>

      <VoiceReview />
    </>
  );
}
