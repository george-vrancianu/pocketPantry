import {
  Box,
  ChevronDownIcon,
  FieldUnit,
  PlusIcon,
  Typography,
  tokens,
  border,
  color,
  nestedRadius,
  radius,
  shadow,
} from '@pocket-pantry/ui';
import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { UNITS, type Unit } from '../lib/catalog';
import {
  convertQuantity,
  parseTypedNumber,
  stepAmount,
  unitsInFamily,
  type AmountScale,
} from '../lib/usualAmounts';
import { UsualAmountRow } from './UsualAmountRow';

const TYPED_UNITS: Record<string, Unit> = {
  g: 'g',
  kg: 'kg',
  ml: 'ml',
  l: 'l',
  pcs: 'pcs',
  pc: 'pcs',
  stk: 'pcs',
  buc: 'pcs',
};
/** Whether `alias` is still on its way to a unit the pattern takes. */
const continuesAlias = (alias: string) =>
  Object.keys(TYPED_UNITS).some(
    (known) => known.startsWith(alias) || `${known}.` === alias,
  );
// Android IMEs report typing as composition text.
const TYPED_INPUT_TYPES = new Set(['insertText', 'insertCompositionText']);
const TYPED_AMOUNT = /^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|pcs|pc|stk|buc)\.?$/i;

export type AmountFieldProps = {
  /** Name of the item whose amount this is, for the accessible names; empty before a pick. */
  name: string;
  quantity: string;
  unit: Unit | '';
  /** A typed unit ("500 g") arrives with the quantity, as one change. */
  onQuantityChange: (quantity: string, unit?: Unit | '') => void;
  onUnitChange: (unit: Unit | '') => void;
  /** Why the quantity is invalid, or null when it is fine. */
  error: string | null;
  /** Enter in the input. */
  onSubmit: () => void;
  /** A round button beside the input (the Add sheet's "+"); leave out when a footer saves. */
  submit?: { label: string; disabled: boolean };
  /** Offer "no unit" in the chip; off where a quantity always needs a unit (Pantry Batches). */
  allowNoUnit?: boolean;
  /** A visible label on the border, like the floating labels of the form fields around it. */
  label?: string;
  /** Input height in px; 56 matches the outlined form fields around it. */
  height?: number;
  /** The edge the unit popover lines up with: 'end' when the field reaches the right edge, 'start' when something sits to its right. */
  popoverAlign?: 'start' | 'end';
  /** The Ingredient's Amount Scale, which decides its Usual Amount chips. Null or left out (an Unmatched name, the amount sheet) offers chips from the unit alone. */
  amountScale?: AmountScale | null;
};

/**
 * One number input with a unit chip inside it, and an optional submit button beside it.
 * The chip opens a small group of toggle buttons; Escape closes that first. It has no outer
 * padding: the host (the Add sheet's row, the amount sheet, the Pantry Batch forms) places it.
 */
