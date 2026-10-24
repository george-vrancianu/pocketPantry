import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RecipeDraftContent } from '../../lib/recipeDrafts';
import { renderWithProviders, stubApi } from '../../test/render';
import { NewRecipePage } from './FamilyRecipePages';

const DRAFT_ID = '5b0f6c2e-7d3a-4c58-9a51-1f2e3d4c5b6a';

const filters = { cuisines: [], methods: [], eatingMoments: [] };

const blankGuidance = { nutritionNote: '', pairings: [], eatingMoments: [] };

/** A Recipe Draft's content as the form leaves it when only a title is typed. */
const titled = (title: string): RecipeDraftContent => ({
  title,
  servings: '4',
  prepMinutes: '',
  cookMinutes: '',
  difficulty: '',
  cuisineId: '',
  methodId: '',
  lines: [],
  steps: [],
  guidance: blankGuidance,
  pickedBaseId: null,
  sourceLink: null,
  sourceLanguage: null,
  plateScan: false,
});

const savedRecipe = {
  id: 'new-recipe',
  parentId: null,
  title: 'Gran stew',
  servings: 4,
  prepMinutes: null,
  cookMinutes: null,
  difficulty: null,
  cuisineId: null,
  methodId: null,
  archived: false,
  sourceLink: null,
  sourceLanguage: null,
  lines: [],
  steps: [],
  tips: [],
  parentTips: null,
  nutritionNote: null,
  pairings: [],
  eatingMoments: [],
};

/** Shows where the router is and how it got there. */
function Where() {
  const location = useLocation();
  const type = useNavigationType();
  return <p>{`at ${location.pathname}${location.search} by ${type}`}</p>;
}

