import {
  Box,
  CheckIcon,
  color,
  focusRingStyle,
  radius,
  Typography,
  visuallyHidden,
} from '@pocket-pantry/ui';
import { useId, type ReactNode } from 'react';

export type Choice<T extends string> = {
  value: T;
  label: ReactNode;
  /** Language of the label, when it differs from the page's. */
  lang?: string;
};

type Props<T extends string> = {
  /** Accessible and visible name of the group. */
  label: string;
  /** A line under the label, read as the group's description. */
  hint?: string;
  choices: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Rows one under another (the default) or chips that wrap. */
  layout?: 'rows' | 'chips';
  /** Hide the visible name (the group keeps it for assistive technology). */
  hideLabel?: boolean;
};

/**
 * A real radio group: native radio inputs sharing one name, so the arrow keys move and pick and Tab
 * enters and leaves the group. The look is on the label; the input is hidden but stays focusable.
 */
export function ChoiceRadioGroup<T extends string>({
  label,
  hint,
  choices,
  value,
  onChange,
  layout = 'rows',
  hideLabel = false,
}: Props<T>) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const choiceRadius = layout === 'rows' ? radius.control : radius.chip;
  return (
    <Box
      role="radiogroup"
      aria-labelledby={labelId}
      aria-describedby={hint ? hintId : undefined}
      sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      <Typography
        id={labelId}
        variant="sectionLabel"
        color="text.secondary"
        sx={hideLabel ? visuallyHidden : undefined}
      >
        {label}
      </Typography>
      {hint ? (
        <Typography id={hintId} variant="meta" color="text.secondary">
          {hint}
        </Typography>
      ) : null}
      <Box
        sx={{
          display: 'flex',
          flexDirection: layout === 'rows' ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {choices.map((choice) => {
          const selected = choice.value === value;
          return (
            <Box
              key={choice.value}
              component="label"
              lang={choice.lang}
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxSizing: 'border-box',
                minHeight: layout === 'rows' ? 50 : 44,
                px: '16px',
                borderRadius: choiceRadius,
                border: '2px solid',
                borderColor: selected ? 'pp.accent' : 'pp.cardLine',
                backgroundColor: selected ? 'pp.accentTint' : 'pp.cardBg',
                color: selected ? color.accentOnTint : 'text.primary',
                fontWeight: selected ? 700 : 600,
                cursor: 'pointer',
                '&:has(input:focus-visible)': focusRingStyle,
              }}
            >
              <Box
                component="input"
                type="radio"
                name={id}
                value={choice.value}
                checked={selected}
                onChange={() => onChange(choice.value)}
                sx={visuallyHidden}
              />
              <span>{choice.label}</span>
              {selected ? (
                <Box
                  aria-hidden
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: 'pp.accent',
                    color: color.accentInk,
                  }}
                >
                  <CheckIcon size={14} />
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
