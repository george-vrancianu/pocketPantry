import ButtonBase from '@mui/material/ButtonBase';
import Box from '@mui/material/Box';
import { focusRing } from '../theme/focusRing';

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
        backgroundColor: (theme.vars ?? theme).palette.pp.chip,
        borderRadius: 'var(--pp-r-ctl)',
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
                const p = (theme.vars ?? theme).palette;
                return {
                  minHeight: 36,
                  minWidth: 56,
                  px: '16px',
                  borderRadius: 'calc(var(--pp-r-ctl) - 4px)',
                  fontSize: 14,
                  fontWeight: selected ? 700 : 600,
                  fontFamily: 'var(--pp-body)',
                  backgroundColor: selected ? p.pp.segOn : 'transparent',
                  color: selected ? p.pp.segOnInk : p.text.secondary,
                  boxShadow: selected ? 'var(--pp-shadow-seg)' : 'none',
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
