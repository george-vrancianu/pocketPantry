import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Template } from '../../../lib/shoppingTemplates';
import { renderWithProviders, stubApi } from '../../../test/render';
import { TemplateActions } from './TemplateActions';
import { TemplateEditorPage } from './TemplateEditorPage';
import { TemplatesPage } from './TemplatesPage';

const dairy = { id: 'a4', name: 'Dairy & eggs', sortOrder: 4 };
const milk = {
  id: 'l1',
  ingredientId: 'milk-id',
  name: 'Milk',
  quantity: 1,
  unit: 'l' as const,
  unmatched: false,
  inPantry: false,
  aisle: dairy,
};
const taco: Template = { id: 't1', name: 'Taco night', lines: [milk] };

describe('Shopping Template screens', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('applies a chosen template from the Shopping List', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-templates': () =>
        Response.json({
          templates: [{ id: 't1', name: 'Taco night', lineCount: 1 }],
        }),
      'GET /api/shopping-templates/t1': () => Response.json(taco),
      'POST /api/shopping-list/items/bulk': () => Response.json({}),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(<TemplateActions />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Add from template' }));
    await user.click(await screen.findByRole('button', { name: 'Taco night' }));
    await user.click(
      await screen.findByRole('button', { name: 'Add 1 item to list' }),
    );

    await screen.findByRole('button', { name: 'Add from template' });
    expect(
      calls.find((c) => c.key === 'POST /api/shopping-list/items/bulk')?.body,
    ).toEqual({ items: [{ ingredientId: 'milk-id', quantity: 1, unit: 'l' }] });
  });

  it('saves the current list as a template and opens it', async () => {
    const { fetchMock, calls } = stubApi({
      'POST /api/shopping-templates/from-list': () =>
        Response.json(taco, { status: 201 }),
      'GET /api/shopping-templates': () => Response.json({ templates: [] }),
      'GET /api/shopping-templates/t1': () => Response.json(taco),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <Routes>
        <Route path="/" element={<TemplateActions />} />
        <Route
          path="/shopping/templates/:id"
          element={<TemplateEditorPage />}
        />
      </Routes>,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Save as template' }));
    await user.type(screen.getByLabelText('Template name'), 'Taco night');
    await user.click(screen.getByRole('button', { name: 'Save template' }));

    expect(await screen.findByLabelText('Name')).toHaveValue('Taco night');
    expect(
      calls.find((c) => c.key === 'POST /api/shopping-templates/from-list')
        ?.body,
    ).toEqual({ name: 'Taco night' });
  });

  it('lists templates and creates a new one', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-templates': () =>
        Response.json({
          templates: [{ id: 't1', name: 'Taco night', lineCount: 1 }],
        }),
      'POST /api/shopping-templates': () =>
        Response.json({ id: 't2', name: 'Weekly', lines: [] }, { status: 201 }),
      'GET /api/shopping-templates/t2': () =>
        Response.json({ id: 't2', name: 'Weekly', lines: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <Routes>
        <Route path="/" element={<TemplatesPage />} />
        <Route
          path="/shopping/templates/:id"
          element={<TemplateEditorPage />}
        />
      </Routes>,
    );
    const user = userEvent.setup();

    expect(await screen.findByText('1 line')).toBeVisible();
    await user.type(screen.getByLabelText('New template name'), 'Weekly');
    await user.click(screen.getByRole('button', { name: 'Create template' }));

    expect(await screen.findByLabelText('Name')).toHaveValue('Weekly');
    expect(
      calls.find((c) => c.key === 'POST /api/shopping-templates')?.body,
    ).toEqual({ name: 'Weekly' });
  });

  it('removes a line by replacing the lines, and renames', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-templates/t1': () => Response.json(taco),
      'PATCH /api/shopping-templates/t1': () =>
        Response.json({ ...taco, lines: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <Routes>
        <Route path="/:id" element={<TemplateEditorPage />} />
      </Routes>,
      { route: '/t1' },
    );
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Remove Milk' }),
    );
    await vi.waitFor(() =>
      expect(
        calls.some((c) => c.key === 'PATCH /api/shopping-templates/t1'),
      ).toBe(true),
    );
    expect(
      calls.find((c) => c.key === 'PATCH /api/shopping-templates/t1')?.body,
    ).toEqual({ lines: [] });

    const name = screen.getByLabelText('Name');
    await user.clear(name);
    await user.type(name, 'Burrito night');
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    await vi.waitFor(() =>
      expect(
        calls.filter((c) => c.key === 'PATCH /api/shopping-templates/t1'),
      ).toHaveLength(2),
    );
    expect(
      calls.filter((c) => c.key === 'PATCH /api/shopping-templates/t1')[1].body,
    ).toEqual({ name: 'Burrito night' });
  });

  it('deletes a template after confirming', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-templates/t1': () => Response.json(taco),
      'DELETE /api/shopping-templates/t1': () =>
        new Response(null, { status: 204 }),
      'GET /api/shopping-templates': () => Response.json({ templates: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <Routes>
        <Route path="/shopping/templates" element={<TemplatesPage />} />
        <Route
          path="/shopping/templates/:id"
          element={<TemplateEditorPage />}
        />
      </Routes>,
      { route: '/shopping/templates/t1' },
    );
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Delete template' }),
    );
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(await screen.findByLabelText('New template name')).toBeVisible();
    expect(calls.map((c) => c.key)).toContain(
      'DELETE /api/shopping-templates/t1',
    );
  });
});
