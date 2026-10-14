import { describe, expect, it } from 'vitest';
import { prePaintScript } from './appearance';

const WARM_BG = '#F3EDE1';
const MINIMAL_BG = '#FAFAF8';
const DARK_BG = '#0F1512';

/** A bare document like the HTML entry before React mounts: two media-qualified `theme-color` tags. */
function bareDocument() {
  const doc = document.implementation.createHTMLDocument('Pocket Pantry');
  for (const media of [
    '(prefers-color-scheme: light)',
    '(prefers-color-scheme: dark)',
  ]) {
    const meta = doc.createElement('meta');
    meta.name = 'theme-color';
    meta.media = media;
    meta.content = '#000000';
    doc.head.append(meta);
  }
  return doc;
}

/** Run the inline script the HTML entry ships, against a document and a window with this storage and system scheme. */
function runPrePaint({
  stored,
  systemDark = false,
}: {
  stored?: string;
  systemDark?: boolean;
}) {
  const doc = bareDocument();
  const storage = new Map<string, string>();
  if (stored !== undefined) storage.set('pp.appearance', stored);
  const win = {
    localStorage: { getItem: (key: string) => storage.get(key) ?? null },
    matchMedia: (query: string) => ({
      matches: systemDark && query === '(prefers-color-scheme: dark)',
    }),
  };
  new Function('document', 'window', prePaintScript())(doc, win);
  const themeColors = [
    ...doc.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
  ].map((meta) => meta.content);
  return { theme: doc.documentElement.dataset.theme, themeColors };
}

describe('the pre-paint script', () => {
  it('applies the stored Theme when Match system is off', () => {
    const result = runPrePaint({
      stored: JSON.stringify({ theme: 'minimal', matchSystem: false }),
      systemDark: true,
    });
    expect(result).toEqual({
      theme: 'minimal',
      themeColors: [MINIMAL_BG, MINIMAL_BG],
    });
  });

  it('applies Dark-first when it is stored, whatever the system scheme', () => {
    const result = runPrePaint({
      stored: JSON.stringify({ theme: 'dark', matchSystem: false }),
    });
    expect(result).toEqual({ theme: 'dark', themeColors: [DARK_BG, DARK_BG] });
  });

  it('follows the system with no stored preference: Warm editorial in light mode', () => {
    expect(runPrePaint({})).toEqual({
      theme: 'warm',
      themeColors: [WARM_BG, WARM_BG],
    });
  });

  it('follows the system with no stored preference: Dark-first in dark mode', () => {
    expect(runPrePaint({ systemDark: true })).toEqual({
      theme: 'dark',
      themeColors: [DARK_BG, DARK_BG],
    });
  });

  it('falls back to Warm editorial when the stored preference is malformed JSON', () => {
    expect(runPrePaint({ stored: '{not json' })).toEqual({
      theme: 'warm',
      themeColors: [WARM_BG, WARM_BG],
    });
  });

  it('falls back to Warm editorial when the stored Theme is unknown', () => {
    expect(
      runPrePaint({
        stored: JSON.stringify({ theme: 'sage', matchSystem: false }),
      }).theme,
    ).toBe('warm');
  });

  it('uses Dark-first in system dark mode with Match system on', () => {
    expect(
      runPrePaint({
        stored: JSON.stringify({ theme: 'minimal', matchSystem: true }),
        systemDark: true,
      }),
    ).toEqual({ theme: 'dark', themeColors: [DARK_BG, DARK_BG] });
  });

  it('uses the chosen light Theme in system light mode with Match system on', () => {
    expect(
      runPrePaint({
        stored: JSON.stringify({ theme: 'minimal', matchSystem: true }),
      }).theme,
    ).toBe('minimal');
  });

  it('uses Warm editorial in system light mode when Dark-first is chosen with Match system on', () => {
    expect(
      runPrePaint({
        stored: JSON.stringify({ theme: 'dark', matchSystem: true }),
      }).theme,
    ).toBe('warm');
  });

  it('does not throw when storage is blocked', () => {
    const doc = bareDocument();
    const win = {
      localStorage: {
        getItem: () => {
          throw new Error('SecurityError');
        },
      },
      matchMedia: () => ({ matches: false }),
    };
    new Function('document', 'window', prePaintScript())(doc, win);
    expect(doc.documentElement.dataset.theme).toBe('warm');
  });
});