export function AmountField({
  name,
  quantity,
  unit,
  onQuantityChange,
  onUnitChange,
  error,
  onSubmit,
  submit,
  allowNoUnit = true,
  label,
  height = 44,
  popoverAlign = 'end',
  amountScale,
}: AmountFieldProps) {
  const { t } = useTranslation('common');
  const errorId = useId();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);
  const unitLabel = unit
    ? t(`common:units.${unit}`)
    : t('common:amount.noUnit');

  // What the last keystroke split off, so the next one can continue the unit
  // ("pc" then "s") or undo the split ("g" then "r" of "gram").
  const split = useRef<{
    quantity: string;
    original: string;
    alias: string;
    previousUnit: Unit | '';
  } | null>(null);
  const type = (text: string, typedAtEnd: boolean) => {
    // Only a character typed at the end continues or undoes a split; a paste
    // or an edit mid-text is a fresh amount.
    const last = typedAtEnd ? split.current : null;
    split.current = null;
    const rest = last ? text.slice(last.quantity.length) : '';
    if (
      last &&
      text.startsWith(last.quantity) &&
      rest.length === 1 &&
      !/\d/.test(rest)
    ) {
      const alias = last.alias + rest.toLowerCase();
      if (continuesAlias(alias)) {
        split.current = { ...last, alias, original: last.original + rest };
        onQuantityChange(last.quantity);
      } else {
        onQuantityChange(last.original + rest, last.previousUnit);
      }
      return;
    }
    const typed = TYPED_AMOUNT.exec(text);
    const typedUnit = typed?.[2] ? TYPED_UNITS[typed[2].toLowerCase()] : null;
    if (typed?.[1] && typed[2] && typedUnit) {
      split.current = {
        quantity: typed[1],
        original: text,
        alias: typed[2].toLowerCase(),
        previousUnit: unit,
      };
      onQuantityChange(typed[1], typedUnit);
    } else {
      onQuantityChange(text);
    }
  };
  const choose = (next: Unit | '') => {
    split.current = null;
    // Within a family the number is rescaled, so the amount stays the same (1.5 kg is 1500 g).
    const value = parseTypedNumber(quantity);
    if (
      amountScale &&
      unit &&
      next &&
      next !== unit &&
      value !== null &&
      unitsInFamily(unit).includes(next)
    ) {
      onQuantityChange(String(convertQuantity(value, unit, next)));
    }
    onUnitChange(next);
    setPicking(false);
    input.current?.focus();
  };
  // With chips, the unit moves within its family only; elsewhere every unit is offered.
  const offered: readonly Unit[] = amountScale ? unitsInFamily(unit) : UNITS;
  const pick = (value: number) => {
    split.current = null;
    onQuantityChange(String(value));
  };
  const keyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && picking) {
      // The popover goes first; the sheet stays open.
      event.stopPropagation();
      setPicking(false);
      input.current?.focus();
    }
  };
  // Up and down step the amount; an empty field only steps up.
  const step = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    split.current = null;
    const direction = event.key === 'ArrowUp' ? 1 : -1;
    const empty = quantity.trim() === '';
    if (empty && direction < 0) return;
    const current = empty ? 0 : parseTypedNumber(quantity);
    if (current === null) return;
    onQuantityChange(
      String(stepAmount(current, direction, unit, event.shiftKey)),
    );
  };
  const blur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setPicking(false);
  };

  return (
    <Box onKeyDown={keyDown} onBlur={blur}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            minWidth: 0,
            height,
            display: 'flex',
            alignItems: 'center',
            borderRadius: radius.control,
            border: `${border.field} solid ${error ? tokens.color.urgentFg : tokens.color.line}`,
            backgroundColor: color.fieldBg,
            '&:focus-within': {
              borderColor: error ? tokens.color.urgentFg : tokens.color.accent,
              boxShadow: `0 0 0 3px ${tokens.color.accentTint}`,
            },
          }}
        >
          {label ? (
            <Box
              component="label"
              htmlFor={inputId}
              sx={{
                position: 'absolute',
                top: 0,
                left: 10,
                transform: 'translateY(-50%)',
                px: '4px',
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1,
                color: tokens.color.muted,
                backgroundColor: color.fieldBg,
                pointerEvents: 'none',
              }}
            >
              {label}
            </Box>
          ) : null}
          <Box
            component="input"
            id={inputId}
            ref={input}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            aria-label={
              name
                ? t('common:amount.label', { name })
                : t('common:amount.labelNoName')
            }
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            placeholder={t('common:amount.placeholder')}
            value={quantity}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              type(
                event.target.value,
                TYPED_INPUT_TYPES.has(
                  (event.nativeEvent as InputEvent).inputType,
                ) && event.target.selectionStart === event.target.value.length,
              )
            }
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onSubmit();
              } else {
                step(event);
              }
            }}
            sx={{
              flex: 1,
              minWidth: 0,
              height: '100%',
              pl: '12px',
              border: 0,
              outline: 0,
              background: 'transparent',
              font: 'inherit',
              fontSize: 16,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              color: tokens.color.ink,
            }}
          />
          <FieldUnit
            aria-label={t('common:amount.unit', { unit: unitLabel })}
            aria-expanded={picking}
            onClick={() => setPicking((value) => !value)}
            sx={{ mr: '5px', px: 1, gap: '4px' }}
          >
            {unitLabel}
            <ChevronDownIcon size={14} />
          </FieldUnit>
          {picking ? (
            <Box
              role="group"
              aria-label={t('common:amount.units')}
              // Keep focus where it is so a tap does not blur the popover shut.
              onMouseDown={(event: { preventDefault: () => void }) =>
                event.preventDefault()
              }
              sx={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                ...(popoverAlign === 'end' ? { right: 0 } : { left: 0 }),
                zIndex: 1,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent:
                  popoverAlign === 'end' ? 'flex-end' : 'flex-start',
                // Wrap rather than run off the sheet's left edge on narrow phones.
                maxWidth: 'min(260px, calc(100vw - 72px))',
                gap: '2px',
                p: '5px',
                borderRadius: radius.control,
                border: `${border.width} solid ${tokens.color.line}`,
                backgroundColor: tokens.color.surface,
                boxShadow: shadow.float,
              }}
            >
              {(allowNoUnit ? (['', ...offered] as const) : offered).map(
                (option) => {
                  const selected = option === unit;
                  return (
                    <Box
                      key={option || 'none'}
                      component="button"
                      type="button"
                      aria-pressed={selected}
                      onClick={() => choose(option)}
                      sx={{
                        height: 34,
                        minWidth: 40,
                        px: 1,
                        border: 0,
                        borderRadius: nestedRadius(radius.control, 5),
                        cursor: 'pointer',
                        font: 'inherit',
                        fontSize: 13.5,
                        fontWeight: 700,
                        backgroundColor: selected
                          ? tokens.color.accent
                          : 'transparent',
                        color: selected ? color.accentInk : tokens.color.ink,
                      }}
                    >
                      {option ? t(`common:units.${option}`) : '—'}
                    </Box>
                  );
                },
              )}
            </Box>
          ) : null}
        </Box>
        {submit ? (
          <Box
            component="button"
            type="button"
            aria-label={submit.label}
            disabled={submit.disabled}
            onClick={onSubmit}
            sx={{
              flexShrink: 0,
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
              border: 0,
              borderRadius: radius.control,
              cursor: 'pointer',
              backgroundColor: tokens.color.accent,
              color: color.accentInk,
              '&:disabled': { opacity: 0.5, cursor: 'default' },
            }}
          >
            <PlusIcon size={20} />
          </Box>
        ) : null}
      </Box>
      <UsualAmountRow
        name={name}
        scale={amountScale}
        unit={unit}
        quantity={quantity}
        onPick={pick}
      />
      {error ? (
        <Typography
          id={errorId}
          variant="meta"
          sx={{ display: 'block', mt: 0.75, color: tokens.color.urgentFg }}
        >
          {error}
        </Typography>
      ) : null}
    </Box>
  );
}
