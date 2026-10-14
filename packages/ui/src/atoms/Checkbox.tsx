import MuiCheckbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import type { Theme } from '@mui/material/styles';
import { useId, type ChangeEvent } from 'react';
import { focusRing } from '../theme/focusRing';
import { CheckIcon } from './icons';

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Explains the choice; read out with the label. */
  helperText?: string;
  disabled?: boolean;
};

/** Handoff section 4: a 24 box, radius `r-box`, 2 px `box` border; checked is an `accent` fill with an `accent-ink` tick. */
function boxSx(checked: boolean) {
  return (theme: Theme) => {
    const { pp } = (theme.vars ?? theme).palette;
    const fill = checked ? pp.accent : 'transparent';
    return {
      width: 24,
      height: 24,
      p: 0,
      flex: '0 0 auto',
      borderRadius: 'var(--pp-r-box)',
      border: '2px solid',
      borderColor: checked ? pp.accent : pp.box,
      backgroundColor: fill,
      color: pp.accentInk,
      '&:hover': { backgroundColor: fill },
      '&.Mui-checked': { color: pp.accentInk },
      '&.Mui-disabled': { opacity: 0.45, color: pp.accentInk },
    };
  };
}

/** A labelled checkbox with optional helper text underneath. */
export function Checkbox({
  label,
  checked,
  onChange,
  helperText,
  disabled,
}: CheckboxProps) {
  const helperId = useId();
  return (
    <FormControl>
      <FormControlLabel
        label={label}
        sx={{ ml: 0, gap: '10px' }}
        control={
          <MuiCheckbox
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            disableRipple
            icon={<span />}
            checkedIcon={<CheckIcon size={15} strokeWidth={3} />}
            sx={[boxSx(checked), focusRing]}
            slotProps={{
              input: { 'aria-describedby': helperText ? helperId : undefined },
            }}
          />
        }
      />
      {helperText ? (
        <FormHelperText id={helperId}>{helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
}
