import ButtonBase from '@mui/material/ButtonBase';
import Box from '@mui/material/Box';
import type { ReactNode } from 'react';
import { focusRing } from '../theme/focusRing';
import {
  bodyFont,
  nestedRadius,
  radius,
  shadow,
  themePalette,
} from '../theme/themeVars';

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
  /** Language of the label, when it differs from the page's (e.g. a language's own name). */
  lang?: string;
  /** A decorative icon drawn above the label. */
  icon?: ReactNode;
};

/** Dense padding on each side of a label, and the gap between segments. */
const DENSE_PAD = 2;
const DENSE_GAP = 2;

/**
 * A dense full-width label's size: the track's width shared out over every
 * label's characters (about 0.6 em each in the Theme fonts), from 13 px down
 * to 11 px, so the longest labels (Romanian Locations) still fit whole on a
 * 320 px phone. Never truncated: below 11 px the label wraps between words.
 */
function denseFontSize(labels: string[]) {
  const chars = labels.reduce((sum, label) => sum + label.length, 0);
  const room = DENSE_GAP * (labels.length - 1) + DENSE_PAD * 2 * labels.length;
  const perEm = Number((0.6 * chars).toFixed(2));
  return `clamp(11px, calc((100cqi - ${room}px) / ${perEm}), 13px)`;
}

export type SegmentedControlProps<T extends string> = {
  /** Accessible name of the group. */
  label: string;
  options: SegmentedControlOption<T>[];
  /** The pressed option; null presses none (nothing chosen yet). */
  value: T | null;
  onChange: (value: T) => void;
  /** Stretch to the container's width, sharing it evenly between the options. */
  fullWidth?: boolean;
  /**
   * Less padding, no minimum width and a smaller label, for long labels on a
   * narrow phone. With `fullWidth` the width is shared by label length, so a
   * long label gets more of it than a short one, and the label shrinks with
   * the track (down to 11 px) rather than being cut.
   */
  dense?: boolean;
};

/** A row of toggle buttons where exactly one is pressed. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  fullWidth = false,
  dense = false,
}: SegmentedControlProps<T>) {
  // Only a full-width track has a width of its own to measure the labels against.
  const fluid = dense && fullWidth;
  const fontSize = fluid
    ? denseFontSize(options.map((option) => option.label))
    : dense
      ? 12
      : 14;
  return (
    <Box
      role="group"
      aria-label={label}
      sx={(theme) => ({
        display: fullWidth ? 'flex' : 'inline-flex',
        gap: dense ? `${DENSE_GAP}px` : '4px',
        p: dense ? '2px' : '4px',
        ...(fluid ? { containerType: 'inline-size' } : {}),
        backgroundColor: themePalette(theme).pp.chip,
        borderRadius: radius.control,
      })}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <ButtonBase
            key={option.value}
            aria-pressed={selected}
            lang={option.lang}
            onClick={() => onChange(option.value)}
            sx={[
              (theme) => {
                const p = themePalette(theme);
                return {
                  minHeight: 36,
                  minWidth: dense ? 0 : 56,
                  flex: fullWidth ? (dense ? '1 1 auto' : 1) : undefined,
                  px: dense ? `${DENSE_PAD}px` : '16px',
                  ...(option.icon
                    ? { flexDirection: 'column', gap: '2px', py: '6px' }
                    : {}),
                  borderRadius: nestedRadius(radius.control, dense ? 2 : 4),
                  fontSize,
                  fontWeight: selected ? 700 : 600,
                  fontFamily: bodyFont,
                  backgroundColor: selected ? p.pp.segOn : 'transparent',
                  color: selected ? p.pp.segOnInk : p.text.secondary,
                  boxShadow: selected ? shadow.segment : 'none',
                };
              },
              focusRing,
            ]}
          >
            {option.icon}
            {option.label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
