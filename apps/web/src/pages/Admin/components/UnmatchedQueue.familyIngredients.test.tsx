import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminCatalog } from '../../../lib/admin';
import { renderWithProviders, stubApi } from '../../../test/render';
import { UnmatchedQueue } from './UnmatchedQueue';

// Contract: see /home/giu/projects/notes-263/contract-275.md. The Family
// Ingredients queue sits in the Unmatched tab, behind a "Family ingredients"
// switch next to "Unmatched names".
const catalog: AdminCatalog = {
  aisles: [],
  cuisines: [],
  methods: [],
  eatingMoments: [],
  parentCategories: [],
  leafCategories: [],
  ingredients: [],
};

const leaf = { id: 'l1', name: 'Hard cheese' };
const group = {
  normalizedName: 'kombucha',
  name: 'Kombucha',
  leafCategory: leaf,
  familyCount: 3,
  locale: 'ro',
  copies: [
    {
      id: 'c1',
      name: 'Kombucha',
      locale: 'ro',
      defaultUnit: 'ml',
      leafCategory: leaf,
    },
    {
      id: 'c2',
      name: 'KOMBUCHA',
      locale: 'en',
      defaultUnit: 'ml',
      leafCategory: { id: 'l2', name: 'Other' },
    },
    {
      id: 'c3',
      name: 'kombucha',
      locale: 'da',
      defaultUnit: 'ml',
      leafCategory: leaf,
    },
  ],
};
const single = {
  normalizedName: 'tempeh',
  name: 'Tempeh',
  leafCategory: { id: 'l3', name: 'Pulses' },
  familyCount: 1,
  locale: 'da',
  copies: [
    {
      id: 'c4',
      name: 'Tempeh',
      locale: 'da',
      defaultUnit: 'g',
      leafCategory: { id: 'l3', name: 'Pulses' },
    },
  ],
};

function stub(routes: Parameters<typeof stubApi>[0] = {}) {
  const api = stubApi({
    'GET /api/admin/unmatched': () =>
      Response.json({ entries: [], nextCursor: null }),
    'GET /api/admin/family-ingredients': () =>
      Response.json({ groups: [group, single], nextCursor: null }),
    ...routes,
  });
  vi.stubGlobal('fetch', api.fetchMock);
  return api.calls;
}

async function openQueue(user: ReturnType<typeof userEvent.setup>) {
  renderWithProviders(<UnmatchedQueue catalog={catalog} />);
  await user.click(
    await screen.findByRole('button', { name: 'Family ingredients' }),
  );
}

