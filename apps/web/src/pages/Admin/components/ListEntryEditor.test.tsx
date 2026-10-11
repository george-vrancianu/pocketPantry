import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminListEntry } from '../../../lib/admin';
import { renderWithProviders, stubApi } from '../../../test/render';
import { ListEntryEditor } from './ListEntryEditor';

const italian: AdminListEntry = {
  id: 'c1',
  name: 'Italian',
  translations: [{ id: 't1', locale: 'ro', kind: 'name', value: 'Italiană' }],
};

describe('ListEntryEditor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates a Cuisine by name', async () => {
    const { fetchMock, calls } = stubApi({
      'POST /api/admin/catalog/cuisines': () =>
        Response.json({ id: 'new' }, { status: 201 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const onDone = vi.fn();
    renderWithProviders(<ListEntryEditor kind="cuisine" onDone={onDone} />);
    const user = userEvent.setup();

    expect(screen.getByRole('heading', { name: 'New Cuisine' })).toHaveFocus();
    await user.type(screen.getByLabelText(/Name \(English\)/), ' Thai ');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(calls[0]).toMatchObject({
      key: 'POST /api/admin/catalog/cuisines',
      body: { name: 'Thai' },
    });
  });

  it('translates a Method like an Aisle, without Synonyms', async () => {
    const { fetchMock, calls } = stubApi({
      'POST /api/admin/catalog/translations': () =>
        Response.json({}, { status: 201 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <ListEntryEditor
        kind="method"
        entry={{ id: 'm1', name: 'Baking', translations: [] }}
        onDone={vi.fn()}
      />,
    );
    const user = userEvent.setup();

    expect(screen.queryByText(/Synonym/)).toBeNull();
    await user.type(screen.getByLabelText('Name (Danish)'), 'Bagning');
    await user.click(screen.getByRole('button', { name: 'Save Danish name' }));
    await vi.waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].body).toEqual({
      entityType: 'method',
      entityId: 'm1',
      locale: 'da',
      kind: 'name',
      value: 'Bagning',
    });
  });

  it('explains why a Cuisine in use cannot be deleted', async () => {
    vi.stubGlobal(
      'fetch',
      stubApi({
        'DELETE /api/admin/catalog/cuisines/c1': () =>
          Response.json(
            { code: 'catalog.cuisine_in_use', params: {} },
            { status: 409 },
          ),
      }).fetchMock,
    );
    const onDone = vi.fn();
    renderWithProviders(
      <ListEntryEditor kind="cuisine" entry={italian} onDone={onDone} />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Recipes still use this Cuisine/,
    );
    expect(onDone).not.toHaveBeenCalled();
  });
});
