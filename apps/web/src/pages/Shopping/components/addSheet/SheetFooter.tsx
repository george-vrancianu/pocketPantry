import { useToast, type ToastApi } from '@pocket-pantry/ui';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
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

/** Distance in px that lifts a toast clear of the sheet's bottom edge. */
export const TOAST_ABOVE_SHEET = 92;

/**
 * Toasts for the Add sheet: raised clear of the sheet's bottom edge, and of
 * its sticky footer too while the current view has one. A toast that is
 * leaving for a footer-less view passes its own `bottom`.
 */
export function useSheetToast(): ToastApi {
  const toast = useToast();
  const host = useContext(SheetFooterContext)?.host ?? null;
  return useMemo(
    () => ({
      show: (message, options) =>
        toast.show(message, {
          bottom: TOAST_ABOVE_SHEET + (host?.offsetHeight ?? 0),
          ...options,
        }),
    }),
    [toast, host],
  );
}
