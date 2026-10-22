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
}>({ slot: null, setSlot: () => undefined });

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
  const mic = useMemo(() => ({ slot, setSlot }), [slot]);
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
 * Put this in the DOM between the page and the Dock: the Voice Note button and its chip are fixed
 * on screen, but in the DOM they sit here, so Tab reaches them after the page and before the Dock.
 */
export function VoiceHostSlot() {
  return <div ref={useContext(SetHostContext)} />;
}
