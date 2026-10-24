import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import { AuthShell } from './AuthShell';

describe('AuthShell', () => {
  it('shows the app name beside the logo, leaving the title the only heading', () => {
    renderWithProviders(
      <AuthShell title="Create your account" subtitle="Start" back="Back">
        <p>Form</p>
      </AuthShell>,
    );
    expect(screen.getByText('PantryGator')).toBeInTheDocument();
    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { name: 'Create your account' }),
    ).toBeInTheDocument();
  });
});
