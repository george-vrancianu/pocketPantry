import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const HostContext = createContext<HTMLElement | null>(null);
const MicSlotContext = createContext<{
  slot: HTMLElement | null;
  setSlot: (element: HTMLElement | null) => void;
  /** A Voice Note is being held: the Dock rises above the scrim. */
  recording: boolean;
  setRecording: (recording: boolean) => void;
}>({
  slot: null,
  setSlot: () => undefined,
  recording: false,
  setRecording: () => undefined,
});

const SetHostContext = createContext<(element: HTMLElement | null) => void>(
  () => undefined,
);

/** Where the Voice Note button and chip are placed: the slot if the app has one, else the body. */
export function useVoiceHost() {
  return useContext(HostContext) ?? document.body;
}

/** The Dock's mic half, where the hold-to-talk button is placed; null while the Dock has none. */
export function useDockMicSlot() {
  return useContext(MicSlotContext).slot;
}

/** Ref callback for the Dock's mic half: tells the Voice Note where its button goes. */
export function useRegisterDockMicSlot() {
  return useContext(MicSlotContext).setSlot;
}

/** Wrap the page and the Dock; the Voice Note controls land in the `VoiceHostSlot` inside it. */
export function VoiceHostProvider({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [recording, setRecording] = useState(false);
  const mic = useMemo(
    () => ({ slot, setSlot, recording, setRecording }),
    [slot, recording],
  );
  return (
    <SetHostContext.Provider value={setHost}>
      <HostContext.Provider value={host}>
        <MicSlotContext.Provider value={mic}>
          {children}
        </MicSlotContext.Provider>
      </HostContext.Provider>
    </SetHostContext.Provider>
  );
}

/**
 * Put this in the DOM between the page and the Dock: the Voice Note's Scan Language chip, scrim and
 * notices are fixed on screen, but in the DOM they sit here, so Tab reaches the chip after the page
 * and before the Dock (whose mic half holds the button itself).
 */
export function VoiceHostSlot() {
  return <div ref={useContext(SetHostContext)} />;
}

/** True while a Voice Note is held; the Dock lifts above the scrim so the mic stays bright. */
export function useDockRaised() {
  return useContext(MicSlotContext).recording;
}

/** Tell the Dock whether a Voice Note is being held. */
export function useReportRecording() {
  return useContext(MicSlotContext).setRecording;
}
