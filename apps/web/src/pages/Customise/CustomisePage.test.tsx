import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { stubViewport } from '../../test/viewport';
import { newWidgetId } from '../../lib/dashboardLayout';
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

/** A fetch stub whose PUTs stay pending until the test responds, recording call order. */
function controlledApi({ holdRefetch = false } = {}) {
  const puts: Array<{ body: unknown; respond: (status: number) => void }> = [];
  const order: string[] = [];
  let gets = 0;
  let release: () => void = () => undefined;
  vi.stubGlobal('fetch', (_input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === 'PUT') {
      order.push('PUT');
      return new Promise<Response>((resolve) => {
        puts.push({
          body: JSON.parse(String(init.body)),
          respond: (status) =>
            resolve(
              status === 200
                ? Response.json({})
                : Response.json({ code: 'internal', params: {} }, { status }),
            ),
        });
      });
    }
    order.push('GET');
    gets += 1;
    if (holdRefetch && gets > 1) {
      return new Promise<Response>((resolve) => {
        release = () => resolve(Response.json(LAYOUT));
      });
    }
    return Promise.resolve(Response.json(LAYOUT));
  });
  renderWithProviders(<CustomisePage />, { route: '/customise' });
  return { puts, order, gets: () => gets, releaseRefetch: () => release() };
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
    expect(puts().at(-1)).toEqual({
      widgets: [LAYOUT.widgets[1], LAYOUT.widgets[2], LAYOUT.widgets[0]],
    });
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

    const toggle = screen.getByRole('button', { name: /Size of Quick scan/ });
    expect(toggle).toHaveAttribute('aria-disabled', 'true');
    toggle.focus();
    expect(toggle).toHaveFocus();
  });

  it('offers tall only at 900 px and up, cycling through the sizes the Widget supports', async () => {
    stubViewport(1000);
    const { puts, user } = setup();
    await rows();

    await user.click(
      screen.getByRole('button', { name: /Size of Use soon: Wide/ }),
    );
    expect(puts().at(-1)).toMatchObject({
      widgets: [{ id: 'a', size: 'tall' }, {}, {}],
    });
    await user.click(
      screen.getByRole('button', { name: /Size of Use soon: Tall/ }),
    );
    expect(puts().at(-1)).toMatchObject({
      widgets: [{ id: 'a', size: 'small' }, {}, {}],
    });
  });

  it('skips tall on a narrow viewport and never rewrites a saved tall', async () => {
    stubViewport(400);
    const { puts, user } = setup();
    await rows();
    await user.click(
      screen.getByRole('button', { name: /Size of Use soon: Wide/ }),
    );
    expect(puts().at(-1)).toMatchObject({
      widgets: [{ id: 'a', size: 'small' }, {}, {}],
    });
  });

  it('shows a saved tall as it is on a narrow viewport and leaves it until the Member resizes', async () => {
    stubViewport(400);
    const { puts, user } = setup({
      widgets: [{ id: 'a', type: 'use-soon', size: 'tall' }],
    });
    await rows();
    const toggle = screen.getByRole('button', {
      name: /Size of Use soon: Tall/,
    });
    expect(toggle).not.toHaveAttribute('aria-disabled');
    expect(puts()).toHaveLength(0);
    await user.click(toggle);
    expect(puts().at(-1)).toMatchObject({
      widgets: [{ id: 'a', size: 'small' }],
    });
  });

  it('announces a resize in the status region', async () => {
    const { user } = setup();
    await rows();
    await user.click(
      screen.getByRole('button', { name: /Size of Shopping: Small/ }),
    );
    expect(screen.getByText('Shopping size set to Wide.')).toBeInTheDocument();
  });

  it('shows each Widget icon in its row', async () => {
    setup();
    for (const row of await rows()) {
      expect(within(row).getByTestId('widget-icon')).toBeInTheDocument();
    }
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

  it('serialises quick edits: one PUT at a time and the last edit wins', async () => {
    const api = controlledApi();
    const user = userEvent.setup();
    await rows();

    await user.click(
      screen.getByRole('button', { name: 'Remove Shopping widget' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Remove Quick scan widget' }),
    );

    await vi.waitFor(() => expect(api.puts).toHaveLength(1));
    expect(api.puts[0]!.body).toEqual({
      widgets: [LAYOUT.widgets[0], LAYOUT.widgets[2]],
    });
    api.puts[0]!.respond(200);
    await vi.waitFor(() => expect(api.puts).toHaveLength(2));
    expect(api.puts[1]!.body).toEqual({ widgets: [LAYOUT.widgets[0]] });
    api.puts[1]!.respond(200);
    expect(await names()).toEqual(['Use soon']);
  });

  it('still shows the alert when a first save fails while a second is queued, and ends consistent', async () => {
    const api = controlledApi();
    const user = userEvent.setup();
    await rows();

    await user.click(
      screen.getByRole('button', { name: 'Remove Shopping widget' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Remove Quick scan widget' }),
    );
    await vi.waitFor(() => expect(api.puts).toHaveLength(1));
    api.puts[0]!.respond(500);
    await vi.waitFor(() => expect(api.puts).toHaveLength(2));
    // the second save is still in flight: no refetch may clobber the optimistic cache
    expect(api.gets()).toBe(1);
    api.puts[1]!.respond(200);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await names()).toEqual(['Use soon']);
    expect(api.gets()).toBe(1);
  });

  it('refetches the stored layout only after the last failed save has rolled back', async () => {
    const api = controlledApi();
    const user = userEvent.setup();
    await rows();

    await user.click(
      screen.getByRole('button', { name: 'Remove Shopping widget' }),
    );
    await vi.waitFor(() => expect(api.puts).toHaveLength(1));
    api.puts[0]!.respond(500);

    await vi.waitFor(() => expect(api.gets()).toBe(2));
    expect(api.order).toEqual(['GET', 'PUT', 'GET']);
    expect(await names()).toEqual(['Use soon', 'Shopping', 'Quick scan']);
  });

  it('cancels an in-flight refetch when the Member edits again, so stale data cannot overwrite the edit', async () => {
    const api = controlledApi({ holdRefetch: true });
    const user = userEvent.setup();
    await rows();

    await user.click(
      screen.getByRole('button', { name: 'Remove Shopping widget' }),
    );
    await vi.waitFor(() => expect(api.puts).toHaveLength(1));
    api.puts[0]!.respond(500);
    await vi.waitFor(() => expect(api.gets()).toBe(2));

    await user.click(
      screen.getByRole('button', { name: 'Remove Quick scan widget' }),
    );
    api.releaseRefetch();
    await vi.waitFor(() => expect(api.puts).toHaveLength(2));
    api.puts[1]!.respond(200);

    expect(await names()).toEqual(['Use soon']);
  });

  it('has a Done link back home', async () => {
    setup();
    expect(await screen.findByRole('link', { name: 'Done' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});

describe('newWidgetId', () => {
  it('works where crypto.randomUUID is unavailable (plain-HTTP LAN)', () => {
    vi.stubGlobal('crypto', {});
    const a = newWidgetId();
    const b = newWidgetId();
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).not.toBe(b);
  });
});
