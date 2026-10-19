import { createContext, useContext, useState, type ReactNode } from 'react';

const HostContext = createContext<HTMLElement | null>(null);
const SetHostContext = createContext<(element: HTMLElement | null) => void>(
  () => undefined,
);

/** Where the Voice Note button and chip are placed: the slot if the app has one, else the body. */
export function useVoiceHost() {
  return useContext(HostContext) ?? document.body;
}

/** Wrap the page and the Dock; the Voice Note controls land in the `VoiceHostSlot` inside it. */
export function VoiceHostProvider({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  return (
    <SetHostContext.Provider value={setHost}>
      <HostContext.Provider value={host}>{children}</HostContext.Provider>
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
