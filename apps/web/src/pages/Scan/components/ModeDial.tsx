import { Box, tokens, visuallyHidden } from '@pocket-pantry/ui';
import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SCAN_MODES, type ScanMode } from '../../../lib/scan';
import { glassFocusRing } from './glass';

const ITEM_WIDTH = 84;
const HAPTIC_MS = 6;

const icon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

const ICONS: Record<ScanMode, ReactNode> = {
  receipt: icon(
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>,
  ),
  product: icon(
    <>
      <path d="M4 7a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3z" />
      <path d="M8 9h8M8 12.5h8M8 16h5" />
    </>,
  ),
  ingredients: icon(
    <>
      <path d="M3 10h18M3 18h18" />
      <path d="M6 10V6h3v4M12 10V5h4v5M7 18v-4h4v4M14 18v-5h3v5" />
    </>,
  ),
  plate: icon(
    <>
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M3 4v5a1.5 1.5 0 003 0V4M4.5 4v16M21 4c-1.5 1-2 3-2 5s.7 2 2 2v9" />
    </>,
  ),
};

const reducedMotion = '@media (prefers-reduced-motion: reduce)';

/**
 * The Scan Mode dial: the selected icon sits in the ring with its name above. Tap an icon, or
 * press the left and right arrow keys, to change mode.
 */
export function ModeDial({
  mode,
  disabled,
  keysDisabled,
  onChange,
}: {
  mode: ScanMode;
  disabled: boolean;
  /** Also true while an overlay or a read owns the arrow keys. */
  keysDisabled: boolean;
  onChange: (mode: ScanMode) => void;
}) {
  const { t } = useTranslation('scan');
  const index = SCAN_MODES.indexOf(mode);

  const latest = useRef({ index, keysDisabled, onChange });
  latest.current = { index, keysDisabled, onChange };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const step =
        event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      const { index, keysDisabled, onChange } = latest.current;
      const next = SCAN_MODES[index + step];
      if (!step || !next || keysDisabled) return;
      if (event.defaultPrevented || event.isComposing) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest(
          'input, select, textarea, [contenteditable], [role=slider]',
        )
      ) {
        return;
      }
      onChange(next);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const groupRef = useRef<HTMLDivElement>(null);
  const previous = useRef(mode);
  useEffect(() => {
    if (previous.current === mode) return;
    previous.current = mode;
    navigator.vibrate?.(HAPTIC_MS);
    // Keep keyboard focus on the radio that is now checked.
    const group = groupRef.current;
    if (group?.contains(document.activeElement)) {
      group.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    }
  }, [mode]);

  return (
    <Box sx={{ position: 'relative', height: 120, mt: 1 }}>
      <Box
        key={mode}
        aria-hidden="true"
        sx={{
          textAlign: 'center',
          fontSize: 12.5,
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: tokens.color.camAccent,
          textShadow: '0 1px 6px rgba(0,0,0,.6)',
          animation: 'pp-dial-label .32s ease-out',
          '@keyframes pp-dial-label': {
            from: { opacity: 0, transform: 'translateY(5px)' },
            to: { opacity: 1, transform: 'none' },
          },
          [reducedMotion]: { animation: 'none' },
        }}
      >
        {t(`mode.${mode}`)}
      </Box>
      <Box role="status" sx={visuallyHidden}>
        {t(`mode.${mode}`)}
      </Box>
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          left: '50%',
          top: 30,
          width: 64,
          height: 64,
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          border: `2.5px solid ${tokens.color.camAccent}`,
          boxShadow: `0 0 0 6px color-mix(in srgb, ${tokens.color.camAccent} 14%, transparent)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        ref={groupRef}
        role="radiogroup"
        aria-label={t('modes')}
        sx={{
          position: 'absolute',
          left: '50%',
          top: 30,
          height: 64,
          display: 'flex',
          transform: `translateX(${-ITEM_WIDTH / 2 - index * ITEM_WIDTH}px)`,
          transition: 'transform .42s cubic-bezier(.2,.8,.2,1)',
          [reducedMotion]: { transition: 'none' },
        }}
      >
        {SCAN_MODES.map((item) => {
          const active = item === mode;
          return (
            <Box
              key={item}
              component="button"
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={t(`mode.${item}`)}
              tabIndex={active ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(item)}
              sx={{
                width: ITEM_WIDTH,
                height: 64,
                display: 'grid',
                placeItems: 'center',
                p: 0,
                border: 0,
                borderRadius: '50%',
                background: 'transparent',
                cursor: 'pointer',
                color: active ? tokens.color.camAccent : tokens.color.camFg,
                opacity: active ? 1 : 0.75,
                transform: active ? 'none' : 'scale(.82)',
                transition: 'color .25s, transform .25s, opacity .25s',
                '&:disabled': { cursor: 'default' },
                '&:focus-visible': glassFocusRing,
                '& svg': {
                  width: 26,
                  height: 26,
                  stroke: 'currentColor',
                  fill: 'none',
                  strokeWidth: 2.1,
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.7))',
                },
                [reducedMotion]: { transition: 'none' },
              }}
            >
              {ICONS[item]}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
