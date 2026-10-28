import MuiTextField, {
  type TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';
import { useTextFieldPaste, type TextFieldPaste } from './TextFieldPaste';

export type TextFieldProps = Omit<MuiTextFieldProps, 'variant'> & {
  /**
   * Turns on a Paste button at the end of the field (see `TextFieldPaste`).
   * The button shows only while the controlled `value` is empty and the
   * browser can read clipboard text; otherwise the field's own end adornment
   * (if any) takes the slot.
   */
  paste?: TextFieldPaste;
};

/**
 * Outlined, full-width text input with a visible label.
 *
 * A native select always shows its chosen option, even an empty-valued
 * "None", so its label floats above the field from the start rather than
 * sitting on top of that option.
 */
export function TextField({ paste, inputRef, ...props }: TextFieldProps) {
  const { select, slotProps } = props;
  const native =
    select &&
    typeof slotProps?.select === 'object' &&
    slotProps.select.native === true;
  const inputLabel = slotProps?.inputLabel;
  const labelled =
    native && typeof inputLabel !== 'function'
      ? { ...slotProps, inputLabel: { shrink: true, ...inputLabel } }
      : slotProps;
  const pasting = useTextFieldPaste({
    paste,
    inputRef,
    value: props.value,
    slotProps: labelled,
  });
  return (
    <MuiTextField
      variant="outlined"
      fullWidth
      {...props}
      inputRef={pasting.mergedRef}
      slotProps={pasting.slotProps}
    />
  );
}
