import MuiCheckbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { useId, type ChangeEvent } from 'react';

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Explains the choice; read out with the label. */
  helperText?: string;
};

/** A labelled checkbox with optional helper text underneath. */
export function Checkbox({
  label,
  checked,
  onChange,
  helperText,
}: CheckboxProps) {
  const helperId = useId();
  return (
    <FormControl>
      <FormControlLabel
        label={label}
        control={
          <MuiCheckbox
            checked={checked}
            onChange={onChange}
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
