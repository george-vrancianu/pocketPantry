import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { CustomisePage } from './CustomisePage';

afterEach(() => vi.unstubAllGlobals());

const LAYOUT = {
  widgets: [
    { id: 'a', type: 'use-soon', size: 'wide' },
    { id: 'b', type: 'shopping', size: 'small' },
    { id: 'c', type: 'quick-scan', size: 'wide' },
  ],
};

function setup(layout: unknown = LAYOUT, putStatus = 200) {
  const { fetchMock, calls } = stubApi({
    'GET /api/dashboard-layout': () => Response.json(layout),
    'PUT /api/dashboard-layout': () =>
      putStatus === 200
        ? Response.json({})
        : Response.json(
            { code: 'internal', params: {} },
            { status: putStatus },
          ),
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(<CustomisePage />, { route: '/customise' });
  const puts = () =>
    calls
      .filter((c) => c.key === 'PUT /api/dashboard-layout')
      .map((c) => c.body);
  return { puts, user: userEvent.setup() };
}

const rows = async () =>
  within(
    await screen.findByRole('list', { name: 'On your dashboard' }),
  ).getAllByRole('listitem');
const names = async () =>
  (await rows()).map((row) => row.getAttribute('aria-label'));

describe('CustomisePage', () => {
  it('lists the Widgets on the dashboard and offers only the missing types', async () => {
    setup();

    expect(await names()).toEqual(['Use soon', 'Shopping', 'Quick scan']);
    const gallery = screen.getByRole('region', { name: 'Add widgets' });
    expect(
      within(gallery)
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label')),
    ).toEqual([
      'Add Pantry widget',
      'Add Meal plan widget',
      'Add Budget widget',
      'Add Nutrition widget',
    ]);
  });

  it('moves a Widget down and up with the keyboard-operable buttons and saves the order', async () => {
    const { puts, user } = setup();
    await rows();

    await user.click(
      screen.getByRole('button', { name: 'Move Use soon down' }),
    );

    expect(await names()).toEqual(['Shopping', 'Use soon', 'Quick scan']);
    expect(puts().at(-1)).toEqual({
      widgets: [LAYOUT.widgets[1], LAYOUT.widgets[0], LAYOUT.widgets[2]],
    });

    await user.click(
      screen.getByRole('button', { name: 'Move Quick scan up' }),
    );
    expect(await names()).toEqual(['Shopping', 'Quick scan', 'Use soon']);
  });

  it('keeps focus on the same button after a move and ignores moves past the ends', async () => {
    const { puts, user } = setup();
    await rows();
    const up = screen.getByRole('button', { name: 'Move Use soon up' });
    expect(up).toHaveAttribute('aria-disabled', 'true');

    await user.click(up);
    expect(puts()).toHaveLength(0);

    const down = screen.getByRole('button', { name: 'Move Use soon down' });
    down.focus();
    await user.keyboard('{Enter}');
    expect(
      screen.getByRole('button', { name: 'Move Use soon down' }),
    ).toHaveFocus();
  });

  it('toggles a Widget between small and wide and saves it', async () => {
    const { puts, user } = setup();
    await rows();

    await user.click(
      screen.getByRole('button', { name: /Size of Shopping: Small/ }),
    );

    expect(
      screen.getByRole('button', { name: /Size of Shopping: Wide/ }),
    ).toBeInTheDocument();
    expect(puts().at(-1)).toEqual({
      widgets: [
        LAYOUT.widgets[0],
        { id: 'b', type: 'shopping', size: 'wide' },
        LAYOUT.widgets[2],
      ],
    });
  });

  it('disables the size toggle for a Widget that only comes wide', async () => {
    setup();
    await rows();

    expect(
      screen.getByRole('button', { name: /Size of Quick scan/ }),
    ).toBeDisabled();
  });

  it('removes a Widget, saves, offers it again in the gallery and moves focus to a neighbour', async () => {
    const { puts, user } = setup();
    await rows();

    await user.click(
      screen.getByRole('button', { name: 'Remove Shopping widget' }),
    );

    expect(await names()).toEqual(['Use soon', 'Quick scan']);
    expect(puts().at(-1)).toEqual({
      widgets: [LAYOUT.widgets[0], LAYOUT.widgets[2]],
    });
    expect(
      screen.getByRole('button', { name: 'Add Shopping widget' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reorder Quick scan' }),
    ).toHaveFocus();
  });

  it('adds a Widget at its default size, saves, hides it from the gallery and focuses it', async () => {
    const { puts, user } = setup();
    await rows();

    await user.click(screen.getByRole('button', { name: 'Add Budget widget' }));

    expect(await names()).toEqual([
      'Use soon',
      'Shopping',
      'Quick scan',
      'Budget',
    ]);
    const saved = puts().at(-1) as { widgets: Array<Record<string, string>> };
    expect(saved.widgets.at(-1)).toMatchObject({
      type: 'budget',
      size: 'small',
    });
    expect(saved.widgets.at(-1)?.id).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Add Budget widget' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reorder Budget' }),
    ).toHaveFocus();
  });

  it('shows an error and restores the saved layout when saving fails', async () => {
    const { user } = setup(LAYOUT, 500);
    await rows();

    await user.click(
      screen.getByRole('button', { name: 'Remove Shopping widget' }),
    );

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await names()).toEqual(['Use soon', 'Shopping', 'Quick scan']);
  });

  it('has a Done link back home', async () => {
    setup();
    expect(await screen.findByRole('link', { name: 'Done' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
