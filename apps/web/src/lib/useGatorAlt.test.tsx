import { GATOR_MOODS } from '@pocket-pantry/ui';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resources } from '../i18n/resources';
import { useGatorAlt } from './useGatorAlt';
import { renderWithProviders } from '../test/render';

describe('useGatorAlt', () => {
  it('has alt text naming every mood, in every language', () => {
    for (const locale of ['en', 'ro', 'da'] as const) {
      const alt = (resources[locale].gator as { alt: Record<string, string> })
        .alt;
      for (const mood of GATOR_MOODS)
        expect(alt[mood], `${locale} ${mood}`).toMatch(/\S/);
      expect(Object.keys(alt).sort()).toEqual([...GATOR_MOODS].sort());
    }
  });

  it('returns the English alt for a mood', () => {
    function Probe() {
      return <p>{useGatorAlt()('worried')}</p>;
    }
    renderWithProviders(<Probe />);
    expect(screen.getByText('Gator, worried')).toBeInTheDocument();
  });

  it('describes the disappointed chef', () => {
    function Probe() {
      return <p>{useGatorAlt()('chef-flop')}</p>;
    }
    renderWithProviders(<Probe />);
    expect(
      screen.getByText('Gator, disappointed, with the cooking tools dropped'),
    ).toBeInTheDocument();
  });
});
