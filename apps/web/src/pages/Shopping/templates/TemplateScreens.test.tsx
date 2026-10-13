import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Template } from '../../../lib/shoppingTemplates';
import { renderWithProviders, stubApi } from '../../../test/render';
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

  it('lists templates and creates a new one', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-templates': () =>
        Response.json({
          templates: [
            {
              id: 't1',
              name: 'Taco night',
              lineCount: 1,
              previewNames: ['Milk'],
            },
          ],
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

  it('disables the remove buttons while an edit is saving', async () => {
    const eggs = { ...milk, id: 'l2', ingredientId: 'eggs-id', name: 'Eggs' };
    const two: Template = { ...taco, lines: [milk, eggs] };
    let finish: () => void = () => undefined;
    const saved = new Promise<void>((resolve) => (finish = resolve));
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-templates/t1': () => Response.json(two),
      'PATCH /api/shopping-templates/t1': () =>
        Response.json({ ...two, lines: [eggs] }),
    });
    // Hold the save open so the in-flight state can be observed.
    vi.stubGlobal('fetch', async (...args: Parameters<typeof fetch>) => {
      const response = fetchMock(...args);
      if (args[1]?.method === 'PATCH') await saved;
      return response;
    });
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
        screen.getByRole('button', { name: 'Remove Eggs' }),
      ).toBeDisabled(),
    );
    finish();
    await vi.waitFor(() =>
      expect(screen.getByRole('button', { name: 'Remove Eggs' })).toBeEnabled(),
    );
    expect(
      calls.filter((c) => c.key === 'PATCH /api/shopping-templates/t1'),
    ).toHaveLength(1);
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
