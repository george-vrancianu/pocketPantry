import ButtonBase from '@mui/material/ButtonBase';
import Box from '@mui/material/Box';
import { tokens } from '../theme/tokens';

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
  const { color } = tokens;
  return (
    <Box
      role="group"
      aria-label={label}
      sx={{
        display: 'inline-flex',
        gap: '4px',
        p: '4px',
        backgroundColor: color.surface,
        border: `1px solid ${color.line}`,
        borderRadius: `${tokens.radius.chip}px`,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <ButtonBase
            key={option.value}
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            sx={{
              minHeight: 40,
              minWidth: 56,
              px: '16px',
              borderRadius: `${tokens.radius.chip}px`,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: tokens.font.body,
              backgroundColor: selected ? color.ink : 'transparent',
              color: selected ? '#FFFFFF' : color.muted,
            }}
          >
            {option.label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
