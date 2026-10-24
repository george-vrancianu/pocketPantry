import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PlusIcon } from '../atoms/icons';
import { renderWithTheme } from '../test/render';
import { ScreenHeader } from './ScreenHeader';

describe('ScreenHeader', () => {
  afterEach(cleanup);

  it('shows the action as the only button without `home` or `back`', () => {
    renderWithTheme(
      <ScreenHeader
        title="Pantry"
        action={{ label: 'Add', icon: <PlusIcon />, href: '/add' }}
      />,
    );

    const names = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('aria-label'));
    expect(names).toEqual(['Add']);
  });

  it('shows Home before the title with `home`', () => {
    renderWithTheme(
      <ScreenHeader title="Customise" home={{ label: 'Home' }} />,
    );

    expect(
      screen.getByRole('link', { name: 'Home' }).getAttribute('href'),
    ).toBe('/');
  });

  it('opens a menu when the action has items', async () => {
    renderWithTheme(
      <ScreenHeader
        title="Recipes"
        action={{
          label: 'Add',
          icon: <PlusIcon />,
          items: [{ label: 'New recipe', href: '/recipes/new' }],
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(
      await screen.findByRole('menuitem', { name: 'New recipe' }),
    ).toBeTruthy();
  });
});
