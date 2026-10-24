import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PlusIcon } from '../atoms/icons';
import { renderWithTheme } from '../test/render';
import { ScreenHeader } from './ScreenHeader';

describe('ScreenHeader', () => {
  afterEach(cleanup);

  it('puts the Settings gear after the action, as the rightmost button', () => {
    renderWithTheme(
      <ScreenHeader
        title="Pantry"
        homeLabel="Home"
        action={{ label: 'Add', icon: <PlusIcon />, href: '/add' }}
        settings={{ label: 'Settings', href: '/settings' }}
      />,
    );

    const names = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('aria-label'));
    expect(names).toEqual(['Home', 'Add', 'Settings']);
    expect(
      screen.getByRole('link', { name: 'Settings' }).getAttribute('href'),
    ).toBe('/settings');
  });

  it('leaves the gear out without `settings`', () => {
    renderWithTheme(<ScreenHeader title="Settings" homeLabel="Home" />);

    expect(screen.queryByRole('link', { name: 'Settings' })).toBeNull();
  });
});
