import Box, { type BoxProps } from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';

export type CardProps = BoxProps & {
  /**
   * Handoff section 4. `default` is the stat card (padding 14 16), `media` a
   * card led by an image (10 10 14), `list` holds rows separated by
   * `divider` (4 16).
   */
  variant?: 'default' | 'media' | 'list';
};

const padding = {
  default: '14px 16px',
  media: '10px 10px 14px',
  list: '4px 16px',
} as const;

/** The card's edge per Theme: hairline + warm shadow, hairline only, or borderless with an inner highlight. */
const edge = (theme: Theme) => {
  const { pp } = (theme.vars ?? theme).palette;
  return {
    backgroundColor: pp.cardBg,
    // Longhands: jsdom drops shorthands that hold `var()`.
    borderTopWidth: 'var(--pp-bw)',
    borderRightWidth: 'var(--pp-bw)',
    borderBottomWidth: 'var(--pp-bw)',
    borderLeftWidth: 'var(--pp-bw)',
    borderStyle: 'solid',
    borderColor: pp.cardLine,
    borderRadius: 'var(--pp-r-card)',
    boxShadow: 'var(--pp-shadow-card)',
    transition: 'background-color 200ms, color 200ms, box-shadow 200ms',
  };
};

/** A surface that groups content, in the active Theme's card look. */
export function Card({ variant = 'default', sx, ...props }: CardProps) {
  return (
    <Box
      sx={[
        edge,
        { padding: padding[variant], minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
