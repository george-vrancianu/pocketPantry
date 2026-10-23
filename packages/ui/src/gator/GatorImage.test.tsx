import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import dapperArt from './art/gator-health-dapper.svg?raw';
import { GATOR_MOODS, GatorImage } from './GatorImage';

afterEach(cleanup);

describe('GatorImage', () => {
  it('has the 13 moods', () => {
    expect(GATOR_MOODS).toHaveLength(13);
  });

  it.each(GATOR_MOODS)(
    'renders %s with art and an alt naming the mood',
    (mood) => {
      render(<GatorImage mood={mood} />);
      const img = screen.getByRole('img', { name: /^Gator, \w+/ });
      expect(img.getAttribute('src')).toMatch(/svg/);
      expect(img.getAttribute('data-gator-mood')).toBe(mood);
    },
  );

  it('names the mood in the alt', () => {
    render(<GatorImage mood="happy" />);
    expect(screen.getByRole('img', { name: 'Gator, happy' })).toBeTruthy();
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
    const { container } = render(<GatorImage mood="proud" size={160} />);
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
    expect(rule?.[1]).toMatch(/\b1\b/);
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
