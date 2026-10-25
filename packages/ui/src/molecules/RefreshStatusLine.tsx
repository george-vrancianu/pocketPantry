import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { CheckIcon } from '../atoms/icons';
import { tokens } from '../theme/tokens';
import { color } from '../theme/themeVars';
import { usePrefersReducedMotion } from '../theme/usePrefersReducedMotion';

export type RefreshStatusLineProps = {
  state: 'idle' | 'busy' | 'done' | 'failed';
  labels: { busy: string; done: string; failed: string };
  /** What the line shows at rest (e.g. today's date); empty by default. */
  rest?: ReactNode;
};

/** The status line under a tab root's title: empty (or `rest`) at rest; a polite live region so the outcome is announced. */
export function RefreshStatusLine({
  state,
  labels,
  rest,
}: RefreshStatusLineProps) {
  const reduceMotion = usePrefersReducedMotion();
  return (
    <Box
      role="status"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 600,
        color:
          state === 'done'
            ? tokens.color.accentOnTint
            : state === 'failed'
              ? tokens.color.soonFg
              : tokens.color.muted,
      }}
    >
      {state === 'busy' ? (
        <>
          <Box
            aria-hidden
            sx={
              reduceMotion
                ? {
                    width: 6,
                    height: 6,
                    m: '2.5px',
                    borderRadius: '50%',
                    bgcolor: tokens.color.accent,
                  }
                : {
                    width: 11,
                    height: 11,
                    boxSizing: 'border-box',
                    borderRadius: '50%',
                    border: `2px solid ${color.lineStrong}`,
                    borderTopColor: tokens.color.accent,
                    '@keyframes pp-refresh-spin': {
                      to: { transform: 'rotate(360deg)' },
                    },
                    animation: 'pp-refresh-spin 0.8s linear infinite',
                  }
            }
          />
          {labels.busy}
        </>
      ) : state === 'done' ? (
        <>
          <CheckIcon size={13} />
          {labels.done}
        </>
      ) : state === 'failed' ? (
        labels.failed
      ) : (
        (rest ?? null)
      )}
    </Box>
  );
}
