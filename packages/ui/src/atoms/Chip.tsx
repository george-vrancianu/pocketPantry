import Box from '@mui/material/Box';
import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { focusRing } from '../theme/focusRing';
import { CloseIcon } from './icons';
import { bodyFont, border, radius, themePalette } from '../theme/themeVars';

export type ChipProps = Omit<ButtonBaseProps, 'children' | 'color'> & {
  label: ReactNode;
  /** Leading icon, painted `accent` (or `accent-on-tint` when on). */
  icon?: ReactNode;
  /** Quiet trailing text, e.g. "12 items". */
  meta?: ReactNode;
  /** On or off, announced as pressed; leave it out for a chip that is not a toggle. */
  selected?: boolean;
  /** Adds a dismiss × after a divider; needs `dismissLabel`. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button, e.g. "Remove Milk". */
  dismissLabel?: string;
};

/** Handoff section 4 Chip: 36 high, radius `r-chip`, `surface` + `line`; on is `accent-tint` with no border. */
const pill = (selected: boolean | undefined) => (theme: Theme) => {
  const p = themePalette(theme);
  return {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    gap: '6px',
    height: 36,
    boxSizing: 'border-box',
    borderRadius: radius.chip,
    borderWidth: border.width,
    borderStyle: 'solid',
    borderColor: selected ? 'transparent' : p.pp.line,
    backgroundColor: selected ? p.pp.accentTint : p.background.paper,
    color: selected ? p.pp.accentOnTint : p.text.primary,
    fontFamily: bodyFont,
    fontSize: 13.5,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    '& .chip-icon': {
      display: 'flex',
      color: selected ? p.pp.accentOnTint : p.pp.accent,
      '& svg': { width: 15, height: 15 },
    },
    '& .chip-meta': {
      fontSize: 12,
      fontWeight: 500,
      color: selected ? p.pp.accentOnTint : p.text.secondary,
      fontVariantNumeric: 'tabular-nums',
    },
  };
};

/** A suggestion, filter or template chip in the active Theme. */
export function Chip({
  label,
  icon,
  meta,
  selected,
  onDismiss,
  dismissLabel,
  sx,
  ...props
}: ChipProps) {
  const content = (
    <>
      {icon ? (
        <Box component="span" aria-hidden className="chip-icon">
          {icon}
        </Box>
      ) : null}
      {label}
      {meta ? (
        <>
          {' '}
          <Box component="span" className="chip-meta">
            {meta}
          </Box>
        </>
      ) : null}
    </>
  );
  const pressed = selected === undefined ? undefined : selected;
  if (!onDismiss) {
    return (
      <ButtonBase
        disableRipple
        aria-pressed={pressed}
        sx={[
          pill(selected),
          { px: '12px', pl: icon ? '10px' : '12px' },
          focusRing,
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      >
        {content}
      </ButtonBase>
    );
  }
  // A dismissible chip is two buttons in one pill: buttons can't nest.
  return (
    <Box
      component="span"
      sx={[pill(selected), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <ButtonBase
        disableRipple
        aria-pressed={pressed}
        sx={[
          {
            height: '100%',
            gap: '6px',
            pl: icon ? '10px' : '12px',
            pr: '4px',
            borderRadius: radius.chip,
            font: 'inherit',
            color: 'inherit',
          },
          focusRing,
        ]}
        {...props}
      >
        {content}
      </ButtonBase>
      <ButtonBase
        disableRipple
        aria-label={dismissLabel}
        onClick={onDismiss}
        sx={[
          (theme) => {
            const p = themePalette(theme);
            return {
              height: '100%',
              pl: '4px',
              pr: '12px',
              borderRadius: `0 ${radius.chip} ${radius.chip} 0`,
              color: p.text.secondary,
              // The divider sits on the inner span so it stays short.
              '& > span': {
                display: 'flex',
                pl: '8px',
                borderLeft: `1px solid ${p.divider}`,
              },
            };
          },
          focusRing,
        ]}
      >
        <span>
          <CloseIcon size={12} />
        </span>
      </ButtonBase>
    </Box>
  );
}
