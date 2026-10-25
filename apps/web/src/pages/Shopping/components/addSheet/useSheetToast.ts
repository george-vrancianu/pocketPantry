import { useToast, type ToastApi } from '@pocket-pantry/ui';
import { useMemo } from 'react';

/** Distance in px that lifts a toast clear of the sheet's bottom edge. */
const TOAST_ABOVE_SHEET = 92;

/** Toasts for the Add sheet: raised clear of the sheet's bottom edge. */
export function useSheetToast(): ToastApi {
  const toast = useToast();
  return useMemo(
    () => ({
      dismiss: toast.dismiss,
      show: (message, options) =>
        toast.show(message, { bottom: TOAST_ABOVE_SHEET, ...options }),
    }),
    [toast],
  );
}
