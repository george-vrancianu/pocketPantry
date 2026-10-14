import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { SettingsPage } from './SettingsPage';

type Override = { categoryId: string; name: string; days: number };

const categories = {
  parents: [
    {
      id: 'p-dairy',
      name: 'Dairy',
      catalogDays: 7,
      leaves: [
        { id: 'l-milk', name: 'Milk', catalogDays: 5 },
        { id: 'l-cheese', name: 'Hard cheese', catalogDays: 60 },
      ],
    },
    {
      id: 'p-produce',
      name: 'Produce',
      leaves: [{ id: 'l-leafy', name: 'Leafy greens' }],
    },
  ],
};

function family(expiryOverrides: Override[]) {
  return {
    staleThresholdDays: 3,
    expiryOverrides,
  };
}

/** The Family tab with these overrides; the mutation routes answer as the API does. */
function stubFamily(
  overrides: Override[],
  options: {
    put?: () => Response;
    del?: () => Response;
  } = {},
) {
  let current = overrides;
  const { fetchMock, calls } = stubApi({
    'GET /api/settings/family': () => Response.json(family(current)),
    'GET /api/settings/categories': () => Response.json(categories),
    'GET /api/settings/preferences': () =>
      Response.json({ locale: null, theme: null }),
    'GET /api/auth/get-session': () => Response.json(null),
    'PUT /api/settings/family/expiry-overrides/l-milk': () =>
      options.put?.() ?? new Response(null, { status: 204 }),
    'DELETE /api/settings/family/expiry-overrides/l-milk': () => {
      current = current.filter((o) => o.categoryId !== 'l-milk');
      return options.del?.() ?? new Response(null, { status: 204 });
    },
    'DELETE /api/settings/family/expiry-overrides/p-produce': () => {
      current = current.filter((o) => o.categoryId !== 'p-produce');
      return new Response(null, { status: 204 });
    },
  });
  vi.stubGlobal('fetch', fetchMock);
  return { calls };
}

const MILK: Override = { categoryId: 'l-milk', name: 'Milk', days: 9 };
const PRODUCE: Override = {
  categoryId: 'p-produce',
  name: 'Produce',
  days: 21,
};

function renderFamily() {
  return renderWithProviders(<SettingsPage />, {
    route: '/settings?tab=family',
  });
}

const writes = (calls: { key: string }[]) =>
  calls.map((call) => call.key).filter((key) => !key.startsWith('GET'));

const rowOf = (name: string) =>
  within(screen.getByRole('list', { name: 'Default expiry' })).getByRole(
    'button',
    { name: new RegExp(`^${name}\\b`) },
  );

