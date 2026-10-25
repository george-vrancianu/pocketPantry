// PROTOTYPE, throwaway: the floating variant switcher. Never rendered in production builds.
import { useEffect, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

export function PrototypeSwitcher({
  param,
  variants,
  children,
  at = 'top',
}: {
  /** Where the bar floats; `bottom` keeps the top edge free for whatever is being prototyped there. */
  at?: 'top' | 'bottom';
  /** The search param that holds the variant key. */
  param: string;
  variants: Array<{ key: string; name: string }>;
  /** Extra prototype controls shown above the arrows. */
  children?: ReactNode;
}) {
  const [params, setParams] = useSearchParams();
  const current = params.get(param) ?? variants[0].key;
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current),
  );
  const go = (step: number) => {
    const next = variants[(index + step + variants.length) % variants.length];
    const copy = new URLSearchParams(params);
    copy.set(param, next.key);
    setParams(copy, { replace: true });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        el?.closest(
          'input, textarea, [contenteditable="true"], [contenteditable=""]',
        )
      )
        return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (import.meta.env.PROD) return null;
  const button = {
    background: 'transparent',
    color: '#fff',
    border: 0,
    font: 'inherit',
    fontSize: 18,
    cursor: 'pointer',
    padding: '2px 10px',
  };
  return (
    <div
      style={{
        position: 'fixed',
        ...(at === 'top'
          ? { top: 8 }
          : { bottom: 'calc(env(safe-area-inset-bottom) + 104px)' }),
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        background: '#111',
        color: '#fff',
        borderRadius: 14,
        boxShadow: '0 6px 24px rgba(0,0,0,.35)',
        padding: '6px 10px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        outline: '2px dashed #f0f',
      }}
    >
      {children}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          style={button}
          onClick={() => go(-1)}
          aria-label="Previous variant"
        >
          ←
        </button>
        <span style={{ fontWeight: 700, minWidth: 170, textAlign: 'center' }}>
          {variants[index].key} ({variants[index].name})
        </span>
        <button style={button} onClick={() => go(1)} aria-label="Next variant">
          →
        </button>
      </div>
    </div>
  );
}
