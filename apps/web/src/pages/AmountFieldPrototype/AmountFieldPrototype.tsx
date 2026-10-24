// PROTOTYPE: throwaway. Three variants of the reworked amount field, switchable via ?variant=A|B|C,
// on /prototype/amount-field, each shown in the four hosts that use AmountField, at phone widths.
// Question: what should the 2-row field (unit toggles -> unit dropdown + value chips) look like?
// Hard-coded English, no tests, no typed-unit parsing ("500 g"); delete or move to a throwaway branch.
import {
  Box,
  ChevronDownIcon,
  FieldUnit,
  PlusIcon,
  Typography,
  border,
  color,
  nestedRadius,
  radius,
  shadow,
  tokens,
} from '@pocket-pantry/ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PrototypeSwitcher } from '../../components/PrototypeSwitcher';
import { UNITS, type Unit } from '../../lib/catalog';
import {
  convertQuantity,
  parseTypedNumber,
  unitsInFamily,
  usualAmountsInPriority,
  type AmountScale,
} from '../../lib/usualAmounts';

/* ---------- shared prototype logic ---------- */

const FALLBACK: Record<Unit, number[]> = {
  g: [250, 500, 100, 1000, 50, 750, 200, 150, 300],
  ml: [250, 500, 100, 1000, 50, 750, 200, 150, 300],
  kg: [1, 2, 3, 4, 5],
  l: [1, 2, 3, 4, 5],
  pcs: [1, 2, 3, 4, 6, 12],
};

/** Values in priority order: the Amount Scale's when there is one, else the unit's. */
function valuesFor(unit: Unit, scale: AmountScale | null): number[] {
  return scale ? usualAmountsInPriority(unit, scale) : FALLBACK[unit];
}

/** Rough chip width for fitting: label characters plus padding. */
const chipWidth = (value: number, unit: Unit) =>
  (String(value).length + unit.length) * 8 + 26;

