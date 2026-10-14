import {
  Box,
  Typography,
  color as themeColor,
  focusRing,
  radius,
  tokens,
} from '@pocket-pantry/ui';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { Unit } from '../lib/catalog';
import { fitChips } from '../lib/fitChips';
import {
  parseTypedNumber,
  usualAmountsAscending,
  usualAmountsInPriority,
  type AmountScale,
} from '../lib/usualAmounts';

const HAPTIC_MS = 6;
const { color } = tokens;

export type UsualAmountRowProps = {
  /** The Ingredient's name, for the group's accessible name. */
  name: string;
  scale: AmountScale;
  unit: Unit | '';
  /** The field's text; the chip matching it is selected. */
  quantity: string;
  /** A chip was tapped, with its value in the unit shown. */
  onPick: (value: number) => void;
};

/**
 * The row of Usual Amount chips under the amount field. Chips that do not fit the row are hidden,
 * keeping the one that matches the amount and then the highest-priority ones; the row never scrolls.
 * It is hidden while the field is empty or has no unit.
 */
export function UsualAmountRow({
  name,
  scale,
  unit,
  quantity,
  onPick,
}: UsualAmountRowProps) {
  const { t, i18n } = useTranslation('common');
  const group = useRef<HTMLDivElement>(null);
  // Bumped when the row resizes, so the chips are fitted again.
  const [resizes, setResizes] = useState(0);
  // Indexes into `values` (priority order) of the chips that fit.
  const [kept, setKept] = useState<number[]>([]);

  const values = useMemo(
    () => (unit ? usualAmountsInPriority(unit, scale) : []),
    [unit, scale],
  );
  const current = parseTypedNumber(quantity);
  const pinned = current === null ? -1 : values.indexOf(current);
  const visible = unit !== '' && quantity.trim() !== '';

  useEffect(() => {
    const el = group.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setResizes((n) => n + 1));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Measure every chip at its natural width (all shown, none grown), then keep the ones that fit.
  useLayoutEffect(() => {
    const el = group.current;
    if (!el || !visible) return;
    const chips = Array.from(el.querySelectorAll<HTMLElement>('[data-chip]'));
    const wasHidden = chips.map((chip) => chip.hidden);
    el.dataset.measuring = '';
    chips.forEach((chip) => {
      chip.hidden = false;
    });
    const widths = values.map(() => 0);
    chips.forEach((chip) => {
      widths[Number(chip.dataset.chip)] = chip.offsetWidth;
    });
    chips.forEach((chip, index) => {
      chip.hidden = wasHidden[index];
    });
    delete el.dataset.measuring;
    setKept(
      fitChips({
        widths,
        rowWidth: el.clientWidth,
        pinned: pinned >= 0 ? pinned : null,
      }),
    );
    // The language is in the deps: a longer label in another locale needs its own fit.
  }, [visible, values, pinned, resizes, i18n.language]);

  const format = (value: number) =>
    new Intl.NumberFormat(i18n.language).format(value);
  const unitLabel = unit ? t(`units.${unit}`) : '';
  // Chips read smallest to largest, whichever ones are kept.
  const order = unit
    ? usualAmountsAscending(unit, scale).map((value) => values.indexOf(value))
    : [];

  const moveFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const shown = Array.from(
      group.current?.querySelectorAll<HTMLElement>(
        '[data-chip]:not([hidden])',
      ) ?? [],
    );
    const at = shown.indexOf(event.target as HTMLElement);
    if (at < 0) return;
    event.preventDefault();
    const next =
      event.key === 'ArrowRight'
        ? Math.min(at + 1, shown.length - 1)
        : Math.max(at - 1, 0);
    shown[next].focus();
  };

  return (
    <Box>
      {visible && pinned >= 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '6px' }}>
          <Typography variant="meta" sx={{ color: color.accent }}>
            {t('amount.usual')}
          </Typography>
        </Box>
      ) : null}
      <Box
        ref={group}
        role="group"
        aria-label={t('amount.usualAmounts', { name })}
        hidden={!visible}
        onKeyDown={moveFocus}
        sx={{
          display: 'flex',
          gap: '6px',
          mt: '8px',
          height: 36,
          overflow: 'hidden',
          '&[hidden]': { display: 'none' },
          '&[data-measuring] [data-chip]': { flex: 'none' },
        }}
      >
        {order.map((index) => {
          const value = values[index];
          const selected = index === pinned;
          return (
            <Box
              key={index}
              component="button"
              type="button"
              data-chip={index}
              hidden={!kept.includes(index)}
              aria-pressed={selected}
              aria-label={t('amount.chip', {
                value: format(value),
                unit: unitLabel,
              })}
              onClick={() => {
                navigator.vibrate?.(HAPTIC_MS);
                onPick(value);
              }}
              sx={{
                flex: '1 1 auto',
                minWidth: 44,
                height: '100%',
                px: '10px',
                border: 0,
                borderRadius: radius.chip,
                cursor: 'pointer',
                font: 'inherit',
                fontSize: 13.5,
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                backgroundColor: selected ? color.accent : color.chipNeutral,
                color: selected ? themeColor.accentInk : color.ink,
                transition: 'background-color .12s, transform .08s',
                '&:active': { transform: 'scale(.96)' },
                '&[hidden]': { display: 'none' },
                ...focusRing,
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                  '&:active': { transform: 'none' },
                },
              }}
            >
              {format(value)}
              <Box
                component="span"
                sx={{
                  ml: '3px',
                  fontSize: 11.5,
                  fontWeight: 500,
                  opacity: selected ? 0.85 : 1,
                  color: selected ? 'inherit' : color.muted,
                }}
              >
                {unitLabel}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
