// PROTOTYPE: throwaway variant switcher for UI prototypes. Do not merge to main.
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

type Variant = { key: string; name: string };

/** Reads `?variant=` and falls back to the first variant. */
export function usePrototypeVariant(variants: Variant[]) {
  const [params] = useSearchParams();
  const current = params.get('variant');
  return variants.some((v) => v.key === current) ? current! : variants[0].key;
}

/** Floating bottom bar: ← / → cycle `?variant=`. Hidden in production builds. */
export function PrototypeSwitcher({ variants }: { variants: Variant[] }) {
  const [params, setParams] = useSearchParams();
  const current = usePrototypeVariant(variants);
  const index = variants.findIndex((v) => v.key === current);
  const go = (step: number) => {
    const next = variants[(index + step + variants.length) % variants.length];
    const updated = new URLSearchParams(params);
    updated.set('variant', next.key);
    setParams(updated, { replace: true });
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (
        el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT' ||
          el.isContentEditable)
      )
        return;
      if (event.key === 'ArrowLeft') go(-1);
      if (event.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (import.meta.env.PROD) return null;
  const button = {
    background: 'transparent',
    border: 0,
    color: '#fff',
    fontSize: 18,
    cursor: 'pointer',
    padding: '4px 10px',
  } as const;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 8px',
        borderRadius: 999,
        background: '#111',
        color: '#fff',
        font: '600 13px system-ui, sans-serif',
        boxShadow: '0 4px 16px rgba(0,0,0,.35)',
        outline: '2px dashed #ff3d8b',
      }}
    >
      <button type="button" style={button} onClick={() => go(-1)}>
        ←
      </button>
      <span style={{ whiteSpace: 'nowrap' }}>
        {current} ({variants[index].name})
      </span>
      <button type="button" style={button} onClick={() => go(1)}>
        →
      </button>
    </div>
  );
}