/** The chips that fit `width`, the matching one kept first, then by priority; shown ascending. */
function fit(
  values: number[],
  unit: Unit,
  width: number,
  current: number | null,
  gap: number,
) {
  const kept: number[] = [];
  let total = 0;
  const pinned = current !== null && values.includes(current) ? current : null;
  const order = pinned === null ? values : [pinned, ...values.filter((v) => v !== pinned)];
  for (const value of order) {
    const next = total + (kept.length ? gap : 0) + chipWidth(value, unit);
    if (next > width && kept.length) break;
    total = next;
    kept.push(value);
  }
  return kept.sort((a, b) => a - b);
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

type FieldProps = {
  quantity: string;
  unit: Unit | '';
  onQuantity: (q: string) => void;
  onUnit: (u: Unit | '') => void;
  allowNoUnit: boolean;
  scale: AmountScale | null;
  submit: boolean;
  label?: string;
  height: number;
  error: string | null;
};

/** Keeps the keyboard open: the tap never takes focus from the input. */
const keepFocus = { onMouseDown: (e: { preventDefault: () => void }) => e.preventDefault() };

function useField(p: FieldProps) {
  const input = useRef<HTMLInputElement>(null);
  const choose = (next: Unit | '') => {
    const value = parseTypedNumber(p.quantity);
    if (p.unit && next && value !== null && unitsInFamily(p.unit).includes(next) && next !== p.unit)
      p.onQuantity(String(convertQuantity(value, p.unit, next)));
    p.onUnit(next);
    input.current?.focus();
  };
  const pick = (v: number) => {
    p.onQuantity(String(v));
    input.current?.focus();
  };
  return { input, choose, pick, current: parseTypedNumber(p.quantity) };
}

const inputSx = {
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
} as const;

function PlusButton({ height }: { height: number }) {
  return (
    <Box
      component="button"
      type="button"
      aria-label="Add"
      sx={{
        flexShrink: 0,
        width: height,
        height,
        display: 'grid',
        placeItems: 'center',
        border: 0,
        borderRadius: radius.control,
        backgroundColor: tokens.color.accent,
        color: color.accentInk,
        cursor: 'pointer',
      }}
    >
      <PlusIcon size={20} />
    </Box>
  );
}

function ErrorLine({ error }: { error: string | null }) {
  return error ? (
    <Typography variant="meta" sx={{ display: 'block', mt: 0.75, color: tokens.color.urgentFg }}>
      {error}
    </Typography>
  ) : null;
}

function FloatingLabel({ label }: { label?: string }) {
  return label ? (
    <Box
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
  ) : null;
}

/* ---------- Variant A: the agreed spec ---------- */
// Segmented track (nullable) under the input; in-field unit chip opening a vertical menu; pill chips.

function VariantA(p: FieldProps) {
  const { input, choose, pick, current } = useField(p);
  const [menu, setMenu] = useState(false);
  const [row, width] = useWidth<HTMLDivElement>();
  const chips = p.unit ? fit(valuesFor(p.unit, p.scale), p.unit, width, current, 6) : [];
  const menuOptions: (Unit | '')[] = p.allowNoUnit ? [...UNITS, ''] : [...UNITS];
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            minWidth: 0,
            height: p.height,
            display: 'flex',
            alignItems: 'center',
            borderRadius: radius.control,
            border: `${border.field} solid ${p.error ? tokens.color.urgentFg : tokens.color.line}`,
            backgroundColor: color.fieldBg,
            '&:focus-within': { borderColor: tokens.color.accent, boxShadow: `0 0 0 3px ${tokens.color.accentTint}` },
          }}
        >
          <FloatingLabel label={p.label} />
          <Box
            component="input"
            ref={input}
            inputMode="decimal"
            placeholder="Amount"
            value={p.quantity}
            onChange={(e: { target: { value: string } }) => p.onQuantity(e.target.value)}
            sx={inputSx}
          />
          {p.unit ? (
            <FieldUnit {...keepFocus} aria-expanded={menu} onClick={() => setMenu((m) => !m)} sx={{ mr: '5px', px: 1, gap: '4px' }}>
              {p.unit}
              <ChevronDownIcon size={14} />
            </FieldUnit>
          ) : null}
          {menu && p.unit ? (
            <Box
              role="menu"
              {...keepFocus}
              sx={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                zIndex: 2,
                minWidth: 140,
                p: '5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                borderRadius: radius.control,
                border: `${border.width} solid ${tokens.color.line}`,
                backgroundColor: tokens.color.surface,
                boxShadow: shadow.float,
              }}
            >
              {menuOptions.map((option) => (
                <Box
                  key={option || 'none'}
                  component="button"
                  type="button"
                  role="menuitemradio"
                  aria-checked={option === p.unit}
                  onClick={() => {
                    choose(option);
                    setMenu(false);
                  }}
                  sx={{
                    height: 38,
                    px: 1.5,
                    textAlign: 'left',
                    border: 0,
                    borderRadius: nestedRadius(radius.control, 5),
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: 14,
                    fontWeight: option === p.unit ? 700 : 500,
                    backgroundColor: option === p.unit ? tokens.color.accentTint : 'transparent',
                    color: option ? tokens.color.ink : tokens.color.muted,
                  }}
                >
                  {option || 'No unit'}
                </Box>
              ))}
            </Box>
          ) : null}
        </Box>
        {p.submit ? <PlusButton height={p.height} /> : null}
      </Box>
      <Box ref={row} sx={{ mt: '8px', height: 44 }}>
        {p.unit ? (
          <Box sx={{ display: 'flex', gap: '6px', height: '100%' }}>
            {chips.map((v) => {
              const selected = v === current;
              return (
                <Box
                  key={v}
                  component="button"
                  type="button"
                  aria-pressed={selected}
                  {...keepFocus}
                  onClick={() => pick(v)}
                  sx={{
                    flex: '1 1 auto',
                    minWidth: 44,
                    px: '10px',
                    border: 0,
                    borderRadius: radius.chip,
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: 13.5,
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    backgroundColor: selected ? tokens.color.accent : tokens.color.chipNeutral,
                    color: selected ? color.accentInk : tokens.color.ink,
                  }}
                >
                  {v}
                  <Box component="span" sx={{ ml: '3px', fontSize: 11.5, fontWeight: 500, opacity: 0.75 }}>
                    {p.unit}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box
            role="group"
            aria-label="Unit"
            sx={{
              display: 'flex',
              gap: '4px',
              p: '4px',
              height: '100%',
              boxSizing: 'border-box',
              borderRadius: radius.control,
              backgroundColor: tokens.color.chipNeutral,
            }}
          >
            {UNITS.map((u) => (
              <Box
                key={u}
                component="button"
                type="button"
                aria-pressed={false}
                {...keepFocus}
                onClick={() => choose(u)}
                sx={{
                  flex: 1,
                  border: 0,
                  borderRadius: nestedRadius(radius.control, 4),
                  background: 'transparent',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontSize: 14,
                  fontWeight: 600,
                  color: tokens.color.muted,
                  '&:hover': { backgroundColor: tokens.color.surface },
                }}
              >
                {u}
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <ErrorLine error={p.error} />
    </Box>
  );
}

/* ---------- Variant B: one attached block ---------- */
// The input and row 2 share one border: row 2 is a strip welded under the input, edge-to-edge
// segments with dividers. The unit dropdown is a separate square segment welded to the input's right.

function VariantB(p: FieldProps) {
  const { input, choose, pick, current } = useField(p);
  const [menu, setMenu] = useState(false);
  const [row, width] = useWidth<HTMLDivElement>();
  const chips = p.unit ? fit(valuesFor(p.unit, p.scale), p.unit, width, current, 0) : [];
  const line = `${border.field} solid ${p.error ? tokens.color.urgentFg : tokens.color.line}`;
  const segment = (selected: boolean, last: boolean) => ({
    flex: 1,
    minWidth: 0,
    border: 0,
    borderRight: last ? 0 : `1px solid ${tokens.color.line}`,
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 14,
    fontWeight: selected ? 700 : 600,
    fontVariantNumeric: 'tabular-nums',
    backgroundColor: selected ? tokens.color.accent : 'transparent',
    color: selected ? color.accentInk : tokens.color.ink,
  });
  const menuOptions: (Unit | '')[] = p.allowNoUnit ? ['', ...UNITS] : [...UNITS];
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            minWidth: 0,
            borderRadius: radius.control,
            border: line,
            backgroundColor: color.fieldBg,
            '&:focus-within': { borderColor: tokens.color.accent, boxShadow: `0 0 0 3px ${tokens.color.accentTint}` },
          }}
        >
          <FloatingLabel label={p.label} />
          <Box sx={{ display: 'flex', height: p.height }}>
            <Box
              component="input"
              ref={input}
              inputMode="decimal"
              placeholder="Amount"
              value={p.quantity}
              onChange={(e: { target: { value: string } }) => p.onQuantity(e.target.value)}
              sx={inputSx}
            />
            {p.unit ? (
              <Box
                component="button"
                type="button"
                {...keepFocus}
                onClick={() => setMenu((m) => !m)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  px: 1.5,
                  border: 0,
                  borderLeft: `1px solid ${tokens.color.line}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontSize: 15,
                  fontWeight: 700,
                  color: tokens.color.ink,
                }}
              >
                {p.unit}
                <ChevronDownIcon size={14} />
              </Box>
            ) : null}
          </Box>
          <Box ref={row} sx={{ display: 'flex', height: 40, borderTop: `1px solid ${tokens.color.line}`, overflow: 'hidden', borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' }}>
            {p.unit
              ? chips.map((v, i) => (
                  <Box key={v} component="button" type="button" {...keepFocus} aria-pressed={v === current} onClick={() => pick(v)} sx={segment(v === current, i === chips.length - 1)}>
                    {v}
                  </Box>
                ))
              : UNITS.map((u, i) => (
                  <Box key={u} component="button" type="button" {...keepFocus} aria-pressed={false} onClick={() => choose(u)} sx={{ ...segment(false, i === UNITS.length - 1), color: tokens.color.muted }}>
                    {u}
                  </Box>
                ))}
          </Box>
          {menu && p.unit ? (
            <Box
              {...keepFocus}
              sx={{
                position: 'absolute',
                top: p.height,
                right: 0,
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 120,
                borderRadius: radius.control,
                border: `${border.width} solid ${tokens.color.line}`,
                backgroundColor: tokens.color.surface,
                boxShadow: shadow.float,
                overflow: 'hidden',
              }}
            >
              {menuOptions.map((option) => (
                <Box
                  key={option || 'none'}
                  component="button"
                  type="button"
                  onClick={() => {
                    choose(option);
                    setMenu(false);
                  }}
                  sx={{ ...segment(option === p.unit, true), height: 40, px: 1.5, textAlign: 'left', borderBottom: `1px solid ${tokens.color.line}` }}
                >
                  {option || '— No unit'}
                </Box>
              ))}
            </Box>
          ) : null}
        </Box>
        {p.submit ? <PlusButton height={p.height} /> : null}
      </Box>
      <ErrorLine error={p.error} />
    </Box>
  );
}

/* ---------- Variant C: number first, unit as a native select ---------- */
// Big number with a native <select> beside it (OS picker on phones); row 2 is a scrolling-free
// line of outlined toggles, unit name and value chips sharing one outlined style.

function VariantC(p: FieldProps) {
  const { input, choose, pick, current } = useField(p);
  const [row, width] = useWidth<HTMLDivElement>();
  const chips = p.unit ? fit(valuesFor(p.unit, p.scale), p.unit, width, current, 0) : [];
  const toggle = (selected: boolean, first: boolean) => ({
    flex: 1,
    minWidth: 0,
    height: 36,
    ml: first ? 0 : '-1px',
    border: `1px solid ${selected ? tokens.color.accent : tokens.color.line}`,
    position: 'relative' as const,
    zIndex: selected ? 1 : 0,
    borderRadius: 0,
    '&:first-of-type': { borderTopLeftRadius: 999, borderBottomLeftRadius: 999 },
    '&:last-of-type': { borderTopRightRadius: 999, borderBottomRightRadius: 999 },
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 13.5,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    backgroundColor: selected ? tokens.color.accentTint : color.fieldBg,
    color: selected ? tokens.color.accent : tokens.color.ink,
  });
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            minWidth: 0,
            height: p.height,
            display: 'flex',
            alignItems: 'center',
            borderBottom: `2px solid ${p.error ? tokens.color.urgentFg : tokens.color.line}`,
            '&:focus-within': { borderBottomColor: tokens.color.accent },
          }}
        >
          {p.label ? (
            <Typography variant="meta" sx={{ position: 'absolute', top: -14, left: 0, color: tokens.color.muted }}>
              {p.label}
            </Typography>
          ) : null}
          <Box
            component="input"
            ref={input}
            inputMode="decimal"
            placeholder="0"
            value={p.quantity}
            onChange={(e: { target: { value: string } }) => p.onQuantity(e.target.value)}
            sx={{ ...inputSx, pl: 0, fontSize: 24, fontWeight: 700 }}
          />
          {p.unit ? (
            <Box
              component="select"
              value={p.unit}
              onChange={(e: { target: { value: string } }) => choose(e.target.value as Unit | '')}
              sx={{
                height: 36,
                px: 1,
                border: `1px solid ${tokens.color.line}`,
                borderRadius: radius.chip,
                backgroundColor: color.fieldBg,
                color: tokens.color.ink,
                font: 'inherit',
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {p.allowNoUnit ? <option value="">No unit</option> : null}
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Box>
          ) : null}
        </Box>
        {p.submit ? <PlusButton height={44} /> : null}
      </Box>
      <Box ref={row} sx={{ display: 'flex', mt: '10px' }}>
        {p.unit
          ? chips.map((v, i) => (
              <Box key={v} component="button" type="button" {...keepFocus} aria-pressed={v === current} onClick={() => pick(v)} sx={toggle(v === current, i === 0)}>
                {v} {p.unit}
              </Box>
            ))
          : UNITS.map((u, i) => (
              <Box key={u} component="button" type="button" {...keepFocus} aria-pressed={false} onClick={() => choose(u)} sx={toggle(false, i === 0)}>
                {u}
              </Box>
            ))}
      </Box>
      <ErrorLine error={p.error} />
    </Box>
  );
}

/* ---------- page: the four hosts at a chosen width ---------- */

const VARIANTS = [
  { key: 'A', name: 'Agreed spec: track + chip menu', Field: VariantA },
  { key: 'B', name: 'One welded block', Field: VariantB },
  { key: 'C', name: 'Big number + native select', Field: VariantC },
];

type HostState = { quantity: string; unit: Unit | ''; attempted: boolean };

function Host({
  title,
  Field,
  initial,
  scale,
  allowNoUnit,
  submit,
  label,
  height,
  after,
}: {
  title: string;
  Field: (p: FieldProps) => ReactNode;
  initial: HostState;
  scale: AmountScale | null;
  allowNoUnit: boolean;
  submit: boolean;
  label?: string;
  height: number;
  after?: ReactNode;
}) {
  const [state, setState] = useState(initial);
  const invalid = state.quantity.trim() !== '' && parseTypedNumber(state.quantity) === null;
  const error = invalid ? 'Enter a number' : state.attempted && !allowNoUnit && !state.unit ? 'Pick a unit' : null;
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="meta" sx={{ display: 'block', mb: 1, color: tokens.color.muted, textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Box sx={{ p: 2, borderRadius: radius.control, backgroundColor: tokens.color.surface, boxShadow: shadow.float }}>
        <Field
          quantity={state.quantity}
          unit={state.unit}
          onQuantity={(quantity) => setState((s) => ({ ...s, quantity }))}
          onUnit={(unit) => setState((s) => ({ ...s, unit }))}
          allowNoUnit={allowNoUnit}
          scale={scale}
          submit={submit}
          label={label}
          height={height}
          error={error}
        />
        {after}
        <Box component="pre" sx={{ m: 0, mt: 1.5, fontSize: 11, color: tokens.color.muted, whiteSpace: 'pre-wrap' }}>
          {JSON.stringify({ quantity: state.quantity, unit: state.unit || null, scale })}
        </Box>
        {!allowNoUnit ? (
          <Box component="button" type="button" onClick={() => setState((s) => ({ ...s, attempted: true }))} sx={{ mt: 1, font: 'inherit', fontSize: 12 }}>
            Try to save (shows the error line)
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

const WIDTHS = [320, 360, 412, 600];

export function AmountFieldPrototype() {
  const [params] = useSearchParams();
  const variant = VARIANTS.find((v) => v.key === params.get('variant')) ?? VARIANTS[0];
  const [width, setWidth] = useState(360);
  const [scale, setScale] = useState<AmountScale | null>(null);
  const { Field } = variant;
  return (
    <Box sx={{ p: 2, pb: 20 }}>
      <Typography variant="h2" sx={{ mb: 0.5 }}>
        PROTOTYPE · Amount field · {variant.key}
      </Typography>
      <Typography variant="meta" sx={{ display: 'block', mb: 2, color: tokens.color.muted }}>
        {variant.name}. ← / → or the bar to switch variants.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, fontSize: 13 }}>
        {WIDTHS.map((w) => (
          <button key={w} type="button" onClick={() => setWidth(w)} style={{ fontWeight: w === width ? 700 : 400 }}>
            {w}px
          </button>
        ))}
        <select value={scale ?? ''} onChange={(e) => setScale((e.target.value || null) as AmountScale | null)}>
          <option value="">No Amount Scale (fallback lists)</option>
          <option value="low">Amount Scale: low (salt)</option>
          <option value="medium">Amount Scale: medium (pasta)</option>
          <option value="large">Amount Scale: large (rice)</option>
        </select>
      </Box>
      {/* key: remount the hosts so each variant starts from the same state */}
      <Box key={`${variant.key}-${width}-${scale}`} sx={{ width, maxWidth: '100%' }}>
        <Host title="Add sheet (+ button, no-unit allowed)" Field={Field} initial={{ quantity: '', unit: '', attempted: false }} scale={scale} allowNoUnit submit height={44} />
        <Host
          title="Pantry Batch: Amount, then Location below"
          Field={Field}
          initial={{ quantity: '', unit: '', attempted: false }}
          scale={scale}
          allowNoUnit={false}
          submit={false}
          label="Amount"
          height={56}
          after={
            <Box sx={{ mt: 2, height: 56, px: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: radius.control, border: `${border.field} solid ${tokens.color.line}`, color: tokens.color.muted }}>
              Location: Fridge <ChevronDownIcon size={14} />
            </Box>
          }
        />
        <Host title="Finish Shopping line (unit preset, unit required)" Field={Field} initial={{ quantity: '500', unit: 'g', attempted: false }} scale={scale} allowNoUnit={false} submit={false} height={44} />
        <Host title="Amount sheet (edit, preset 1.5 kg)" Field={Field} initial={{ quantity: '1.5', unit: 'kg', attempted: false }} scale={scale} allowNoUnit submit={false} height={44} />
      </Box>
      <PrototypeSwitcher variants={VARIANTS.map(({ key, name }) => ({ key, name }))} />
    </Box>
  );
}
