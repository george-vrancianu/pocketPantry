import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Template, TemplateLine } from '../../../lib/shoppingTemplates';
import { useSuggestions } from '../../../lib/suggestions';
import { renderWithProviders, stubApi } from '../../../test/render';
import { ApplyTemplatePicker } from './ApplyTemplatePicker';

const produce = { id: 'a1', name: 'Fruit & veg', sortOrder: 1 };
const dairy = { id: 'a4', name: 'Dairy & eggs', sortOrder: 4 };

const line = (
  overrides: Partial<TemplateLine> & { id: string; name: string },
): TemplateLine => ({
  ingredientId: `${overrides.id}-ing`,
  quantity: null,
  unit: null,
  unmatched: false,
  inPantry: false,
  aisle: dairy,
  ...overrides,
});

const template: Template = {
  id: 't1',
  name: 'Taco night',
  lines: [
    line({
      id: 'l1',
      name: 'Tomato',
      quantity: 250,
      unit: 'g',
      inPantry: true,
      aisle: produce,
    }),
    line({ id: 'l2', name: 'Milk', quantity: 1, unit: 'l' }),
    line({
      id: 'l3',
      name: 'Mystery spice',
      ingredientId: null,
      unmatched: true,
      aisle: null,
    }),
  ],
};

/** Keeps a Suggestions query mounted, as the Shopping List does. */
function SuggestionsProbe() {
  useSuggestions('en', '2026-10-11');
  return null;
}

function stub(onApply: () => Response = () => Response.json({})) {
  const { fetchMock, calls } = stubApi({
    'GET /api/shopping-list/suggestions': () => Response.json({ staples: [] }),
    'GET /api/shopping-templates/t1': () => Response.json(template),
    'POST /api/shopping-list/items/bulk': onApply,
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

describe('ApplyTemplatePicker', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('starts Pantry Ingredients unticked and missing or Unmatched lines ticked, grouped by Aisle', async () => {
    stub();
    renderWithProviders(
      <ApplyTemplatePicker
        templateId="t1"
        onDone={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole('checkbox', { name: /Tomato/ }),
    ).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Milk/ })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /Mystery spice/ }),
    ).toBeChecked();
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent),
    ).toEqual(['Fruit & veg', 'Dairy & eggs', 'Not in the catalog']);
    expect(
      screen.getByRole('button', { name: 'Add 2 items to list' }),
    ).toBeEnabled();
  });

  it('adds only the ticked lines through the bulk endpoint, then finishes', async () => {
    const calls = stub();
    const onDone = vi.fn();
    renderWithProviders(
      <ApplyTemplatePicker
        templateId="t1"
        onDone={onDone}
        onCancel={vi.fn()}
      />,
    );
    const user = userEvent.setup();

    await user.click(await screen.findByRole('checkbox', { name: /Tomato/ }));
    await user.click(screen.getByRole('checkbox', { name: /Milk/ }));
    await user.click(
      screen.getByRole('button', { name: 'Add 2 items to list' }),
    );

    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(
      calls.find((c) => c.key === 'POST /api/shopping-list/items/bulk')?.body,
    ).toEqual({
      items: [
        { ingredientId: 'l1-ing', quantity: 250, unit: 'g' },
        { name: 'Mystery spice' },
      ],
    });
  });

  it('refreshes the Suggestions after adding', async () => {
    const calls = stub();
    renderWithProviders(
      <>
        <SuggestionsProbe />
        <ApplyTemplatePicker
          templateId="t1"
          onDone={vi.fn()}
          onCancel={vi.fn()}
        />
      </>,
    );
    const suggestionFetches = () =>
      calls.filter((c) => c.key === 'GET /api/shopping-list/suggestions')
        .length;
    await vi.waitFor(() => expect(suggestionFetches()).toBe(1));

    await userEvent.click(
      await screen.findByRole('button', { name: /^Add \d+ items? to list$/ }),
    );

    await vi.waitFor(() => expect(suggestionFetches()).toBe(2));
  });

  it('disables adding when nothing is ticked', async () => {
    stub();
    renderWithProviders(
      <ApplyTemplatePicker
        templateId="t1"
        onDone={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const user = userEvent.setup();

    await user.click(await screen.findByRole('checkbox', { name: /Milk/ }));
    await user.click(screen.getByRole('checkbox', { name: /Mystery spice/ }));

    expect(
      screen.getByRole('button', { name: 'Add 0 items to list' }),
    ).toBeDisabled();
  });

  it('shows a coded error and stays open when adding fails', async () => {
    stub(() =>
      Response.json(
        { code: 'shopping.quantity_too_large', params: {} },
        { status: 400 },
      ),
    );
    const onDone = vi.fn();
    renderWithProviders(
      <ApplyTemplatePicker
        templateId="t1"
        onDone={onDone}
        onCancel={vi.fn()}
      />,
    );

    await userEvent.click(
      await screen.findByRole('button', { name: 'Add 2 items to list' }),
    );

    expect(await screen.findByText(/above 1,000,000/)).toBeVisible();
    expect(onDone).not.toHaveBeenCalled();
  });
});
