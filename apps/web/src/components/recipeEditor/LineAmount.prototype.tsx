// PROTOTYPE: compact amount (quantity + unit in one input) for Ingredient Lines on the
// New/Edit Recipe page. Four variants on the existing editor route, switched via `?variant=`:
//   0 current two fields · A unit chip inside the field · B type "200 g" · C pill that pops an editor
// Throwaway: once a variant wins, rewrite it properly and drop this file and the switcher.
import {
  Box,
  FieldUnit,
  Popper,
  TextField,
  color,
  tokens,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UNITS, type Unit } from '../../lib/catalog';
import { segmentSx, stripSx } from '../amountStrip';
import { usePrototypeVariant } from '../PrototypeSwitcher';

export const LINE_AMOUNT_VARIANTS = [
  { key: '0', name: 'Current: two fields' },
  { key: 'A', name: 'Unit chip in field' },
  { key: 'B', name: 'Type "200 g"' },
  { key: 'C', name: 'Pill + pop editor' },
];

type Props = {
  name: string;
  quantity: string;
  unit: Unit;
  bad: boolean;
  errorId: string;
  inputRef: (node: HTMLElement | null) => void;
  onChange: (patch: { quantity?: string; unit?: Unit }) => void;
};

export function LineAmountPrototype(props: Props) {
  const variant = usePrototypeVariant(LINE_AMOUNT_VARIANTS);
  if (variant === 'A') return <UnitChipField {...props} />;
  if (variant === 'B') return <TypedField {...props} />;
  if (variant === 'C') return <PillEditor {...props} />;
  return <CurrentFields {...props} />;
}

/** 0: what ships today, a number field and a unit select side by side. */
function CurrentFields({
  name,
  quantity,
  unit,
  bad,
  errorId,
  inputRef,
  onChange,
}: Props) {
  const { t } = useTranslation(['admin', 'common']);
  return (
    <>
      <TextField
        hiddenLabel
        placeholder="–"
        value={quantity}
        onChange={(event) => onChange({ quantity: event.target.value })}
        error={bad}
        slotProps={{
          htmlInput: {
            ref: inputRef,
            inputMode: 'decimal',
            'aria-label': t('admin:recipe.lines.quantity', { name }),
            'aria-describedby': bad ? errorId : undefined,
            style: { textAlign: 'right' },
          },
        }}
        sx={{ width: 72 }}
      />
      <TextField
        select
        hiddenLabel
        value={unit}
        onChange={(event) => onChange({ unit: event.target.value as Unit })}
        slotProps={{
          select: { native: true },
          htmlInput: { 'aria-label': t('admin:recipe.lines.unit', { name }) },
        }}
        sx={{ width: 88 }}
      >
        {UNITS.map((u) => (
          <option key={u} value={u}>
            {t(`common:units.${u}`)}
          </option>
        ))}
      </TextField>
    </>
  );
}

/** A: one field, the number on the left and the unit as a chip inside its right edge (a native picker under the chip). */
function UnitChipField({
  name,
  quantity,
  unit,
  bad,
  errorId,
  inputRef,
  onChange,
}: Props) {
  const { t } = useTranslation(['admin', 'common']);
  return (
    <TextField
      hiddenLabel
      placeholder="–"
      value={quantity}
      onChange={(event) => onChange({ quantity: event.target.value })}
      error={bad}
      slotProps={{
        input: {
          endAdornment: (
            <FieldUnit
              component="label"
              sx={{ position: 'relative', mr: '-8px', flexShrink: 0 }}
            >
              {t(`common:units.${unit}`)} ▾
              <Box
                component="select"
                value={unit}
                aria-label={t('admin:recipe.lines.unit', { name })}
                onChange={(event) =>
                  onChange({
                    unit: (event.target as HTMLSelectElement).value as Unit,
                  })
                }
                sx={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {t(`common:units.${u}`)}
                  </option>
                ))}
              </Box>
            </FieldUnit>
          ),
        },
        htmlInput: {
          ref: inputRef,
          inputMode: 'decimal',
          'aria-label': t('admin:recipe.lines.quantity', { name }),
          'aria-describedby': bad ? errorId : undefined,
          style: { textAlign: 'right', minWidth: 0 },
        },
      }}
      sx={{ width: 124 }}
    />
  );
}

const TYPED = /^\s*(\d*(?:[.,]\d*)?)\s*([a-z]*)\.?\s*$/i;
const ALIASES: Record<string, Unit> = {
  g: 'g',
  gr: 'g',
  kg: 'kg',
  ml: 'ml',
  l: 'l',
  pc: 'pcs',
  pcs: 'pcs',
  buc: 'pcs',
  stk: 'pcs',
};

