import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField';
import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { useToast } from '../molecules/ToastProvider';
import { IconButton } from './IconButton';
import { InputAdornment } from './InputAdornment';
import { PasteIcon } from './icons';

/**
 * Turns on a Paste button at the end of a `TextField`. The app supplies both
 * strings: `label` names the button, `emptyMessage` is the polite toast when
 * the clipboard holds no text or cannot be read.
 */
export type TextFieldPaste = { label: string; emptyMessage: string };

type FieldElement = HTMLInputElement | HTMLTextAreaElement;
type SlotProps = MuiTextFieldProps['slotProps'];
type OnChange = MuiTextFieldProps['onChange'];

/**
 * Wires a Paste button into a field: returns the `inputRef`, `onChange` and
 * `slotProps` to hand to MUI. The button shows only while the field is empty
 * (the `value` when controlled, the text typed so far when not) and the
 * browser can read clipboard text; otherwise the field's own end adornment
 * (if any) keeps the slot.
 */
export function useTextFieldPaste({
  paste,
  inputRef,
  value,
  defaultValue,
  onChange,
  slotProps,
}: {
  paste: TextFieldPaste | undefined;
  inputRef: Ref<FieldElement> | undefined;
  value: unknown;
  defaultValue: unknown;
  onChange: OnChange;
  slotProps: SlotProps;
}): {
  mergedRef: Ref<FieldElement>;
  onChange: OnChange;
  slotProps: SlotProps;
} {
  const ownInput = useRef<FieldElement | null>(null);
  const [uncontrolledEmpty, setUncontrolledEmpty] = useState(
    () => String(defaultValue ?? '') === '',
  );
  const empty =
    value === undefined ? uncontrolledEmpty : String(value ?? '') === '';
  const mergedRef = useCallback(
    (element: FieldElement | null) => {
      ownInput.current = element;
      assignRef(inputRef, element);
    },
    [inputRef],
  );
  const showPaste = paste !== undefined && empty && canReadClipboard();
  return {
    mergedRef,
    onChange: (event) => {
      setUncontrolledEmpty(event.target.value === '');
      onChange?.(event);
    },
    slotProps: showPaste
      ? withEndAdornment(
          slotProps,
          <InputAdornment position="end">
            <PasteButton paste={paste} input={ownInput} />
          </InputAdornment>,
        )
      : slotProps,
  };
}

function canReadClipboard() {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard?.readText === 'function'
  );
}

/** `slotProps` with its input's end adornment replaced by `endAdornment`. */
function withEndAdornment(
  slotProps: SlotProps,
  endAdornment: ReactNode,
): SlotProps {
  const input = slotProps?.input;
  return {
    ...slotProps,
    input:
      typeof input === 'function'
        ? (state) => ({ ...input(state), endAdornment })
        : { ...input, endAdornment },
  };
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
  paste: TextFieldPaste;
  input: RefObject<FieldElement | null>;
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