describe('Default expiry', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('the list', () => {
    it('shows each override with its name, parent, Catalog default and value', async () => {
      stubFamily([MILK, PRODUCE]);
      renderFamily();

      const milk = await waitFor(() => rowOf('Milk'));
      expect(within(milk).getByText('Dairy · Catalog 5 d')).toBeVisible();
      expect(within(milk).getByText('9')).toBeVisible();

      const produce = rowOf('Produce');
      expect(
        within(produce).getByText('Produce · every category without its own'),
      ).toBeVisible();
      expect(within(produce).getByText('21')).toBeVisible();
    });

    it('explains the Catalog defaults and offers "Set a category" when empty', async () => {
      stubFamily([]);
      renderFamily();

      expect(
        await screen.findByText(
          'Catalog defaults are used for every category. Add one to set your own.',
        ),
      ).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Set a category' }),
      ).toBeVisible();
    });

    it('removing a row hides it at once, shows Undo, and sends nothing until the toast closes', async () => {
      vi.useFakeTimers();
      const { calls } = stubFamily([MILK, PRODUCE]);
      renderFamily();
      await act(() => vi.advanceTimersByTimeAsync(0));
      expect(rowOf('Milk')).toBeVisible();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Use the Catalog default for Milk',
        }),
      );

      expect(screen.queryByRole('button', { name: /^Milk\b/ })).toBeNull();
      expect(screen.getByText('Milk uses the Catalog default')).toBeVisible();
      expect(writes(calls)).toEqual([]);

      await act(() => vi.advanceTimersByTimeAsync(4000));
      expect(writes(calls)).toEqual([]);
      await act(() => vi.advanceTimersByTimeAsync(1500));
      await act(() => vi.advanceTimersByTimeAsync(0));

      expect(writes(calls)).toEqual([
        'DELETE /api/settings/family/expiry-overrides/l-milk',
      ]);
      expect(screen.queryByRole('button', { name: /^Milk\b/ })).toBeNull();
    });

    it('Undo brings the row back and sends no request', async () => {
      const user = userEvent.setup();
      const { calls } = stubFamily([MILK]);
      renderFamily();
      await screen.findByRole('button', { name: /^Milk\b/ });

      await user.click(
        screen.getByRole('button', {
          name: 'Use the Catalog default for Milk',
        }),
      );
      expect(screen.queryByRole('button', { name: /^Milk\b/ })).toBeNull();
      await user.click(await screen.findByRole('button', { name: 'Undo' }));

      expect(rowOf('Milk')).toBeVisible();
      expect(writes(calls)).toEqual([]);
    });
  });

  describe('the sheet', () => {
    it('opens in pick mode from "Set a category", with search and "All {parent}" first in each group', async () => {
      const user = userEvent.setup();
      stubFamily([]);
      renderFamily();
      await user.click(
        await screen.findByRole('button', { name: 'Set a category' }),
      );

      const sheet = await screen.findByRole('dialog', {
        name: 'Pick a category',
      });
      expect(
        within(sheet).getByRole('textbox', { name: 'Search categories' }),
      ).toBeVisible();
      const dairy = within(sheet).getByRole('group', { name: 'Dairy' });
      const rows = within(dairy).getAllByRole('button');
      expect(rows[0]).toHaveTextContent('All Dairy');
      expect(rows[0]).toHaveTextContent('Every Dairy category without its own');
      expect(rows[1]).toHaveTextContent('Milk');
      expect(rows[1]).toHaveTextContent('Catalog 5 d');
    });

    it('filters by category or parent name and says so when nothing matches', async () => {
      const user = userEvent.setup();
      stubFamily([]);
      renderFamily();
      await user.click(
        await screen.findByRole('button', { name: 'Set a category' }),
      );
      const sheet = await screen.findByRole('dialog', {
        name: 'Pick a category',
      });
      const search = within(sheet).getByRole('textbox', {
        name: 'Search categories',
      });

      await user.type(search, 'chees');
      expect(
        within(sheet).getByRole('button', { name: /Hard cheese/ }),
      ).toBeVisible();
      expect(within(sheet).queryByRole('button', { name: /Milk/ })).toBeNull();

      await user.clear(search);
      await user.type(search, 'produce');
      expect(
        within(sheet).getByRole('button', { name: /Leafy greens/ }),
      ).toBeVisible();

      await user.clear(search);
      await user.type(search, 'zzz');
      expect(
        within(sheet).getByText('No category matches “zzz”.'),
      ).toBeVisible();
    });

    it('shows the override as "Set" beside a category, else the Catalog default', async () => {
      const user = userEvent.setup();
      stubFamily([MILK]);
      renderFamily();
      await user.click(
        await screen.findByRole('button', { name: 'Set a category' }),
      );
      const sheet = await screen.findByRole('dialog', {
        name: 'Pick a category',
      });

      expect(
        within(sheet).getByRole('button', { name: /Milk/ }),
      ).toHaveTextContent('Set · 9 d');
      expect(
        within(sheet).getByRole('button', { name: /Hard cheese/ }),
      ).toHaveTextContent('Catalog 60 d');
    });

    it('starts at the existing override in edit mode, with "Use Catalog default"', async () => {
      const user = userEvent.setup();
      stubFamily([MILK]);
      renderFamily();
      await user.click(await rowOfAsync('Milk'));

      const sheet = await screen.findByRole('dialog', { name: 'Milk' });
      expect(
        within(sheet).getByRole('button', { name: '1 week' }),
      ).toHaveAttribute('aria-pressed', 'false');
      expect(within(sheet).getByText('9 days')).toBeVisible();
      expect(
        within(sheet).getByRole('button', { name: 'Use Catalog default' }),
      ).toBeVisible();
    });

    it('starts at the Catalog default when there is no override, and has no "Use Catalog default" then', async () => {
      const user = userEvent.setup();
      stubFamily([]);
      renderFamily();
      await user.click(
        await screen.findByRole('button', { name: 'Set a category' }),
      );
      await user.click(await screen.findByRole('button', { name: /Milk/ }));

      const sheet = await screen.findByRole('dialog', { name: 'Milk' });
      expect(within(sheet).getByText('5 days')).toBeVisible();
      expect(within(sheet).getByText('Catalog says 5')).toBeVisible();
      expect(
        within(sheet).queryByRole('button', { name: 'Use Catalog default' }),
      ).toBeNull();
    });

    it('starts at seven days when there is neither an override nor a Catalog default', async () => {
      const user = userEvent.setup();
      stubFamily([]);
      renderFamily();
      await user.click(
        await screen.findByRole('button', { name: 'Set a category' }),
      );
      await user.click(
        await screen.findByRole('button', { name: /Leafy greens/ }),
      );

      const sheet = await screen.findByRole('dialog', { name: 'Leafy greens' });
      expect(within(sheet).getByText('7 days')).toBeVisible();
      expect(
        within(sheet).getByRole('button', { name: '1 week' }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    it('highlights only the quick pick that equals the value', async () => {
      const user = userEvent.setup();
      stubFamily([MILK]);
      renderFamily();
      await user.click(await rowOfAsync('Milk'));
      const sheet = await screen.findByRole('dialog', { name: 'Milk' });

      const pressed = () =>
        within(sheet)
          .queryAllByRole('button', { pressed: true })
          .map((button) => button.getAttribute('aria-label'));
      expect(pressed()).toEqual([]);

      await user.click(within(sheet).getByRole('button', { name: '2 weeks' }));
      expect(pressed()).toEqual(['2 weeks']);
      expect(within(sheet).getByText('14 days')).toBeVisible();
    });

    it('the stepper covers 1 to 3650 days', async () => {
      const user = userEvent.setup();
      stubFamily([]);
      renderFamily();
      await user.click(
        await screen.findByRole('button', { name: 'Set a category' }),
      );
      await user.click(await screen.findByRole('button', { name: /Milk/ }));
      const sheet = await screen.findByRole('dialog', { name: 'Milk' });

      await user.click(
        within(sheet).getByRole('button', { name: 'One day fewer' }),
      );
      await user.click(
        within(sheet).getByRole('button', { name: 'One day fewer' }),
      );
      await user.click(
        within(sheet).getByRole('button', { name: 'One day fewer' }),
      );
      await user.click(
        within(sheet).getByRole('button', { name: 'One day fewer' }),
      );
      expect(within(sheet).getByText('1 day')).toBeVisible();
      expect(
        within(sheet).getByRole('button', { name: 'One day fewer' }),
      ).toBeDisabled();
    });

    it('Save sets the override, closes, and shows "{name}: {n} days"', async () => {
      const user = userEvent.setup();
      const { calls } = stubFamily([MILK]);
      renderFamily();
      await user.click(await rowOfAsync('Milk'));
      const sheet = await screen.findByRole('dialog', { name: 'Milk' });

      await user.click(within(sheet).getByRole('button', { name: '2 weeks' }));
      await user.click(within(sheet).getByRole('button', { name: 'Save' }));

      expect(await screen.findByText('Milk: 14 days')).toBeVisible();
      await waitFor(() =>
        expect(screen.queryByRole('dialog', { name: 'Milk' })).toBeNull(),
      );
      expect(calls.filter((call) => call.key.startsWith('PUT'))).toEqual([
        expect.objectContaining({
          key: 'PUT /api/settings/family/expiry-overrides/l-milk',
          body: { days: 14 },
        }),
      ]);
    });

    it('a save error keeps the sheet open with the error above the footer', async () => {
      const user = userEvent.setup();
      stubFamily([MILK], {
        put: () =>
          Response.json({ code: 'unknown', params: {} }, { status: 500 }),
      });
      renderFamily();
      await user.click(await rowOfAsync('Milk'));
      const sheet = await screen.findByRole('dialog', { name: 'Milk' });

      await user.click(within(sheet).getByRole('button', { name: 'Save' }));

      const alert = await within(sheet).findByRole('alert');
      expect(alert).toHaveTextContent(
        'Something went wrong. Please try again.',
      );
      expect(within(sheet).getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('"Use Catalog default" removes the override the same way as the row close button', async () => {
      const user = userEvent.setup();
      const { calls } = stubFamily([MILK]);
      renderFamily();
      await user.click(await rowOfAsync('Milk'));
      const sheet = await screen.findByRole('dialog', { name: 'Milk' });

      await user.click(
        within(sheet).getByRole('button', { name: 'Use Catalog default' }),
      );

      expect(screen.getByText('Milk uses the Catalog default')).toBeVisible();
      await waitFor(() =>
        expect(screen.queryByRole('dialog', { name: 'Milk' })).toBeNull(),
      );
      expect(screen.queryByRole('button', { name: /^Milk\b/ })).toBeNull();
      expect(writes(calls)).toEqual([]);
    });

    it('closes on Escape', async () => {
      const user = userEvent.setup();
      stubFamily([MILK]);
      renderFamily();
      await user.click(await rowOfAsync('Milk'));
      const sheet = await screen.findByRole('dialog', { name: 'Milk' });

      await user.keyboard('{Escape}');

      await waitFor(() => expect(sheet).not.toBeInTheDocument());
    });

    it('returns focus to the row it was opened from when it closes', async () => {
      const user = userEvent.setup();
      stubFamily([MILK]);
      renderFamily();
      const row = await rowOfAsync('Milk');
      await user.click(row);
      const sheet = await screen.findByRole('dialog', { name: 'Milk' });

      await user.keyboard('{Escape}');

      await waitFor(() => expect(sheet).not.toBeInTheDocument());
      await waitFor(() => expect(rowOf('Milk')).toHaveFocus());
    });

    it('moves focus to the search field on open', async () => {
      const user = userEvent.setup();
      stubFamily([]);
      renderFamily();
      await user.click(
        await screen.findByRole('button', { name: 'Set a category' }),
      );

      await waitFor(() =>
        expect(
          screen.getByRole('textbox', { name: 'Search categories' }),
        ).toHaveFocus(),
      );
    });
  });
});

/** The row for a name, once the list has loaded. */
async function rowOfAsync(name: string) {
  await screen.findByRole('list', { name: 'Default expiry' });
  return rowOf(name);
}
