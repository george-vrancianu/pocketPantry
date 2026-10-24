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
  /** The option's full name, when `label` is a shortened form of it. */
  accessibleLabel?: string;
};

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
   * long label gets more of it than a short one.
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
  return (
    <Box
      role="group"
      aria-label={label}
      sx={(theme) => ({
        display: fullWidth ? 'flex' : 'inline-flex',
        gap: '4px',
        p: '4px',
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
            aria-label={option.accessibleLabel}
            lang={option.lang}
            onClick={() => onChange(option.value)}
            sx={[
              (theme) => {
                const p = themePalette(theme);
                return {
                  minHeight: 36,
                  minWidth: dense ? 0 : 56,
                  flex: fullWidth ? (dense ? '1 1 auto' : 1) : undefined,
                  px: dense ? '4px' : '16px',
                  ...(option.icon
                    ? { flexDirection: 'column', gap: '2px', py: '6px' }
                    : {}),
                  borderRadius: nestedRadius(radius.control, 4),
                  fontSize: dense ? 12 : 14,
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
