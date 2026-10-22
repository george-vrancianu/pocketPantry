import { VoiceReview } from './voice/VoiceReview';
import { MicSheets } from './voice/MicSheets';
import { VoiceButton } from './voice/VoiceButton';
import { StatusPill } from './voice/StatusPill';
import { useVoiceConfigured, type VoiceList } from '../lib/voice';
import { useVoiceNote } from '../lib/useVoiceNote';
import { useLocation } from 'react-router-dom';

/** The Default List of a route: the list its page acts on, or none where there is no mic. */
export function defaultListFor(pathname: string): VoiceList | null {
  const path = pathname.replace(/\/+$/, '');
  if (path === '/shopping') return 'shopping';
  if (path === '/pantry') return 'pantry';
  return null;
}

/**
 * Voice Notes, hosted once in the app layout: the hold-to-talk mic in the Dock's capsule with
 * the Scan Language chip above it, its notices, and the Review sheet that shows "What I heard".
 * Shown on the Shopping List and the Pantry only, acting on that page's list. Hidden until the server says
 * transcription is configured.
 */
export function VoiceNote() {
  const configured = useVoiceConfigured();
  const defaultTarget = defaultListFor(useLocation().pathname);
  if (!configured || !defaultTarget) return null;
  return (
    <VoiceNoteControls key={defaultTarget} defaultTarget={defaultTarget} />
  );
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
