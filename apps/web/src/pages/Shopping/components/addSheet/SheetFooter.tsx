import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** What the Add sheet offers a view that wants a sticky footer. */
export type SheetFooterSlot = {
  /** Where the footer renders, once the sheet has made room for it. */
  host: HTMLElement | null;
  /** Asks the sheet to make room for a footer, or to drop it. */
  setHasFooter: (hasFooter: boolean) => void;
};

export const SheetFooterContext = createContext<SheetFooterSlot | null>(null);

function useSheetFooterSlot(): SheetFooterSlot {
  const slot = useContext(SheetFooterContext);
  if (!slot) throw new Error('SheetFooter must be used inside an AddSheet');
  return slot;
}

/**
 * Renders its children in the Add sheet's sticky footer. A view that has
 * nothing to put there (loading, error) simply does not render it, so the
 * sheet draws no empty strip.
 */
export function SheetFooter({ children }: { children: ReactNode }) {
  const { host, setHasFooter } = useSheetFooterSlot();
  useEffect(() => {
    setHasFooter(true);
    return () => setHasFooter(false);
  }, [setHasFooter]);
  return host ? createPortal(children, host) : null;
}
