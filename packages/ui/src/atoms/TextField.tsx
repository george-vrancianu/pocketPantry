import MuiTextField, {
  type TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';

export type TextFieldProps = Omit<MuiTextFieldProps, 'variant'>;

/** Outlined, full-width text input with a visible label. */
export function TextField(props: TextFieldProps) {
  return <MuiTextField variant="outlined" fullWidth {...props} />;
}