/** B: a single text input you type "200 g" or "1.5kg" into; a bare number keeps the unit, shown as a muted suffix. */
function TypedField({
  name,
  quantity,
  unit,
  bad,
  errorId,
  inputRef,
  onChange,
}: Props) {
  const { t } = useTranslation(['admin', 'common']);
  const [text, setText] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const label = t(`common:units.${unit}`);
  const shown = text ?? quantity;
  const typedUnit = TYPED.exec(shown)?.[2] ?? '';
  return (
    <Box sx={{ position: 'relative', width: 104 }}>
      <TextField
        hiddenLabel
        placeholder={`– ${label}`}
        value={focused ? shown : quantity ? `${quantity} ${label}` : ''}
        onFocus={() => {
          setFocused(true);
          setText(quantity);
        }}
        onBlur={() => {
          setFocused(false);
          setText(null);
        }}
        onChange={(event) => {
          const value = event.target.value;
          setText(value);
          const match = TYPED.exec(value);
          if (!match) return onChange({ quantity: value });
          const alias = ALIASES[match[2].toLowerCase()];
          onChange(
            alias
              ? { quantity: match[1], unit: alias }
              : { quantity: match[1] },
          );
        }}
        error={bad}
        slotProps={{
          htmlInput: {
            ref: inputRef,
            'aria-label': `${t('admin:recipe.lines.quantity', { name })}, ${label}`,
            'aria-describedby': bad ? errorId : undefined,
            autoCapitalize: 'off',
            autoComplete: 'off',
            spellCheck: false,
            style: {
              textAlign: 'right',
              paddingRight: focused ? 34 : undefined,
            },
          },
        }}
        sx={{ width: '100%' }}
      />
      {focused && !typedUnit ? (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: tokens.color.muted,
            pointerEvents: 'none',
            fontSize: 14,
          }}
        >
          {label}
        </Box>
      ) : null}
    </Box>
  );
}

/** C: the row shows just a pill ("200 g"); tapping it pops a small editor with the number and unit toggles. */
function PillEditor({
  name,
  quantity,
  unit,
  bad,
  errorId,
  inputRef,
  onChange,
}: Props) {
  const { t } = useTranslation(['admin', 'common']);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const pill = useRef<HTMLButtonElement | null>(null);
  const popper = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const label = t(`common:units.${unit}`);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (pill.current?.contains(target) || popper.current?.contains(target))
        return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <>
      <Box
        component="button"
        type="button"
        ref={(node: HTMLButtonElement | null) => {
          pill.current = node;
          inputRef(node);
        }}
        aria-label={`${t('admin:recipe.lines.quantity', { name })}: ${quantity || '–'} ${label}`}
        aria-describedby={bad ? errorId : undefined}
        aria-expanded={open}
        onClick={(event) => {
          setAnchor(event.currentTarget);
          setOpen((value) => !value);
        }}
        sx={{
          height: 36,
          px: 1.5,
          cursor: 'pointer',
          font: 'inherit',
          borderRadius: 999,
          border: 1,
          borderColor: bad ? 'error.main' : 'divider',
          backgroundColor: color.fieldBg,
          fontWeight: 700,
          fontSize: 14,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
          color: quantity ? tokens.color.ink : tokens.color.muted,
        }}
      >
        {quantity ? `${quantity} ${label}` : `– ${label}`}
      </Box>
      <Popper open={open} anchorEl={anchor}>
        <Box
          ref={popper}
          sx={{
            mt: 0.5,
            width: 240,
            borderRadius: 2,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            boxShadow: 4,
          }}
        >
          <Box sx={{ p: 1 }}>
            <TextField
              hiddenLabel
              placeholder="–"
              value={quantity}
              onChange={(event) => onChange({ quantity: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === 'Escape') {
                  setOpen(false);
                  pill.current?.focus();
                }
              }}
              error={bad}
              slotProps={{
                htmlInput: {
                  ref: input,
                  inputMode: 'decimal',
                  'aria-label': t('admin:recipe.lines.quantity', { name }),
                  style: { textAlign: 'right', fontSize: 18 },
                },
              }}
              sx={{ width: '100%' }}
            />
          </Box>
          <Box sx={{ ...stripSx, height: 40 }} role="group">
            {UNITS.map((u) => (
              <Box
                key={u}
                component="button"
                type="button"
                aria-pressed={u === unit}
                onClick={() => {
                  onChange({ unit: u });
                  input.current?.focus();
                }}
                sx={segmentSx(u === unit)}
              >
                {t(`common:units.${u}`)}
              </Box>
            ))}
          </Box>
        </Box>
      </Popper>
    </>
  );
}
