import { VoiceReview } from './voice/VoiceReview';
import { MicSheets } from './voice/MicSheets';
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
  const voice = useVoiceNote(defaultTarget);

  return (
    <>
      <VoiceButton voice={voice} target={defaultTarget} />

      <StatusPill voice={voice} />

      <MicSheets mic={voice.mic} target={defaultTarget} />

      <VoiceReview />
    </>
  );
}