function setup(
  route: string,
  routes: Parameters<typeof stubApi>[0],
  locale: 'en' | 'ro' | 'da' = 'en',
) {
  const { fetchMock, calls } = stubApi({
    'GET /api/recipes/filters': () => Response.json(filters),
    ...routes,
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route
        path="/recipes/new"
        element={
          <>
            <Link to="/recipes">leave</Link>
            <Where />
            <NewRecipePage />
          </>
        }
      />
      <Route path="/recipes/:id" element={<p>Detail of the recipe</p>} />
      <Route path="/recipes" element={<p>Recipes page</p>} />
    </Routes>,
    { route, locale },
  );
  return calls;
}

const elapse = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
const sent = (calls: ReturnType<typeof setup>, key: string) =>
  calls.filter((call) => call.key === key);

describe('Recipe Drafts autosave on New Recipe', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  const typer = () =>
    userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  it('creates no Recipe Draft for a blank form left unchanged', async () => {
    const calls = setup('/recipes/new', {});
    await screen.findByLabelText(/^Title/);
    await elapse(10_000);
    await userEvent
      .setup({ advanceTimers: vi.advanceTimersByTime })
      .click(screen.getByRole('link', { name: 'leave' }));
    await elapse(10_000);
    expect(await screen.findByText('Recipes page')).toBeVisible();
    expect(calls.filter((c) => c.key.includes('recipe-drafts'))).toEqual([]);
  });

  it('creates a Recipe Draft about 1.5 s after the title is typed, sending the content as typed with no React keys', async () => {
    const user = typer();
    const calls = setup('/recipes/new', {
      'POST /api/recipe-drafts': () =>
        Response.json({ id: DRAFT_ID, version: 1 }, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    await elapse(1000);
    expect(sent(calls, 'POST /api/recipe-drafts')).toHaveLength(0);
    await elapse(600);
    expect(sent(calls, 'POST /api/recipe-drafts')).toHaveLength(1);
    expect(sent(calls, 'POST /api/recipe-drafts')[0].body).toEqual({
      kind: 'new_recipe',
      baseRecipeId: null,
      content: titled('Gran stew'),
    });
  });

  it('creates a Recipe Draft from a first line or a first Step', async () => {
    const user = typer();
    const calls = setup('/recipes/new', {
      'POST /api/recipe-drafts': () =>
        Response.json({ id: DRAFT_ID, version: 1 }, { status: 201 }),
    });
    await user.click(await screen.findByRole('button', { name: 'Add a Step' }));
    await user.type(screen.getByLabelText('Step 1'), 'Whi');
    await elapse(1600);
    expect(sent(calls, 'POST /api/recipe-drafts')[0].body).toMatchObject({
      content: { title: '', steps: [{ text: 'Whi', timer: '' }] },
    });
  });

  it('shows Saving… then Draft saved in the header, not as a toast', async () => {
    const user = typer();
    let finish: (response: Response) => void = () => {};
    setup('/recipes/new', {
      'POST /api/recipe-drafts': () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    });
    expect(screen.queryByText('Draft saved')).toBeNull();
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    await elapse(1600);
    const saving = screen.getByText('Saving…');
    expect(saving).toBeVisible();
    expect(saving).toHaveAttribute('role', 'status');
    expect(screen.queryByRole('alert')).toBeNull();
    await act(async () => {
      finish(Response.json({ id: DRAFT_ID, version: 1 }, { status: 201 }));
    });
    expect(await screen.findByText('Draft saved')).toBeVisible();
    expect(screen.queryByText('Saving…')).toBeNull();
  });

  it.each([
    ['ro', 'Ciornă salvată'],
    ['da', 'Kladde gemt'],
  ] as const)('says the Recipe Draft is saved in %s', async (locale, text) => {
    const user = typer();
    setup(
      '/recipes/new',
      {
        'POST /api/recipe-drafts': () =>
          Response.json({ id: DRAFT_ID, version: 1 }, { status: 201 }),
      },
      locale,
    );
    await user.type((await screen.findAllByRole('textbox'))[0], 'Gran stew');
    await elapse(1600);
    expect(await screen.findByText(text)).toBeVisible();
  });

  it('puts the Recipe Draft id in the URL by replacing the entry', async () => {
    const user = typer();
    setup('/recipes/new', {
      'POST /api/recipe-drafts': () =>
        Response.json({ id: DRAFT_ID, version: 1 }, { status: 201 }),
    });
    expect(await screen.findByText('at /recipes/new by POP')).toBeVisible();
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    await elapse(1600);
    expect(
      await screen.findByText(`at /recipes/new?draft=${DRAFT_ID} by REPLACE`),
    ).toBeVisible();
    // The form is the same one: nothing typed is lost and nothing is fetched.
    expect(screen.getByLabelText(/^Title/)).toHaveValue('Gran stew');
  });

  it('updates with the version it holds, one request at a time, sending later edits together', async () => {
    const user = typer();
    const releases: Array<() => void> = [];
    let version = 1;
    const calls = setup('/recipes/new', {
      'POST /api/recipe-drafts': () =>
        Response.json({ id: DRAFT_ID, version }, { status: 201 }),
      [`PUT /api/recipe-drafts/${DRAFT_ID}`]: () =>
        new Promise<Response>((resolve) => {
          releases.push(() =>
            resolve(Response.json({ id: DRAFT_ID, version: ++version })),
          );
        }),
    });
    const title = await screen.findByLabelText(/^Title/);
    await user.type(title, 'Gran');
    await elapse(1600);
    expect(sent(calls, 'POST /api/recipe-drafts')).toHaveLength(1);

    await user.type(title, ' stew');
    await elapse(1600);
    const puts = () => sent(calls, `PUT /api/recipe-drafts/${DRAFT_ID}`);
    expect(puts()).toHaveLength(1);
    expect(puts()[0].body).toMatchObject({
      version: 1,
      content: { title: 'Gran stew' },
    });

    // Edited while the request is in flight: nothing more goes out yet.
    await user.type(title, ' with');
    await elapse(1600);
    await user.type(title, ' herbs');
    await elapse(1600);
    expect(puts()).toHaveLength(1);

    await act(async () => releases[0]());
    await elapse(10);
    expect(puts()).toHaveLength(2);
    expect(puts()[1].body).toMatchObject({
      version: 2,
      content: { title: 'Gran stew with herbs' },
    });
    await act(async () => releases[1]());
    await elapse(5000);
    expect(puts()).toHaveLength(2);
  });

  it('sends what is pending when the Member leaves the page', async () => {
    const user = typer();
    const calls = setup('/recipes/new', {
      'POST /api/recipe-drafts': () =>
        Response.json({ id: DRAFT_ID, version: 1 }, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    expect(sent(calls, 'POST /api/recipe-drafts')).toHaveLength(0);
    await user.click(screen.getByRole('link', { name: 'leave' }));
    expect(await screen.findByText('Recipes page')).toBeVisible();
    expect(sent(calls, 'POST /api/recipe-drafts')).toHaveLength(1);
  });

  it('sends what is pending on pagehide', async () => {
    const user = typer();
    const calls = setup('/recipes/new', {
      'POST /api/recipe-drafts': () =>
        Response.json({ id: DRAFT_ID, version: 1 }, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    expect(sent(calls, 'POST /api/recipe-drafts')).toHaveLength(0);
    await act(async () => {
      window.dispatchEvent(new Event('pagehide'));
    });
    expect(sent(calls, 'POST /api/recipe-drafts')).toHaveLength(1);
  });

  it('resumes the form exactly as typed, half-typed values included, and updates from the version it was given', async () => {
    const user = typer();
    const content: RecipeDraftContent = {
      ...titled('Gran st'),
      servings: '4x',
      lines: [
        {
          ingredientId: 'flour-id',
          name: 'Flour',
          quantity: '1/2 ab',
          unit: 'g',
          optional: false,
          note: '',
        },
        {
          ingredientId: '',
          name: 'Dragon fruit',
          quantity: '',
          unit: 'g',
          optional: true,
          note: 'ripe',
        },
      ],
      steps: [{ text: 'Whisk the', timer: '' }],
    };
    const calls = setup(`/recipes/new?draft=${DRAFT_ID}`, {
      [`GET /api/recipe-drafts/${DRAFT_ID}`]: () =>
        Response.json({
          id: DRAFT_ID,
          kind: 'new_recipe',
          baseRecipeId: null,
          baseRecipeName: null,
          baseAvailable: false,
          content,
          version: 7,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          expiresAt: '2026-01-31T00:00:00.000Z',
        }),
      [`PUT /api/recipe-drafts/${DRAFT_ID}`]: () =>
        Response.json({ id: DRAFT_ID, version: 8 }),
    });
    const title = await screen.findByLabelText(/^Title/);
    expect(title).toHaveValue('Gran st');
    expect(screen.getByLabelText(/^Servings/)).toHaveValue('4x');
    expect(screen.getByLabelText('Quantity of Flour')).toHaveValue('1/2 ab');
    expect(screen.getByLabelText('Step 1')).toHaveValue('Whisk the');
    // Resuming alone changes nothing on the server.
    await elapse(5000);
    expect(sent(calls, `PUT /api/recipe-drafts/${DRAFT_ID}`)).toHaveLength(0);
    // A line whose Ingredient is gone is an Unmatched name.
    expect(screen.getByLabelText('Quantity of Dragon fruit')).toBeVisible();
    expect(screen.getByText(/Not in the Catalog/)).toBeVisible();

    await user.type(title, 'ew');
    await elapse(1600);
    const put = sent(calls, `PUT /api/recipe-drafts/${DRAFT_ID}`);
    expect(put).toHaveLength(1);
    expect(put[0].body).toMatchObject({
      version: 7,
      content: {
        title: 'Gran stew',
        lines: content.lines,
        steps: content.steps,
      },
    });
  });

  it('sends the Recipe Draft id with the create and sends no more drafts after', async () => {
    const user = typer();
    const calls = setup('/recipes/new', {
      'POST /api/recipe-drafts': () =>
        Response.json({ id: DRAFT_ID, version: 1 }, { status: 201 }),
      'POST /api/recipes': () => Response.json(savedRecipe, { status: 201 }),
    });
    await user.type(await screen.findByLabelText(/^Title/), 'Gran stew');
    await elapse(1600);
    await user.click(screen.getByRole('button', { name: 'Save Recipe' }));
    expect(await screen.findByText('Detail of the recipe')).toBeVisible();
    expect(sent(calls, 'POST /api/recipes')[0].body).toMatchObject({
      title: 'Gran stew',
      recipeDraftId: DRAFT_ID,
    });
    await elapse(5000);
    expect(calls.filter((c) => c.key.includes('recipe-drafts'))).toHaveLength(
      1,
    );
  });
});
