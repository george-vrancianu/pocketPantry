import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import { AppScreenHeader } from './AppScreenHeader';

describe('AppScreenHeader', () => {
  it('leaves Home and the Settings gear out where the Dock shows', () => {
    renderWithProviders(<AppScreenHeader title="Pantry" />, {
      route: '/pantry',
    });

    expect(
      screen.queryByRole('link', { name: 'Home' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Settings' }),
    ).not.toBeInTheDocument();
  });

  it('links Home where the Dock is hidden', () => {
    renderWithProviders(<AppScreenHeader title="Customise" />, {
      route: '/customise',
    });

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
