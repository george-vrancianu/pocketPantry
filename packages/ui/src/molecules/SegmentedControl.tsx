import ButtonBase from '@mui/material/ButtonBase';
import Box from '@mui/material/Box';
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
};

export type SegmentedControlProps<T extends string> = {
  /** Accessible name of the group. */
  label: string;
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** A row of toggle buttons where exactly one is pressed. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <Box
      role="group"
      aria-label={label}
      sx={(theme) => ({
        display: 'inline-flex',
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
            onClick={() => onChange(option.value)}
            sx={[
              (theme) => {
                const p = themePalette(theme);
                return {
                  minHeight: 36,
                  minWidth: 56,
                  px: '16px',
                  borderRadius: nestedRadius(radius.control, 4),
                  fontSize: 14,
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
            {option.label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
