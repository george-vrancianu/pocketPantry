import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminCatalogTag, AdminTagGroup } from '../../../lib/admin';
import { renderWithProviders, stubApi } from '../../../test/render';
import { CatalogTagEditor } from './CatalogTagEditor';

const groups: AdminTagGroup[] = [
  { id: 'g1', name: 'Diet', position: 1, translations: [] },
  {
    id: 'g2',
    name: 'Cuisine',
    position: 2,
    translations: [
      { id: 'gt', locale: 'ro', kind: 'name', value: 'Bucătărie' },
    ],
  },
];
const vegan: AdminCatalogTag = {
  id: 't1',
  name: 'Vegan',
  groupId: 'g1',
  recipeCount: 4,
  translations: [],
};

describe('CatalogTagEditor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates a Catalog Tag in a chosen Tag Group', async () => {
    const { fetchMock, calls } = stubApi({
      'POST /api/admin/catalog/tags': () =>
        Response.json({ id: 'new' }, { status: 201 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const onDone = vi.fn();
    renderWithProviders(<CatalogTagEditor groups={groups} onDone={onDone} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Name \(English\)/), ' Thai ');
    await user.selectOptions(screen.getByLabelText('Tag Group'), 'Cuisine');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      key: 'POST /api/admin/catalog/tags',
      body: { name: 'Thai', groupId: 'g2' },
    });
  });

  it('renames and moves a Catalog Tag', async () => {
    const { fetchMock, calls } = stubApi({
      'PATCH /api/admin/catalog/tags/t1': () => Response.json({ id: 't1' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <CatalogTagEditor tag={vegan} groups={groups} onDone={vi.fn()} />,
    );
    const user = userEvent.setup();

    const name = screen.getByLabelText(/Name \(English\)/);
    await user.clear(name);
    await user.type(name, 'Plant based');
    await user.selectOptions(screen.getByLabelText('Tag Group'), 'Cuisine');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await vi.waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0]).toMatchObject({
      key: 'PATCH /api/admin/catalog/tags/t1',
      body: { name: 'Plant based', groupId: 'g2' },
    });
  });

  it('translates a Catalog Tag into every catalog language', async () => {
    const { fetchMock, calls } = stubApi({
      'POST /api/admin/catalog/translations': () =>
        Response.json({}, { status: 201 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <CatalogTagEditor tag={vegan} groups={groups} onDone={vi.fn()} />,
    );
    const user = userEvent.setup();

    expect(screen.queryByText(/Synonym/)).toBeNull();
    await user.type(screen.getByLabelText('Name (Romanian)'), 'Vegan');
    await user.click(
      screen.getByRole('button', { name: 'Save Romanian name' }),
    );
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toEqual({
      entityType: 'tag',
      entityId: 't1',
      locale: 'ro',
      kind: 'name',
      value: 'Vegan',
    });
  });

  it('asks before deleting a Tag in use, with the server count, then confirms', async () => {
    let attempts = 0;
    const { fetchMock, calls } = stubApi({
      'DELETE /api/admin/catalog/tags/t1': () =>
        ++attempts === 1
          ? Response.json(
              { code: 'catalog.tag_in_use', params: { count: 7 } },
              { status: 409 },
            )
          : new Response(null, { status: 204 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const onDone = vi.fn();
    renderWithProviders(
      <CatalogTagEditor tag={vegan} groups={groups} onDone={onDone} />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(
      await screen.findByText(
        '7 Recipes have this Tag and will lose it. Delete it anyway?',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Confirm the delete to remove it/)).toBeNull();
    expect(calls).toHaveLength(1);
    expect(calls[0].search).toBe('');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(calls[1]).toMatchObject({
      key: 'DELETE /api/admin/catalog/tags/t1',
      search: '?confirm=true',
    });
  });

  it('deletes a Tag no Recipe carries without asking', async () => {
    const { fetchMock, calls } = stubApi({
      'DELETE /api/admin/catalog/tags/t1': () =>
        new Response(null, { status: 204 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const onDone = vi.fn();
    renderWithProviders(
      <CatalogTagEditor tag={vegan} groups={groups} onDone={onDone} />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(calls).toHaveLength(1);
    expect(calls[0].search).toBe('');
  });

  it('shows the translated error for an allergen-free name', async () => {
    const { fetchMock } = stubApi({
      'POST /api/admin/catalog/tags': () =>
        Response.json(
          { code: 'catalog.tag_allergen_free_name', params: {} },
          { status: 400 },
        ),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<CatalogTagEditor groups={groups} onDone={vi.fn()} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Name \(English\)/), 'Gluten free');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /cannot claim an Allergen is absent/,
    );
  });
});
