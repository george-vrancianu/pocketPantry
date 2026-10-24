// PROTOTYPE: throwaway variant switcher for ?variant= prototypes. Not for production.
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function PrototypeSwitcher({
  variants,
}: {
  variants: { key: string; name: string }[];
}) {
  const [params, setParams] = useSearchParams();
  const current = params.get('variant') ?? variants[0].key;
  const at = Math.max(
    0,
    variants.findIndex((v) => v.key === current),
  );
  const go = (delta: number) => {
    const next = variants[(at + delta + variants.length) % variants.length];
    const updated = new URLSearchParams(params);
    updated.set('variant', next.key);
    setParams(updated, { replace: true });
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      )
        return;
      if (event.key === 'ArrowLeft') go(-1);
      if (event.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!import.meta.env.DEV) return null;
  const button = {
    border: 0,
    background: 'transparent',
    color: '#fff',
    fontSize: 18,
    cursor: 'pointer',
    padding: '4px 10px',
  } as const;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 96,
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
        font: '600 13px system-ui',
        boxShadow: '0 6px 24px rgba(0,0,0,.35)',
      }}
    >
      <button type="button" style={button} onClick={() => go(-1)}>
        ←
      </button>
      <span>
        {variants[at].key} ({variants[at].name})
      </span>
      <button type="button" style={button} onClick={() => go(1)}>
        →
      </button>
    </div>
  );
}
