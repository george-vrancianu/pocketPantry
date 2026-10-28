import MuiTextField, {
  type TextFieldProps as MuiTextFieldProps,
} from '@mui/material/TextField';
import { useCallback, useRef, type Ref, type RefObject } from 'react';
import { useToast } from '../molecules/ToastProvider';
import { IconButton } from './IconButton';
import { InputAdornment } from './InputAdornment';
import { PasteIcon } from './icons';

export type TextFieldProps = Omit<MuiTextFieldProps, 'variant'> & {
  /**
   * Turns on a Paste button at the end of the field. The app supplies both
   * strings: `label` names the button, `emptyMessage` is the polite toast when
   * the clipboard holds no text or cannot be read. The button shows only
   * while the controlled `value` is empty and the browser can read clipboard
   * text; otherwise the field's own end adornment (if any) takes the slot.
   */
  paste?: { label: string; emptyMessage: string };
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
  const input = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const ref = useCallback(
    (element: HTMLInputElement | HTMLTextAreaElement | null) => {
      input.current = element;
      assignRef(inputRef, element);
    },
    [inputRef],
  );
  const native =
    select &&
    typeof slotProps?.select === 'object' &&
    slotProps.select.native === true;
  const inputLabel = slotProps?.inputLabel;
  let merged =
    native && typeof inputLabel !== 'function'
      ? { ...slotProps, inputLabel: { shrink: true, ...inputLabel } }
      : slotProps;
  const canPaste =
    paste !== undefined &&
    String(props.value ?? '') === '' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard?.readText === 'function';
  if (canPaste) {
    const endAdornment = (
      <InputAdornment position="end">
        <PasteButton paste={paste} input={input} />
      </InputAdornment>
    );
    const own = merged?.input;
    merged = {
      ...merged,
      input:
        typeof own === 'function'
          ? (state) => ({ ...own(state), endAdornment })
          : { ...own, endAdornment },
    };
  }
  return (
    <MuiTextField
      variant="outlined"
      fullWidth
      {...props}
      inputRef={ref}
      slotProps={merged}
    />
  );
}

/**
 * Reads the clipboard into the field as if typed, so the caller's `onChange`
 * sees it, then focuses the field. Mounted only while it shows, so a field
 * without `paste` needs no ToastProvider.
 */
function PasteButton({
  paste,
  input,
}: {
  paste: NonNullable<TextFieldProps['paste']>;
  input: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
}) {
  const toast = useToast();
  const read = async () => {
    let text = '';
    try {
      text = (await navigator.clipboard.readText()).trim();
    } catch {
      // Permission refused: nothing to paste, as far as the Member can tell.
    }
    const element = input.current;
    if (text === '' || !element) {
      toast.show(paste.emptyMessage, { polite: true });
      return;
    }
    // React tracks the value it last set; going through the native setter and
    // an input event makes it fire `onChange` exactly as typing would.
    Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(element),
      'value',
    )?.set?.call(element, text);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.focus();
  };
  return (
    <IconButton
      label={paste.label}
      tone="plain"
      size={40}
      onClick={() => void read()}
    >
      <PasteIcon size={20} />
    </IconButton>
  );
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}
