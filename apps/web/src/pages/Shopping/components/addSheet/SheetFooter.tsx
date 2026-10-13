import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** What the Add sheet offers a view that wants a sticky footer. */
export type SheetFooterSlot = {
  /** Where the footer renders, once the sheet has made room for it. */
  host: HTMLElement | null;
  /** Asks the sheet to make room for a footer, or to drop it. */
  setWanted: (wanted: boolean) => void;
};

export const SheetFooterContext = createContext<SheetFooterSlot | null>(null);

/**
 * Renders its children in the Add sheet's sticky footer. Pass `wanted` false
 * while the view has nothing to put there (loading, error), so the sheet draws
 * no empty strip.
 */
export function SheetFooter({
  wanted = true,
  children,
}: {
  wanted?: boolean;
  children: ReactNode;
}) {
  const slot = useContext(SheetFooterContext);
  if (!slot) throw new Error('SheetFooter must be used inside an AddSheet');
  const { host, setWanted } = slot;
  useEffect(() => {
    setWanted(wanted);
    return () => setWanted(false);
  }, [wanted, setWanted]);
  return wanted && host ? createPortal(children, host) : null;
}
