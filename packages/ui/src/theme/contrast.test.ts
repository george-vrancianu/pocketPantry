import { describe, expect, it } from 'vitest';
import { THEME_IDS, THEMES, type ThemeTokens } from './themes';

/** WCAG 2 relative luminance of a `#RRGGBB` colour. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

type Key = keyof ThemeTokens;

/** Text (or an accent mark) and the fill it sits on, per handoff sections 3 and 4. */
const PAIRS: ReadonlyArray<[text: Key, fill: Key]> = [
  ['ink', 'bg'],
  ['ink', 'surface'],
  ['muted', 'bg'],
  ['muted', 'surface'],
  ['primary-ink', 'primary'],
  ['accent-ink', 'accent'],
  // Accent text: ghost buttons and links.
  ['accent', 'bg'],
  ['accent', 'surface'],
  ['accent-on-tint', 'accent-tint'],
  ['butter-ink', 'butter'],
  ['seg-on-ink', 'seg-on'],
  ['toast-ink', 'toast-bg'],
  ['toast-action', 'toast-bg'],
  // Status tags.
  ['urgent-fg', 'urgent-bg'],
  ['soon-fg', 'soon-bg'],
  ['ok-fg', 'ok-bg'],
];

describe('Theme contrast (US25: 4.5:1 for every text and accent pair)', () => {
  it('measures contrast as WCAG 2 does', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrast('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2);
  });

  const failures = THEME_IDS.flatMap((id) =>
    PAIRS.filter(
      ([text, fill]) => contrast(THEMES[id][text], THEMES[id][fill]) < 4.5,
    ).map(([text, fill]) => `${id} ${text}/${fill}` as const),
  );

  // All the handoff's pairs pass. Should a Theme value ever fall short, take
  // it back to design rather than adjusting the approved value here.
  it('meets 4.5:1 in every Theme', () => {
    expect(failures).toEqual([]);
  });

  it.each(THEME_IDS)('uses plain hex values for the pairs in %s', (id) => {
    for (const [text, fill] of PAIRS) {
      expect(THEMES[id][text]).toMatch(/^#[0-9A-F]{6}$/i);
      expect(THEMES[id][fill]).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});
