import MuiButton from '@mui/material/Button';
import MuiSnackbar from '@mui/material/Snackbar';
import MuiSnackbarContent from '@mui/material/SnackbarContent';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DOCK_BOTTOM, DOCK_HEIGHT } from '../theme/dock';
import { tokens } from '../theme/tokens';
import { usePrefersReducedMotion } from '../theme/usePrefersReducedMotion';

/** How long a toast stays, ms. */
export const TOAST_DURATION_MS = 2600;

export type ToastOptions = {
  /** One optional action; clicking it runs `onClick` and dismisses the toast. */
  action?: { label: string; onClick: () => void };
  /** Distance from the bottom in px, to sit above e.g. a sheet's footer. Defaults to just above the Dock. */
  bottom?: number;
};

export type ToastApi = {
  /** Show a toast. It replaces the one showing; there is no queue. */
  show: (message: string, options?: ToastOptions) => void;
};

type Current = ToastOptions & { id: number; message: string };

const ToastContext = createContext<ToastApi | null>(null);

const GAP = 8;
const aboveDock = (height: number) =>
  `calc(${DOCK_BOTTOM + height + GAP}px + env(safe-area-inset-bottom, 0px))`;

/** Mount once, near the root. Read it with `useToast()`. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Current | null>(null);
  const [open, setOpen] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  const show = useCallback((message: string, options: ToastOptions = {}) => {
    setCurrent((prev) => ({ ...options, message, id: (prev?.id ?? 0) + 1 }));
    setOpen(true);
  }, []);
  const api = useMemo<ToastApi>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {current ? (
        <MuiSnackbar
          // A new key remounts, so the old toast is replaced rather than animated out.
          key={current.id}
          open={open}
          autoHideDuration={TOAST_DURATION_MS}
          onClose={(_event, reason) => {
            if (reason !== 'clickaway') setOpen(false);
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transitionDuration={reduceMotion ? 0 : undefined}
          sx={{
            bottom:
              current.bottom !== undefined
                ? current.bottom
                : {
                    xs: aboveDock(DOCK_HEIGHT.xs),
                    md: aboveDock(DOCK_HEIGHT.md),
                  },
          }}
        >
          <MuiSnackbarContent
            message={current.message}
            action={
              current.action ? (
                <MuiButton
                  onClick={() => {
                    current.action?.onClick();
                    setOpen(false);
                  }}
                  sx={{
                    color: '#BFE0CC',
                    fontSize: 14,
                    fontWeight: 700,
                    textTransform: 'none',
                    minWidth: 0,
                  }}
                >
                  {current.action.label}
                </MuiButton>
              ) : undefined
            }
            sx={{
              bgcolor: tokens.color.ink,
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: '16px',
              boxShadow: 'none',
            }}
          />
        </MuiSnackbar>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside a ToastProvider');
  return api;
}