describe('UnmatchedQueue: Family ingredients', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists each group with its name, Leaf Category, Family count and typed locale, in the order served', async () => {
    stub();
    await openQueue(userEvent.setup());

    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Kombucha')).toBeVisible();
    expect(within(items[0]).getByText(/3 families/)).toBeVisible();
    expect(within(items[0]).getByText(/Hard cheese/)).toBeVisible();
    expect(within(items[0]).getByText(/Romanian/)).toBeVisible();
    expect(within(items[1]).getByText('Tempeh')).toBeVisible();
    expect(within(items[1]).getByText(/1 family/)).toBeVisible();
    expect(within(items[1]).getByText(/Pulses/)).toBeVisible();
    expect(within(items[1]).getByText(/Danish/)).toBeVisible();
    // The open/dismissed switch belongs to Unmatched names only.
    expect(screen.queryByRole('button', { name: 'Dismissed' })).toBeNull();
  });

  it('does not ask for Family Ingredients until the switch is used', async () => {
    const calls = stub();
    renderWithProviders(<UnmatchedQueue catalog={catalog} />);
    await screen.findByText('Nothing to review.');

    expect(calls.map((c) => c.key)).not.toContain(
      'GET /api/admin/family-ingredients',
    );
  });

  it('shows an empty state', async () => {
    stub({
      'GET /api/admin/family-ingredients': () =>
        Response.json({ groups: [], nextCursor: null }),
    });
    await openQueue(userEvent.setup());

    expect(
      await screen.findByText('No Family ingredients to review.'),
    ).toBeVisible();
  });

  it('opens a picker of the copies for a group, the first one chosen, each with its Leaf Category and locale', async () => {
    stub();
    const user = userEvent.setup();
    await openQueue(user);

    await user.click(
      await screen.findByRole('button', { name: 'Promote Kombucha' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Promote Kombucha' }),
    ).toHaveFocus();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios[0]).toBeChecked();
    expect(radios[1]).toHaveAccessibleName(/KOMBUCHA.*Other.*English/);
    expect(radios[2]).toHaveAccessibleName(/kombucha.*Hard cheese.*Danish/);
    expect(screen.getByText(/merged into it/i)).toBeVisible();
  });

  it('promotes the chosen copy, announces the result and drops the group from the queue', async () => {
    let promoted = false;
    const calls = stub({
      'GET /api/admin/family-ingredients': () =>
        Response.json({
          groups: promoted ? [single] : [group, single],
          nextCursor: null,
        }),
      'POST /api/admin/family-ingredients/promote': () => {
        promoted = true;
        return Response.json({
          ingredientId: 'c2',
          name: 'KOMBUCHA',
          mergedIngredientIds: ['c1', 'c3'],
        });
      },
    });
    const user = userEvent.setup();
    await openQueue(user);

    await user.click(
      await screen.findByRole('button', { name: 'Promote Kombucha' }),
    );
    await user.click(screen.getAllByRole('radio')[1]);
    await user.click(screen.getByRole('button', { name: 'Promote' }));

    await vi.waitFor(() =>
      expect(
        calls.find(
          (c) => c.key === 'POST /api/admin/family-ingredients/promote',
        )?.body,
      ).toEqual({ ingredientId: 'c2' }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent(
      /Promoted KOMBUCHA/,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      /merged 2 other copies/i,
    );
    expect(await screen.findByText('Tempeh')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Promote Kombucha' }),
    ).toBeNull();
  });

  it('promotes the first copy when the Admin does not choose', async () => {
    const calls = stub({
      'POST /api/admin/family-ingredients/promote': () =>
        Response.json({
          ingredientId: 'c4',
          name: 'Tempeh',
          mergedIngredientIds: [],
        }),
    });
    const user = userEvent.setup();
    await openQueue(user);

    await user.click(
      await screen.findByRole('button', { name: 'Promote Tempeh' }),
    );
    await user.click(screen.getByRole('button', { name: 'Promote' }));

    await vi.waitFor(() =>
      expect(
        calls.find(
          (c) => c.key === 'POST /api/admin/family-ingredients/promote',
        )?.body,
      ).toEqual({ ingredientId: 'c4' }),
    );
  });

  it('goes back to the list on Cancel without promoting anything', async () => {
    const calls = stub();
    const user = userEvent.setup();
    await openQueue(user);

    await user.click(
      await screen.findByRole('button', { name: 'Promote Kombucha' }),
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(
      await screen.findByRole('button', { name: 'Promote Kombucha' }),
    ).toHaveFocus();
    expect(calls.map((c) => c.key)).not.toContain(
      'POST /api/admin/family-ingredients/promote',
    );
  });

  it('explains a rejected promote, keeps the picker open and points to merging', async () => {
    stub({
      'POST /api/admin/family-ingredients/promote': () =>
        Response.json(
          {
            code: 'family_ingredients.shared_name_exists',
            params: { ingredientId: 'shared-1' },
          },
          { status: 409 },
        ),
    });
    const user = userEvent.setup();
    await openQueue(user);

    await user.click(
      await screen.findByRole('button', { name: 'Promote Kombucha' }),
    );
    await user.click(screen.getByRole('button', { name: 'Promote' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /shared ingredient with that name already exists.*merge/i,
    );
    expect(
      screen.getByRole('heading', { name: 'Promote Kombucha' }),
    ).toBeVisible();
  });
});
