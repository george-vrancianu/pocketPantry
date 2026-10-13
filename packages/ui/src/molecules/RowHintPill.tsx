import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Box } from '../atoms/Layout';
import { ArrowLeftIcon } from '../atoms/icons';
import { tokens } from '../theme/tokens';
import { usePrefersReducedMotion } from '../theme/usePrefersReducedMotion';

const FADE_MS = 250;

export type RowHintPillProps = {
  /** Turn off to fade the pill away; it leaves the layout once faded. */
  open: boolean;
  /** The hint, e.g. "Swipe left to remove · hold to edit". */
  children: ReactNode;
};

/**
 * The first-use hint under a list's header (handoff section 7): a small pill telling the Member how the
 * row gestures work. It fades over 250 ms when `open` turns off (instantly under reduce-motion).
 */
export function RowHintPill({ open, children }: RowHintPillProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (open) {
      setGone(false);
      return;
    }
    const timer = setTimeout(() => setGone(true), reduceMotion ? 0 : FADE_MS);
    return () => clearTimeout(timer);
  }, [open, reduceMotion]);
  if (gone) return null;
  return (
    <Box
      data-row-hint=""
      sx={{
        display: 'flex',
        justifyContent: 'center',
        my: 1,
        opacity: open ? 1 : 0,
        transition: reduceMotion ? 'none' : `opacity ${FADE_MS}ms`,
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          px: '12px',
          py: '7px',
          borderRadius: 999,
          bgcolor: tokens.color.accentTint,
          color: tokens.color.accent,
          fontSize: 12.5,
          fontWeight: 600,
        }}
      >
        <ArrowLeftIcon size={14} aria-hidden="true" />
        {children}
      </Box>
    </Box>
  );
}
