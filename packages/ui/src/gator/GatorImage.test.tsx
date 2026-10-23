import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';
import dapperArt from './art/gator-health-dapper.svg?raw';
import {
  GATOR_MOODS,
  GatorImage,
  type GatorImageProps,
  type GatorMood,
} from './GatorImage';

const ALTS: Record<GatorMood, string> = {
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

afterEach(cleanup);

describe('GatorImage', () => {
  it('has the 13 moods', () => {
    expect(GATOR_MOODS).toHaveLength(13);
  });

  it.each(Object.entries(ALTS))(
    'renders %s with an alt that describes it',
    (mood, alt) => {
      render(<GatorImage mood={mood as GatorMood} alt={alt} />);
      expect(screen.getByRole('img', { name: alt })).toBeTruthy();
    },
  );

  it('marks the image with its mood, for tests that must find a decorative one', () => {
    const { container } = render(<GatorImage mood="chef" decorative />);
    expect(container.querySelector('img')?.getAttribute('data-mood')).toBe(
      'chef',
    );
  });

  it('has a described alt for every mood', () => {
    expect(Object.keys(ALTS).sort()).toEqual([...GATOR_MOODS].sort());
  });

  it('requires an alt unless decorative', () => {
    // Compile-time only (checked by the ui typecheck); nothing is rendered.
    expectTypeOf<{ mood: 'happy' }>().not.toExtend<GatorImageProps>();
    expectTypeOf<{ mood: 'happy'; alt: string }>().toExtend<GatorImageProps>();
    expectTypeOf<{
      mood: 'happy';
      decorative: true;
    }>().toExtend<GatorImageProps>();
    expectTypeOf<{
      mood: 'happy';
      decorative: true;
      alt: string;
    }>().not.toExtend<GatorImageProps>();
  });

  it('maps every mood to its own art', () => {
    const srcs = GATOR_MOODS.map((mood) => {
      const { container, unmount } = render(
        <GatorImage mood={mood} decorative />,
      );
      const src = container.querySelector('img')!.getAttribute('src');
      unmount();
      return src;
    });
    for (const src of srcs) expect(src).toBeTruthy();
    expect(new Set(srcs).size).toBe(GATOR_MOODS.length);
  });

  it('takes a translated alt', () => {
    render(<GatorImage mood="happy" alt="Aligator, vesel" />);
    expect(screen.getByRole('img', { name: 'Aligator, vesel' })).toBeTruthy();
  });

  it('is empty-alt and hidden from assistive tech when decorative', () => {
    const { container } = render(<GatorImage mood="chef" decorative />);
    const img = container.querySelector('img')!;
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('applies the size as the width', () => {
    const { container } = render(
      <GatorImage mood="proud" size={160} alt="Gator, proud" />,
    );
    const img = container.querySelector('img')!;
    expect(img.getAttribute('width')).toBe('160');
    expect(img.style.width).toBe('160px');
  });
});

describe('dapper Gator art', () => {
  it('has no pipe or soap bubbles but keeps the monocle', () => {
    expect(dapperArt).not.toMatch(/#4A2F18|#7A4E2C|#8CCBEA/i);
    // Monocle ring and chain.
    expect(dapperArt).toContain('stroke="#B87A1E"');
    expect(dapperArt).toContain('stroke-dasharray="5 3"');
  });

  it('has one star glint that plays once', () => {
    expect(dapperArt.match(/class="gator-glint"/g)).toHaveLength(1);
    const rule = /\.gator-glint\{[^}]*animation:([^;}]*)/.exec(dapperArt);
    expect(rule?.[1]).toMatch(/\s1\s+both\b/);
    expect(rule?.[1]).not.toMatch(/infinite/);
  });

  it('never animates the glint under reduced motion', () => {
    const media =
      /@media \(prefers-reduced-motion:reduce\)\{\.gator-glint\{([^}]*)\}/.exec(
        dapperArt,
      );
    expect(media?.[1]).toContain('animation:none');
  });
});
