import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import dapperArt from './art/gator-health-dapper.svg?raw';
import { GATOR_MOODS, GatorImage, type GatorMood } from './GatorImage';

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

  it('has a described alt for every mood', () => {
    expect(Object.keys(ALTS).sort()).toEqual([...GATOR_MOODS].sort());
  });

  it('requires an alt unless decorative', () => {
    // @ts-expect-error alt is required when the image is not decorative
    render(<GatorImage mood="happy" />);
    // @ts-expect-error a decorative image takes no alt
    render(<GatorImage mood="happy" decorative alt="x" />);
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
