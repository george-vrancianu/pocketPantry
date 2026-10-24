import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import { AppScreenHeader } from './AppScreenHeader';

describe('AppScreenHeader', () => {
  it('links to Settings with the gear', () => {
    renderWithProviders(<AppScreenHeader title="Pantry" />, {
      route: '/pantry',
    });

    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    );
  });

  it('leaves the gear out on Settings itself', () => {
    renderWithProviders(<AppScreenHeader title="Settings" />, {
      route: '/settings',
    });

    expect(
      screen.queryByRole('link', { name: 'Settings' }),
    ).not.toBeInTheDocument();
  });
});
