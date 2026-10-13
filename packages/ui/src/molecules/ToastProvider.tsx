import MuiButton from '@mui/material/Button';
import MuiSnackbar from '@mui/material/Snackbar';
import MuiSnackbarContent from '@mui/material/SnackbarContent';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { aboveDock, DOCK_HEIGHT } from '../theme/dock';
import { tokens } from '../theme/tokens';
import { usePrefersReducedMotion } from '../theme/usePrefersReducedMotion';

/** How long a toast stays, ms. */
const TOAST_DURATION_MS = 2600;

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

/**
 * How a modal registers itself as the toast's home while open. A modal
 * aria-hides the app root and traps focus, so a toast rendered at the root
 * would be neither heard nor reachable; it renders inside the modal instead.
 */
const ToastHostContext = createContext<
  ((element: HTMLElement) => () => void) | null
>(null);

/** Called by a modal: while `element` is set, toasts render inside it. */
export function useToastHost(element: HTMLElement | null): void {
  const register = useContext(ToastHostContext);
  useEffect(() => {
    if (!register || !element) return;
    return register(element);
  }, [register, element]);
}

/** Mount once, near the root. Read it with `useToast()`. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Current | null>(null);
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const registerHost = useCallback((element: HTMLElement) => {
    setHost(element);
    return () => setHost((prev) => (prev === element ? null : prev));
  }, []);
  const reduceMotion = usePrefersReducedMotion();

  const show = useCallback((message: string, options: ToastOptions = {}) => {
    setCurrent((prev) => ({ ...options, message, id: (prev?.id ?? 0) + 1 }));
    setOpen(true);
  }, []);
  const api = useMemo<ToastApi>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      <ToastHostContext.Provider value={registerHost}>
        {children}
      </ToastHostContext.Provider>
      {current ? (
        <ToastPortal host={host}>
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
              // MUI's own sm+ `bottom: 24` would win above sm, so set every breakpoint.
              bottom:
                current.bottom !== undefined
                  ? { xs: current.bottom, sm: current.bottom }
                  : {
                      xs: aboveDock(DOCK_HEIGHT.xs),
                      sm: aboveDock(DOCK_HEIGHT.xs),
                      md: aboveDock(DOCK_HEIGHT.md),
                    },
              // 20 px side insets on phones (handoff section 7).
              left: { xs: 20 },
              right: { xs: 20 },
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
        </ToastPortal>
      ) : null}
    </ToastContext.Provider>
  );
}

/** Note: a change of `host` remounts the toast, replaying it and announcing it again. */
function ToastPortal({
  host,
  children,
}: {
  host: HTMLElement | null;
  children: ReactNode;
}) {
  return host ? createPortal(children, host) : children;
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside a ToastProvider');
  return api;
}
