import Box, { type BoxProps } from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

export type TagTone = 'accent' | 'ok' | 'soon' | 'urgent';

export type TagProps = Omit<BoxProps, 'children'> & {
  /**
   * Handoff section 4: `accent` (On list, Staple), `ok` (In Pantry), `soon`
   * and `urgent` (expiry).
   */
  tone: TagTone;
  /** Leading icon, e.g. for an expired item. */
  icon?: ReactNode;
  children: ReactNode;
};

const pair = (tone: TagTone) => (theme: Theme) => {
  const p = (theme.vars ?? theme).palette;
  const [backgroundColor, color] = {
    accent: [p.pp.accentTint, p.pp.accentOnTint],
    ok: [p.success.light, p.success.main],
    soon: [p.warning.light, p.warning.main],
    urgent: [p.error.light, p.error.main],
  }[tone];
  return { backgroundColor, color };
};

/** A small status label: 11/700, fully round, in one of the Theme's colour pairs. */
export function Tag({ tone, icon, children, sx, ...props }: TagProps) {
  return (
    <Box
      component="span"
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          px: '8px',
          py: '3px',
          borderRadius: '999px',
          fontFamily: 'var(--pp-body)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '.01em',
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
          '& svg': { flexShrink: 0 },
        },
        pair(tone),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {icon}
      {children}
    </Box>
  );
}
