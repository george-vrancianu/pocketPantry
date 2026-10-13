import {
  Box,
  ChevronDownIcon,
  PlusIcon,
  Typography,
  tokens,
} from '@pocket-pantry/ui';
import {
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { UNITS, type Unit } from '../../../../lib/catalog';

export type AmountFieldProps = {
  /** Name of the Ingredient being added, for the accessible names. */
  name: string;
  quantity: string;
  unit: Unit | '';
  onQuantityChange: (quantity: string) => void;
  onUnitChange: (unit: Unit | '') => void;
  /** Why the quantity is invalid, or null when it is fine. */
  error: string | null;
  disabled: boolean;
  /** The Add button and Enter in the input. */
  onSubmit: () => void;
};

/**
 * One number input with a unit chip inside it, and the Add button beside it.
 * The chip opens a small group of toggle buttons; Escape closes that first.
 */
export function AmountField({
  name,
  quantity,
  unit,
  onQuantityChange,
  onUnitChange,
  error,
  disabled,
  onSubmit,
}: AmountFieldProps) {
  const { t } = useTranslation(['shopping', 'common']);
  const { color } = tokens;
  const errorId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);
  const unitLabel = unit
    ? t(`common:units.${unit}`)
    : t('shopping:amount.noUnit');

  const choose = (next: Unit | '') => {
    onUnitChange(next);
    setPicking(false);
    input.current?.focus();
  };
  const keyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && picking) {
      // The popover goes first; the sheet stays open.
      event.stopPropagation();
      setPicking(false);
      input.current?.focus();
    }
  };
  const blur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setPicking(false);
  };

  return (
    <Box sx={{ p: '0 14px 12px 64px' }} onKeyDown={keyDown} onBlur={blur}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            minWidth: 0,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            borderRadius: '14px',
            border: `1.5px solid ${error ? color.urgentFg : color.line}`,
            backgroundColor: color.surface,
            '&:focus-within': {
              borderColor: error ? color.urgentFg : color.accent,
              boxShadow: `0 0 0 3px ${color.accentTint}`,
            },
          }}
        >
          <Box
            component="input"
            ref={input}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            aria-label={t('shopping:amount.label', { name })}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            placeholder={t('shopping:amount.placeholder')}
            value={quantity}
            onChange={(event: { target: { value: string } }) =>
              onQuantityChange(event.target.value)
            }
            onKeyDown={(event: KeyboardEvent) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onSubmit();
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
              color: color.ink,
            }}
          />
          <Box
            component="button"
            type="button"
            aria-label={t('shopping:amount.unit', { unit: unitLabel })}
            aria-expanded={picking}
            onClick={() => setPicking((value) => !value)}
            sx={{
              mr: '5px',
              height: 32,
              px: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: 0,
              borderRadius: '10px',
              cursor: 'pointer',
              backgroundColor: color.chipNeutral,
              color: color.ink,
              font: 'inherit',
              fontSize: 13.5,
              fontWeight: 700,
            }}
          >
            {unitLabel}
            <ChevronDownIcon size={14} />
          </Box>
          {picking ? (
            <Box
              role="group"
              aria-label={t('shopping:amount.units')}
              // Keep focus where it is so a tap does not blur the popover shut.
              onMouseDown={(event: { preventDefault: () => void }) =>
                event.preventDefault()
              }
              sx={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                zIndex: 1,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                // Wrap rather than run off the sheet's left edge on narrow phones.
                maxWidth: 'min(260px, calc(100vw - 72px))',
                gap: '2px',
                p: '5px',
                borderRadius: '14px',
                border: `1px solid ${color.line}`,
                backgroundColor: color.surface,
                boxShadow: 'var(--shadow-dock)',
              }}
            >
              {(['', ...UNITS] as const).map((option) => {
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
                      borderRadius: '10px',
                      cursor: 'pointer',
                      font: 'inherit',
                      fontSize: 13.5,
                      fontWeight: 700,
                      backgroundColor: selected ? color.accent : 'transparent',
                      color: selected ? '#FFFFFF' : color.ink,
                    }}
                  >
                    {option ? t(`common:units.${option}`) : '—'}
                  </Box>
                );
              })}
            </Box>
          ) : null}
        </Box>
        <Box
          component="button"
          type="button"
          aria-label={t('shopping:amount.add', { name })}
          disabled={disabled}
          onClick={onSubmit}
          sx={{
            flexShrink: 0,
            width: 44,
            height: 44,
            display: 'grid',
            placeItems: 'center',
            border: 0,
            borderRadius: '14px',
            cursor: 'pointer',
            backgroundColor: color.accent,
            color: '#FFFFFF',
            '&:disabled': { opacity: 0.5, cursor: 'default' },
          }}
        >
          <PlusIcon size={20} />
        </Box>
      </Box>
      {error ? (
        <Typography
          id={errorId}
          variant="meta"
          sx={{ display: 'block', mt: 0.75, color: color.urgentFg }}
        >
          {error}
        </Typography>
      ) : null}
    </Box>
  );
}
