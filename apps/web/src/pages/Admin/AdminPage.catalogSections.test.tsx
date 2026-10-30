import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { AdminSectionPage } from './AdminSectionPage';

const catalog = {
  aisles: [{ id: 'a1', name: 'Dairy', sortOrder: 1, translations: [] }],
  tagGroups: [],
  tags: [],
  allergens: [
    {
      id: 'al1',
      name: 'Milk',
      sortOrder: 1,
      archived: false,
      translations: [],
    },
    { id: 'al2', name: 'Soy', sortOrder: 2, archived: false, translations: [] },
  ],
  eatingMoments: [],
  parentCategories: [
    {
      id: 'p1',
      name: 'Dairy & eggs',
      aisleId: 'a1',
      defaultExpiryDays: 7,
      defaultLocation: 'fridge',
      translations: [],
    },
  ],
  leafCategories: [
    {
      id: 'l1',
      name: 'Butter',
      parentId: 'p1',
      isOther: false,
      defaultExpiryDays: 5,
      defaultLocation: 'fridge',
      translations: [],
    },
    {
      id: 'l2',
      name: 'Milks',
      parentId: 'p1',
      isOther: false,
      defaultExpiryDays: null,
      defaultLocation: null,
      translations: [],
    },
  ],
  ingredients: [
    {
      id: 'i1',
      name: 'Butter',
      leafCategoryId: 'l1',
      defaultUnit: 'g',
      pantryBasic: false,
      allergenIds: ['al1'],
      allergensReviewPending: false,
      translations: [],
    },
    {
      id: 'i2',
      name: 'Tofu',
      leafCategoryId: 'l2',
      defaultUnit: 'g',
      pantryBasic: false,
      allergenIds: [],
      allergensReviewPending: true,
      translations: [],
    },
  ],
};

function renderSection(section: string) {
  vi.stubGlobal(
    'fetch',
    stubApi({ 'GET /api/admin/catalog': () => Response.json(catalog) })
      .fetchMock,
  );
  renderWithProviders(
    <Routes>
      <Route path="admin/:section" element={<AdminSectionPage />} />
    </Routes>,
    { route: `/admin/${section}` },
  );
}

describe('Catalog section pages', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows Ingredient rows with leaf, aisle, first allergen or Unchecked, and unit', async () => {
    renderSection('ingredients');
    const butter = (
      await screen.findByRole('button', { name: 'Edit Butter' })
    ).closest('li') as HTMLElement;
    expect(butter).toHaveTextContent('Butter · Dairy');
    expect(within(butter).getByText('Milk')).toBeInTheDocument();
    expect(within(butter).getByText('g')).toBeInTheDocument();
    const tofu = screen
      .getByRole('button', { name: 'Edit Tofu' })
      .closest('li') as HTMLElement;
    expect(within(tofu).getByText('Unchecked')).toBeInTheDocument();
  });

  it('filters Ingredients with the search field', async () => {
    renderSection('ingredients');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Filter Ingredients'), 'tof');
    expect(screen.queryByRole('button', { name: 'Edit Butter' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Edit Tofu' })).toBeVisible();
  });

  it('shows every Category expanded, with expiry and location or the parent defaults', async () => {
    renderSection('categories');
    await screen.findByRole('button', {
      name: 'Edit Parent Category Dairy & eggs',
    });
    expect(
      screen.queryByRole('button', { name: /Show|Hide|expand/i }),
    ).toBeNull();
    const butter = screen
      .getByRole('button', { name: 'Edit Leaf Category Butter' })
      .closest('li') as HTMLElement;
    expect(butter).toHaveTextContent('Expires in 5 d · Fridge');
    const milks = screen
      .getByRole('button', { name: 'Edit Leaf Category Milks' })
      .closest('li') as HTMLElement;
    expect(milks).toHaveTextContent('Uses Dairy & eggs’s defaults');
  });

  it('opens an editor as a sheet and returns focus to the row on Cancel', async () => {
    renderSection('aisles');
    const user = userEvent.setup();
    const row = await screen.findByRole('button', { name: 'Edit Aisle Dairy' });
    await user.click(row);
    const sheet = await screen.findByRole('dialog', {
      name: 'Edit Aisle Dairy',
    });
    expect(
      within(sheet).getByRole('textbox', { name: 'Name (English)' }),
    ).toBeVisible();
    await user.click(within(sheet).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Edit Aisle Dairy' }),
      ).toHaveFocus(),
    );
  });
});
