import { Box, tokens } from '@pocket-pantry/ui';
import type { ReactNode } from 'react';

/** The 40 px, 12 px-radius control look shared by every input in the edit panel. */
export const controlSx = {
  boxSizing: 'border-box',
  width: '100%',
  height: 40,
  px: '12px',
  borderRadius: `${tokens.radius.field}px`,
  border: `1px solid ${tokens.color.line}`,
  bgcolor: tokens.color.surface,
  color: tokens.color.ink,
  fontFamily: 'inherit',
  fontSize: 14,
  '&:focus-visible': {
    outline: `3px solid ${tokens.color.accent}`,
    outlineOffset: 1,
  },
} as const;

type Props = {
  /** The id of the control inside, so the visible label is its accessible name. */
  htmlFor: string;
  label: string;
  /** Spans both columns of the panel grid. */
  wide?: boolean;
  /** Inline error text; the control points at it with `errorId`. */
  error?: string;
  errorId?: string;
  children: ReactNode;
};

/** A labelled control with its inline error under it. */
export function Field({
  htmlFor,
  label,
  wide,
  error,
  errorId,
  children,
}: Props) {
  return (
    <Box sx={{ gridColumn: wide ? '1 / -1' : undefined, minWidth: 0 }}>
      <Box
        component="label"
        id={`${htmlFor}-label`}
        htmlFor={htmlFor}
        sx={{
          display: 'block',
          mb: '4px',
          fontSize: 11,
          fontWeight: 600,
          color: tokens.color.muted,
        }}
      >
        {label}
      </Box>
      {children}
      {error ? (
        <Box
          id={errorId}
          sx={{ mt: '4px', fontSize: 12, color: tokens.color.urgentFg }}
        >
          {error}
        </Box>
      ) : null}
    </Box>
  );
}
