import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FamilyCatalogIngredient } from '../../lib/familyCatalog';
import { renderWithProviders, stubApi } from '../../test/render';
import { FamilyCatalogSection } from './components/FamilyCatalogSection';

// Spec: #360 / #350, ADR 0014.
const ingredient = (
  id: string,
  name: string,
  allergen: { allergensChecked: boolean; allergenIds: string[] },
): FamilyCatalogIngredient => ({
  id,
  name,
  owner: 'family',
  defaultUnit: 'g',
  amountScale: 'medium',
  leafCategory: { id: 'l', name: 'Ground spices' },
  parentCategory: {
    id: 'p',
    name: 'Spices',
    aisle: { id: 'a', name: 'Oils & spices' },
  },
  defaults: { expiryDays: null, location: null },
  usage: {
    batches: 0,
    shoppingItems: 0,
    templateLines: 0,
    recipeLines: 2,
    staples: 0,
  },
  ...allergen,
});

function stub(ingredients: FamilyCatalogIngredient[]) {
  const { fetchMock, calls } = stubApi({
    'GET /api/catalog/family': () =>
      Response.json({ ingredients, synonyms: [] }),
    'GET /api/catalog/allergens': () =>
      Response.json({
        allergens: [
          { id: 'al-milk', name: 'Milk' },
          { id: 'al-peanuts', name: 'Peanuts' },
        ],
      }),
    'PUT /api/catalog/family-ingredients/kombucha/allergens': () =>
      Response.json({
        id: 'kombucha',
        allergensChecked: true,
        allergenIds: ['al-peanuts'],
      }),
    'PUT /api/catalog/family-ingredients/nutella/allergens': () =>
      Response.json({
        id: 'nutella',
        allergensChecked: true,
        allergenIds: [],
      }),
  });
  vi.stubGlobal('fetch', fetchMock);
  return calls;
}

const kombucha = ingredient('kombucha', 'Kombucha', {
  allergensChecked: false,
  allergenIds: [],
});
const nutella = ingredient('nutella', 'Nutella', {
  allergensChecked: true,
  allergenIds: ['al-milk'],
});
const rice = ingredient('rice', 'Rice', {
  allergensChecked: true,
  allergenIds: [],
});

describe('Family catalog: Allergens', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows each Ingredient as Unchecked, tagged or containing none, and counts the Unchecked ones', async () => {
    stub([kombucha, nutella, rice]);
    renderWithProviders(<FamilyCatalogSection />);

    const item = async (name: string) =>
      (await screen.findByText(name)).closest('li') as HTMLElement;
    expect(await item('Kombucha')).toHaveTextContent(
      'Not checked for allergens',
    );
    expect(await item('Nutella')).toHaveTextContent('Contains Milk');
    expect(await item('Rice')).toHaveTextContent('Contains none');
    expect(
      screen.getByText('1 ingredient is not checked for allergens.'),
    ).toBeVisible();
  });

  it('tags an Unchecked Ingredient and saves it', async () => {
    const calls = stub([kombucha]);
    renderWithProviders(<FamilyCatalogSection />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Tag allergens of Kombucha' }),
    );
    const save = screen.getByRole('button', { name: 'Save allergens' });
    // Blank is not a choice: nothing to save yet.
    expect(save).toBeDisabled();
    await user.click(await screen.findByRole('button', { name: 'Peanuts' }));
    await user.click(save);

    await waitFor(() =>
      expect(
        calls.find(
          (c) =>
            c.key === 'PUT /api/catalog/family-ingredients/kombucha/allergens',
        )?.body,
      ).toEqual({ allergenIds: ['al-peanuts'] }),
    );
  });

  it('re-tags a tagged Ingredient as containing none', async () => {
    const calls = stub([nutella]);
    renderWithProviders(<FamilyCatalogSection />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Tag allergens of Nutella' }),
    );
    expect(await screen.findByRole('button', { name: 'Milk' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'None' }));
    await user.click(screen.getByRole('button', { name: 'Save allergens' }));

    await waitFor(() =>
      expect(
        calls.find(
          (c) =>
            c.key === 'PUT /api/catalog/family-ingredients/nutella/allergens',
        )?.body,
      ).toEqual({ allergenIds: [] }),
    );
  });

  it('refreshes every Recipe screen after tagging', async () => {
    stub([kombucha]);
    const { queryClient } = renderWithProviders(<FamilyCatalogSection />);
    const user = userEvent.setup();
    const detailKey = ['recipes', 'detail', 'r1', 'en'];
    queryClient.setQueryData(detailKey, { id: 'r1' });

    await user.click(
      await screen.findByRole('button', { name: 'Tag allergens of Kombucha' }),
    );
    await user.click(await screen.findByRole('button', { name: 'Peanuts' }));
    await user.click(screen.getByRole('button', { name: 'Save allergens' }));

    await waitFor(() =>
      expect(queryClient.getQueryState(detailKey)?.isInvalidated).toBe(true),
    );
  });
});
