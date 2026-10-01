import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminCatalog } from '../../../lib/admin';
import { renderWithProviders, stubApi } from '../../../test/render';
import { CategoryEditor } from './CategoryEditor';

const catalog: AdminCatalog = {
  aisles: [{ id: 'a1', name: 'Dairy & eggs', sortOrder: 1, translations: [] }],
  parentCategories: [],
  leafCategories: [],
  ingredients: [],
};

describe('CategoryEditor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('refuses a non-whole Default Expiry instead of silently clearing it', async () => {
    const { fetchMock, calls } = stubApi({
      'POST /api/admin/catalog/parent-categories': () =>
        Response.json({}, { status: 201 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <CategoryEditor kind="parent" catalog={catalog} onDone={vi.fn()} />,
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Name \(English\)/), 'Sauces');
    await user.type(screen.getByLabelText('Default Expiry (days)'), '1.5');

    expect(screen.getByText(/whole number of days/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(calls).toEqual([]);

    await user.clear(screen.getByLabelText('Default Expiry (days)'));
    await user.type(screen.getByLabelText('Default Expiry (days)'), '14');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toEqual({
      name: 'Sauces',
      aisleId: 'a1',
      defaultExpiryDays: 14,
      defaultLocation: null,
    });
  });
});
