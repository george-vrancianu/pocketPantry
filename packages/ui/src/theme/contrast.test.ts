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
  // Unselected segment labels sit on the `chip` track.
  ['muted', 'chip'],
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

  // Design handoff values that fall short of 4.5:1. They are taken back to
  // design rather than adjusted here (muted #766A58 on chip #EAE1CF is 4.07:1
  // in Warm editorial; Minimal crisp is 4.36:1; both 14 px / 600 segment
  // labels). The list is exact: a new failure, or a design fix, trips the test.
  const KNOWN_HANDOFF_FAILURES = [
    'warm muted/chip',
    'minimal muted/chip',
  ] as const;

  it('meets 4.5:1 in every Theme except the known handoff failures', () => {
    expect(failures).toEqual(KNOWN_HANDOFF_FAILURES);
  });

  it.each(THEME_IDS)('uses plain hex values for the pairs in %s', (id) => {
    for (const [text, fill] of PAIRS) {
      expect(THEMES[id][text]).toMatch(/^#[0-9A-F]{6}$/i);
      expect(THEMES[id][fill]).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});

describe('The Intro ground (Warm, olive): text meets 4.5:1', () => {
  const warm = THEMES.warm;
  it.each([
    ['cream text', warm.surface, warm.accent],
    [
      'cream text on the darker olive cards',
      warm.surface,
      warm['accent-on-tint'],
    ],
    ['butter-ink on butter buttons', warm['butter-ink'], warm.butter],
    ['ink on the cream speech bubble', warm.ink, warm['card-bg']],
  ])('%s', (_name, text, fill) => {
    expect(contrast(text, fill)).toBeGreaterThanOrEqual(4.5);
  });
});
