import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Gator, ONE_SHOT_MS, type GatorProps } from './Gator';
import { GATOR_GEOMETRY, type AnimatedGatorMood } from './gatorGeometry';

const ALTS: Record<AnimatedGatorMood, string> = {
  'shopping-buddy': 'Gator waving, holding a shopping basket',
  'app-icon': 'Gator, the app icon',
  talking: 'Gator talking',
  happy: 'Gator, happy',
  proud: 'Gator beaming with pride, eyes closed in a big grin',
  listening: 'Gator listening',
  thinking: 'Gator thinking',
  'list-keeper': 'Gator in glasses reading the receipt',
  worried: 'Gator, worried',
  'health-curious': 'Gator, raising an eyebrow',
  'health-dapper': 'Gator with a monocle, smiling contentedly',
  'health-hmm': 'Gator, unsure',
  chef: 'Gator the chef stirring a pot',
};
const MOODS = Object.keys(ALTS) as AnimatedGatorMood[];
const VARIANTS = ['idle', 'signature', 'entrance', 'tap'] as const;

const art = import.meta.glob<string>('./art/gator-*-*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const artOf = (mood: string, variant: string) =>
  art[`./art/gator-${mood}-${variant}.svg`];

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

const image = (container: HTMLElement) => container.querySelector('img')!;
const motion = (container: HTMLElement) =>
  image(container).getAttribute('data-motion');
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.useFakeTimers();
  stubReducedMotion(false);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Gator', () => {
  it.each(Object.entries(ALTS))('renders %s with its alt', (mood, alt) => {
    const { container } = render(
      <Gator mood={mood as AnimatedGatorMood} alt={alt} />,
    );
    expect(screen.getByRole('img', { name: alt })).toBeTruthy();
    expect(image(container).getAttribute('data-mood')).toBe(mood);
  });

  it('is empty-alt and hidden from assistive tech when decorative', () => {
    const { container } = render(<Gator mood="chef" decorative />);
    expect(image(container).getAttribute('alt')).toBe('');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('plays the Entrance, then the idle loop after 1300 ms', () => {
    const { container } = render(<Gator mood="happy" decorative />);
    expect(motion(container)).toBe('entrance');
    advance(1299);
    expect(motion(container)).toBe('entrance');
    advance(1);
    expect(motion(container)).toBe('idle');
  });

  it('ends on the signature loop when asked', () => {
    const { container } = render(
      <Gator mood="shopping-buddy" loop="signature" decorative />,
    );
    expect(motion(container)).toBe('entrance');
    advance(ONE_SHOT_MS.entrance);
    expect(motion(container)).toBe('signature');
  });

  it('starts on the loop without the Entrance', () => {
    const { container } = render(
      <Gator mood="happy" entrance={false} loop="signature" decorative />,
    );
    expect(motion(container)).toBe('signature');
    advance(5000);
    expect(motion(container)).toBe('signature');
  });

  it('goes straight to the new mood loop when the mood changes', () => {
    const { container, rerender } = render(<Gator mood="happy" decorative />);
    advance(ONE_SHOT_MS.entrance);
    rerender(<Gator mood="worried" decorative />);
    expect(image(container).getAttribute('data-mood')).toBe('worried');
    expect(motion(container)).toBe('idle');
  });

  it('skips the rest of the Entrance on a mood change', () => {
    const { container, rerender } = render(<Gator mood="happy" decorative />);
    advance(500);
    rerender(<Gator mood="worried" decorative />);
    expect(motion(container)).toBe('idle');
  });

  it('does not replay a cut-short Entrance when the mood changes back', () => {
    const { container, rerender } = render(<Gator mood="happy" decorative />);
    advance(500);
    rerender(<Gator mood="worried" decorative />);
    expect(motion(container)).toBe('idle');
    advance(300);
    rerender(<Gator mood="happy" decorative />);
    expect(motion(container)).toBe('idle');
    advance(1000);
    expect(motion(container)).toBe('idle');
  });

  it('switches loops when the loop changes', () => {
    const { container, rerender } = render(
      <Gator mood="happy" decorative entrance={false} />,
    );
    expect(motion(container)).toBe('idle');
    rerender(
      <Gator mood="happy" decorative entrance={false} loop="signature" />,
    );
    expect(motion(container)).toBe('signature');
  });

  it('switches loops after a one-shot in progress', () => {
    const { container, rerender } = render(<Gator mood="happy" decorative />);
    rerender(<Gator mood="happy" decorative loop="signature" />);
    expect(motion(container)).toBe('entrance');
    advance(ONE_SHOT_MS.entrance);
    expect(motion(container)).toBe('signature');
  });

  it('keeps the same image element while switching, so the old art stays until the new one loads', () => {
    const { container } = render(<Gator mood="happy" decorative />);
    const before = image(container);
    advance(ONE_SHOT_MS.entrance);
    expect(image(container)).toBe(before);
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  describe('with reduced motion', () => {
    beforeEach(() => stubReducedMotion(true));

    it('only ever shows the loop', () => {
      const { container, rerender } = render(
        <Gator mood="happy" loop="signature" decorative />,
      );
      expect(motion(container)).toBe('signature');
      advance(ONE_SHOT_MS.entrance);
      expect(motion(container)).toBe('signature');
      rerender(<Gator mood="worried" decorative />);
      expect(motion(container)).toBe('idle');
    });

    it('shows no half-played Entrance if reduced motion is turned off later', () => {
      const { container, rerender } = render(<Gator mood="happy" decorative />);
      stubReducedMotion(false);
      advance(500);
      rerender(<Gator mood="happy" decorative />);
      expect(motion(container)).toBe('idle');
    });
  });

  describe('sizing', () => {
    it.each(MOODS)(
      'renders the %s drawing at size and keeps the layout box',
      (mood) => {
        const { container } = render(
          <Gator mood={mood} size={200} decorative />,
        );
        const img = image(container);
        const { drawing } = GATOR_GEOMETRY[mood];
        const scale = 200 / drawing[2];
        const px = (v: string) => Number.parseFloat(v);
        const {
          width,
          height,
          marginLeft,
          marginRight,
          marginTop,
          marginBottom,
        } = img.style;
        // Image width + horizontal margins = the drawing's box.
        expect(px(width) + px(marginLeft) + px(marginRight)).toBeCloseTo(200);
        expect(px(height) + px(marginTop) + px(marginBottom)).toBeCloseTo(
          drawing[3] * scale,
        );
        // The padding hangs outside, never shrinks the box.
        for (const m of [marginLeft, marginRight, marginTop, marginBottom]) {
          expect(px(m)).toBeLessThanOrEqual(0);
        }
        expect(px(width)).toBeGreaterThan(200);
      },
    );

    it('defaults to 96 wide', () => {
      const { container } = render(<Gator mood="happy" decorative />);
      const img = image(container);
      const s = img.style;
      expect(
        Number.parseFloat(s.width) +
          Number.parseFloat(s.marginLeft) +
          Number.parseFloat(s.marginRight),
      ).toBeCloseTo(96);
    });
  });

  it('requires an alt unless decorative', () => {
    // Compile-time only (checked by the ui typecheck).
    const ok: GatorProps[] = [
      { mood: 'happy', alt: 'x' },
      { mood: 'happy', decorative: true },
    ];
    expect(ok).toHaveLength(2);
    // @ts-expect-error alt is required unless decorative
    const bad: GatorProps = { mood: 'happy' };
    expect(bad).toBeTruthy();
  });
});

describe('Gator art', () => {
  it('has a geometry entry for every mood', () => {
    expect(Object.keys(GATOR_GEOMETRY).sort()).toEqual([...MOODS].sort());
  });

  it.each(MOODS)('has all four variant files for %s', (mood) => {
    for (const variant of VARIANTS) {
      expect(artOf(mood, variant), `${mood} ${variant}`).toMatch(/^<svg/);
    }
  });

  it.each(MOODS)(
    'shares one viewBox across the %s variants, as geometry says',
    (mood) => {
      const expected = GATOR_GEOMETRY[mood].view.join(' ');
      for (const variant of VARIANTS) {
        expect(/viewBox="([^"]*)"/.exec(artOf(mood, variant)!)?.[1]).toBe(
          expected,
        );
      }
    },
  );

  it('keeps every Gator animated art file free of external references', () => {
    for (const text of Object.values(art)) {
      expect(text).not.toMatch(/href="https?:/);
    }
  });

  /** Longest animation end in ms: delay + duration x iterations; Infinity if it loops. */
  function longestAnimationMs(svg: string): number {
    const css = /<style>([\s\S]*?)<\/style>/.exec(svg)?.[1] ?? '';
    expect(css).not.toMatch(/animation-(delay|duration|iteration-count)/);
    let longest = 0;
    for (const [, value] of css.matchAll(/animation:([^;}]*)/g)) {
      if (/^\s*none/.test(value!)) continue;
      const times = [...value!.matchAll(/(-?\d*\.?\d+)(ms|s)\b/g)].map(
        ([, n, unit]) => Number(n) * (unit === 's' ? 1000 : 1),
      );
      const duration = times[0] ?? 0;
      const delay = times[1] ?? 0;
      const rest = value!.replace(/(-?\d*\.?\d+)(ms|s)\b/g, '');
      const count = /infinite/.test(rest)
        ? Infinity
        : Number(/(?:^|\s)(\d*\.?\d+)(?=\s|$)/.exec(rest)?.[1] ?? 1);
      longest = Math.max(longest, delay + duration * count);
    }
    return longest;
  }

  it('measures a looping animation as endless', () => {
    expect(
      longestAnimationMs('<style>.a{animation:x 1s ease infinite}</style>'),
    ).toBe(Infinity);
    expect(
      longestAnimationMs(
        '<style>.a{animation:x .5s linear .2s 2 both}</style>',
      ),
    ).toBeCloseTo(1200);
  });

  it.each(MOODS)('ends the %s Entrance within 1300 ms', (mood) => {
    const longest = longestAnimationMs(artOf(mood, 'entrance')!);
    expect(longest).toBeGreaterThan(0);
    expect(longest).toBeLessThanOrEqual(ONE_SHOT_MS.entrance);
  });

  it.each(MOODS)('ends the %s Tap within 900 ms', (mood) => {
    const longest = longestAnimationMs(artOf(mood, 'tap')!);
    expect(longest).toBeGreaterThan(0);
    expect(longest).toBeLessThanOrEqual(900);
  });

  it.each(MOODS)('stops the %s loops under reduced motion', (mood) => {
    for (const variant of ['idle', 'signature']) {
      expect(artOf(mood, variant)).toMatch(
        /@media \(prefers-reduced-motion: reduce\)\{svg \*\{animation:none !important\}\}/,
      );
    }
  });
});
