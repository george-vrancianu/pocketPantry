import { VoiceReview } from './voice/VoiceReview';
import { VoiceAnswers } from './voice/VoiceAnswerSheet';
import { MicSheets } from './voice/MicSheets';
import { VoiceButton } from './voice/VoiceButton';
import { StatusPill } from './voice/StatusPill';
import { useVoiceConfigured, type VoiceDefaultTarget } from '../lib/voice';
import { useVoiceNote } from '../lib/useVoiceNote';
import { dockStateFor } from '../lib/dockState';
import { useLocation } from 'react-router-dom';

/** The Default List of a route: the list its page acts on, or `none` on every other page (ADR 0021). */
export function defaultTargetFor(pathname: string): VoiceDefaultTarget {
  const path = pathname.replace(/\/+$/, '');
  if (path === '/shopping') return 'shopping';
  if (path === '/pantry') return 'pantry';
  return 'none';
}

/**
 * Voice Notes, hosted once in the app layout: the hold-to-talk mic in the Dock's capsule with
 * the Scan Language chip above it, its notices, and the Review sheet that shows "What I heard".
 * Shown on every page with the Dock, acting on that page's list on the Shopping List and the Pantry and on no
 * list elsewhere. Hidden until the server says transcription is configured.
 */
export function VoiceNote() {
  const showsMic = useShowsDockMic();
  const defaultTarget = defaultTargetFor(useLocation().pathname);
  if (!showsMic) return null;
  return (
    <VoiceNoteControls key={defaultTarget} defaultTarget={defaultTarget} />
  );
}

/** Whether the Dock's capsule has a mic half: voice is configured and the page shows the Dock. The only gate for the mic. */
export function useShowsDockMic() {
  const configured = useVoiceConfigured();
  return configured && dockStateFor(useLocation().pathname).visible;
}

function VoiceNoteControls({
  defaultTarget,
}: {
  defaultTarget: VoiceDefaultTarget;
}) {
  const voice = useVoiceNote(defaultTarget);

  return (
    <>
      <VoiceButton voice={voice} target={defaultTarget} />

      <StatusPill voice={voice} />

      <MicSheets mic={voice.mic} target={defaultTarget} />

      <VoiceReview />

      <VoiceAnswers />
    </>
  );
}
