import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Unit } from '../../../lib/catalog';
import type { Template, TemplateLine } from '../../../lib/shoppingTemplates';
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

  /** A Template that keeps what is PATCHed, as the API does (a line is matched back by its Ingredient). */
  function statefulTemplate(initial: TemplateLine[]) {
    const catalog = new Map(initial.map((l) => [l.ingredientId, l]));
    let lines = initial;
    let seq = 0;
    const fail = { next: false };
    const stub = stubApi({
      'GET /api/shopping-templates/t1': () => Response.json({ ...taco, lines }),
      'PATCH /api/shopping-templates/t1': () => {
        if (fail.next) {
          fail.next = false;
          return Response.json(
            { code: 'unknown', params: {} },
            { status: 500 },
          );
        }
        const body = stub.calls.at(-1)?.body as {
          lines?: Array<{
            ingredientId: string;
            quantity?: number;
            unit?: Unit;
          }>;
        };
        if (body.lines) {
          lines = body.lines.map((l) => ({
            ...catalog.get(l.ingredientId)!,
            id: `n${++seq}`,
            quantity: l.quantity ?? null,
            unit: l.unit ?? null,
          }));
        }
        return Response.json({ ...taco, lines });
      },
    });
    vi.stubGlobal('fetch', stub.fetchMock);
    return { ...stub, fail };
  }
  const patches = (calls: Array<{ key: string; body: unknown }>) =>
    calls
      .filter((c) => c.key === 'PATCH /api/shopping-templates/t1')
      .map((c) => c.body);
  const renderEditor = () =>
    renderWithProviders(
      <Routes>
        <Route path="/:id" element={<TemplateEditorPage />} />
      </Routes>,
      { route: '/t1' },
    );
  const eggs: TemplateLine = {
    ...milk,
    id: 'l2',
    ingredientId: 'eggs-id',
    name: 'Eggs',
    quantity: 6,
    unit: null,
  };
  const bread: TemplateLine = {
    ...milk,
    id: 'l3',
    ingredientId: 'bread-id',
    name: 'Bread',
    quantity: null,
    unit: null,
  };
  const removeLine = async (
    user: ReturnType<typeof userEvent.setup>,
    name: string,
  ) => {
    act(() => screen.getByRole('group', { name }).focus());
    await user.keyboard('{Delete}');
    await user.click(screen.getByRole('button', { name: 'Remove' }));
  };

  it('removes a line at once, with Undo that puts it back in its place', async () => {
    const { calls } = statefulTemplate([milk, eggs, bread]);
    renderEditor();
    const user = userEvent.setup();
    await screen.findByRole('group', { name: 'Eggs' });

    await removeLine(user, 'Eggs');

    expect(await screen.findByText('Removed Eggs')).toBeVisible();
    await waitFor(() =>
      expect(screen.queryByRole('group', { name: 'Eggs' })).toBeNull(),
    );
    expect(patches(calls)).toEqual([
      {
        lines: [
          { ingredientId: 'milk-id', quantity: 1, unit: 'l' },
          { ingredientId: 'bread-id' },
        ],
      },
    ]);

    await user.dblClick(screen.getByRole('button', { name: 'Undo' }));

    await waitFor(() => expect(patches(calls)).toHaveLength(2));
    expect(patches(calls)[1]).toEqual({
      lines: [
        { ingredientId: 'milk-id', quantity: 1, unit: 'l' },
        { ingredientId: 'eggs-id', quantity: 6 },
        { ingredientId: 'bread-id' },
      ],
    });
    const names = (await screen.findAllByRole('group')).map((g) =>
      g.getAttribute('aria-label'),
    );
    expect(names).toEqual(['Milk', 'Eggs', 'Bread']);
    expect(patches(calls)).toHaveLength(2);
  });

  it('makes the row usable again when the removal fails to save', async () => {
    const { calls, fail } = statefulTemplate([milk, eggs]);
    renderEditor();
    const user = userEvent.setup();
    await screen.findByRole('group', { name: 'Eggs' });

    fail.next = true;
    await removeLine(user, 'Eggs');

    expect(await screen.findByRole('alert')).toBeVisible();
    const row = await screen.findByRole('group', { name: 'Eggs' });
    expect(row).toBeVisible();
    expect(screen.queryByText('Removed Eggs')).toBeNull();
    await waitFor(() => expect(row).not.toHaveAttribute('inert'));
    act(() => row.focus());
    await user.keyboard('{Delete}');
    expect(screen.getByRole('button', { name: 'Keep' })).toBeVisible();
    expect(patches(calls)).toHaveLength(1);
  });

  it('shows no x button on the lines', async () => {
    statefulTemplate([milk]);
    renderEditor();

    await screen.findByRole('group', { name: 'Milk' });
    expect(screen.queryByRole('button', { name: 'Remove Milk' })).toBeNull();
  });

  it('renames', async () => {
    const { calls } = statefulTemplate([milk]);
    renderEditor();
    const user = userEvent.setup();

    const name = await screen.findByLabelText('Name');
    await user.clear(name);
    await user.type(name, 'Burrito night');
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    await waitFor(() => expect(patches(calls)).toHaveLength(1));
    expect(patches(calls)[0]).toEqual({ name: 'Burrito night' });
  });

  it('disables the rows while a save is in flight', async () => {
    const two = [milk, eggs];
    let finish: () => void = () => undefined;
    const saved = new Promise<void>((resolve) => (finish = resolve));
    const { fetchMock, calls } = stubApi({
      'GET /api/shopping-templates/t1': () =>
        Response.json({ ...taco, lines: two }),
      'PATCH /api/shopping-templates/t1': () =>
        Response.json({ ...taco, lines: [eggs] }),
    });
    // Hold the save open so the in-flight state can be observed.
    vi.stubGlobal('fetch', async (...args: Parameters<typeof fetch>) => {
      const response = fetchMock(...args);
      if (args[1]?.method === 'PATCH') await saved;
      return response;
    });
    renderEditor();
    const user = userEvent.setup();
    await screen.findByRole('group', { name: 'Milk' });

    await removeLine(user, 'Milk');
    const other = screen.getByRole('group', { name: 'Eggs' });
    await waitFor(() => expect(patches(calls)).toHaveLength(1));
    act(() => other.focus());
    await user.keyboard('{Delete}');
    expect(within(other).queryByRole('button', { name: 'Keep' })).toBeNull();

    finish();
    await screen.findByText('Removed Milk');
    act(() => other.focus());
    await user.keyboard('{Delete}');
    expect(within(other).getByRole('button', { name: 'Keep' })).toBeVisible();
    expect(patches(calls)).toHaveLength(1);
  });

  it('takes the Undo toast down when the editor is left, so it cannot overwrite newer lines', async () => {
    const { calls } = statefulTemplate([milk, eggs]);
    renderEditor();
    const user = userEvent.setup();
    await screen.findByRole('group', { name: 'Eggs' });

    await removeLine(user, 'Eggs');
    expect(await screen.findByText('Removed Eggs')).toBeVisible();
    await user.click(
      screen.getAllByRole('button', { name: 'Add to list' }).at(-1)!,
    );
    await user.click(await screen.findByRole('button', { name: 'Back' }));

    await screen.findByRole('group', { name: 'Milk' });
    await waitFor(() => expect(screen.queryByText('Removed Eggs')).toBeNull());
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
    expect(patches(calls)).toHaveLength(1);
  });

  it('lets a save in flight land before Undo puts the line back on top of it', async () => {
    const { fetchMock, calls } = statefulTemplate([milk, eggs, bread]);
    let release: () => void = () => undefined;
    let gate: Promise<void> | null = null;
    vi.stubGlobal('fetch', async (...args: Parameters<typeof fetch>) => {
      if (args[1]?.method === 'PATCH' && gate) await gate;
      return fetchMock(...args);
    });
    renderEditor();
    const user = userEvent.setup();
    await screen.findByRole('group', { name: 'Eggs' });
    await removeLine(user, 'Eggs');
    await screen.findByText('Removed Eggs');

    // A newer edit is on its way when Undo is pressed.
    gate = new Promise<void>((resolve) => (release = resolve));
    act(() => screen.getByRole('group', { name: 'Milk' }).focus());
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Edit Milk' });
    const field = within(dialog).getByLabelText(/^Amount of Milk/);
    await user.clear(field);
    await user.type(field, '2');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(patches(calls)).toHaveLength(1);

    gate = null;
    release();
    await waitFor(() => expect(patches(calls)).toHaveLength(3));
    expect(patches(calls)[1]).toEqual({
      lines: [
        { ingredientId: 'milk-id', quantity: 2, unit: 'l' },
        { ingredientId: 'bread-id' },
      ],
    });
    expect(patches(calls)[2]).toEqual({
      lines: [
        { ingredientId: 'milk-id', quantity: 2, unit: 'l' },
        { ingredientId: 'eggs-id', quantity: 6 },
        { ingredientId: 'bread-id' },
      ],
    });
  });

  it('moves focus to the empty text when the last line is removed', async () => {
    statefulTemplate([milk]);
    renderEditor();
    const user = userEvent.setup();
    await screen.findByRole('group', { name: 'Milk' });

    await removeLine(user, 'Milk');

    await waitFor(() =>
      expect(screen.getByText(/no lines yet/i)).toHaveFocus(),
    );
  });

  describe('editing the amount', () => {
    const openSheet = async (
      user: ReturnType<typeof userEvent.setup>,
      name = 'Milk',
    ) => {
      act(() => screen.getByRole('group', { name }).focus());
      await user.keyboard('{Enter}');
      return screen.findByRole('dialog', { name: `Edit ${name}` });
    };

    it('saves the lines with only that line changed', async () => {
      const { calls } = statefulTemplate([milk, eggs]);
      renderEditor();
      const user = userEvent.setup();
      await screen.findByRole('group', { name: 'Milk' });

      const dialog = await openSheet(user, 'Eggs');
      expect(within(dialog).getByText('from this template')).toBeVisible();
      const field = within(dialog).getByLabelText(/^Amount of Eggs/);
      expect(field).toHaveValue('6');
      await user.clear(field);
      await user.type(field, '12');
      await user.click(within(dialog).getByRole('button', { name: 'Save' }));

      expect(await screen.findByText('Updated Eggs')).toBeVisible();
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(patches(calls)).toEqual([
        {
          lines: [
            { ingredientId: 'milk-id', quantity: 1, unit: 'l' },
            { ingredientId: 'eggs-id', quantity: 12 },
          ],
        },
      ]);
      expect(screen.getByText('12')).toBeVisible();
    });

    it('opens the removal confirmation from "Remove line"', async () => {
      const { calls } = statefulTemplate([milk]);
      renderEditor();
      const user = userEvent.setup();
      await screen.findByRole('group', { name: 'Milk' });

      const dialog = await openSheet(user);
      await user.click(
        within(dialog).getByRole('button', { name: 'Remove line' }),
      );

      const keep = await screen.findByRole('button', { name: 'Keep' });
      await waitFor(() => expect(keep).toHaveFocus());
      expect(patches(calls)).toEqual([]);
      await user.click(screen.getByRole('button', { name: 'Remove' }));
      expect(await screen.findByText('Removed Milk')).toBeVisible();
    });
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
