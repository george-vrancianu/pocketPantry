import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  resetVoiceEnvironment,
  stubVoiceFetch,
  talkButton,
  voiceAction,
  voiceIngredient,
} from '../../test/voice';
import {
  holdLongEnough,
  pressDown,
  useVoiceTimers,
} from '../../test/voiceHold';
import { renderInAppLayout, stubApi } from '../../test/render';
import { PantryPage } from '../../pages/Pantry/PantryPage';
import { ShoppingPage } from '../../pages/Shopping/ShoppingPage';

const milk = voiceIngredient('ing-milk', 'Milk');
const butter = voiceIngredient('ing-butter', 'Butter');

const answers = [
  {
    id: 'q1',
    kind: 'yes',
    text: 'do we have milk',
    ingredient: milk,
    totals: [{ unit: 'l', quantity: 2 }],
    locations: ['fridge'],
    expiringSoon: false,
    runningLow: false,
  },
  {
    id: 'q2',
    kind: 'no',
    text: 'and butter',
    ingredient: butter,
    onShoppingList: false,
  },
];

describe('the answer sheet for Pantry Questions', () => {
  let sent: FormData[];
  let calls: string[];

  function setup(body: Record<string, unknown>) {
    calls = [];
    const { fetchMock } = stubApi({
      'GET /api/shopping-list': () =>
        Response.json({
          id: 'l1',
          groups: [],
          summary: { remaining: 0, checked: 0 },
        }),
      'GET /api/pantry/recently-stocked': () =>
        Response.json({ ingredients: [] }),
      'GET /api/pantry': () => Response.json({ batches: [], runningLow: [] }),
      'GET /api/voice/config': () => Response.json({ configured: true }),
      'POST /api/voice': () =>
        Response.json(
          { transcript: 'Do we have milk and butter?', ...body },
          { status: 201 },
        ),
      'POST /api/voice/apply': () =>
        Response.json({ applied: [], skipped: [] }),
    });
    ({ sent } = stubVoiceFetch(fetchMock, (input) =>
      calls.push(String(input)),
    ));
  }

  async function ask(page: ReactElement, path: string) {
    renderInAppLayout(page, path);
    const button = await talkButton();
    pressDown(button);
    await screen.findByText('Listening');
    await holdLongEnough();
    fireEvent.pointerUp(button);
    return screen.findByRole('dialog');
  }

  beforeEach(() => {
    useVoiceTimers();
    resetVoiceEnvironment();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each([
    ['the Pantry page', <PantryPage key="p" />, '/pantry', 'pantry'],
    [
      'the Shopping List page',
      <ShoppingPage key="s" />,
      '/shopping',
      'shopping',
    ],
    ['a page with no Default List', <p key="h">home</p>, '/', 'none'],
  ])(
    'opens from %s with a row per Ingredient instead of Review, and Done sends nothing',
    async (_name, page, path, target) => {
      setup({ actions: [], answers });
      const dialog = within(await ask(page, path));

      expect(sent[0].get('defaultTarget')).toBe(target);
      expect(
        dialog.getByRole('heading', { name: 'Your Pantry' }),
      ).toBeVisible();
      expect(dialog.queryByRole('heading', { name: 'Review' })).toBeNull();
      expect(dialog.getByText('What I heard')).toBeVisible();
      const rows = dialog.getAllByRole('listitem');
      expect(rows).toHaveLength(2);
      expect(within(rows[0]).getByText('Milk')).toBeVisible();
      expect(rows[0]).toHaveTextContent('In your Pantry');
      expect(within(rows[1]).getByText('Butter')).toBeVisible();
      expect(rows[1]).toHaveTextContent('Not in your Pantry');

      await userEvent.click(dialog.getByRole('button', { name: 'Done' }));

      expect(screen.queryByRole('dialog')).toBeNull();
      expect(calls.some((url) => url.endsWith('/voice/apply'))).toBe(false);
    },
  );

  // Spec: #461. The rows show the details the Assistant speaks; an off-page case (Home, no Default List).
  it('shows the details of each answer kind', async () => {
    const eggs = voiceIngredient('ing-eggs', 'Eggs');
    const flour = voiceIngredient('ing-flour', 'Flour');
    setup({
      actions: [],
      answers: [
        {
          id: 'q1',
          kind: 'yes',
          text: 'milk',
          ingredient: milk,
          totals: [
            { unit: 'ml', quantity: 500 },
            { unit: 'l', quantity: 1.5 },
          ],
          locations: ['fridge', 'freezer'],
          expiringSoon: true,
          runningLow: true,
        },
        {
          id: 'q2',
          kind: 'yes',
          text: 'salt',
          ingredient: voiceIngredient('ing-salt', 'Salt'),
          totals: [],
          locations: [],
          expiringSoon: false,
          runningLow: false,
        },
        {
          id: 'q3',
          kind: 'onlyExpired',
          text: 'eggs',
          ingredient: eggs,
          onShoppingList: true,
        },
        {
          id: 'q4',
          kind: 'no',
          text: 'butter',
          ingredient: butter,
          onShoppingList: false,
        },
        {
          id: 'q5',
          kind: 'no',
          text: 'flour',
          ingredient: flour,
          onShoppingList: true,
        },
      ],
    });
    const dialog = within(await ask(<p>home</p>, '/'));
    const rows = dialog.getAllByRole('listitem');
    expect(rows).toHaveLength(5);
    expect(rows[0]).toHaveTextContent('In your Pantry');
    expect(rows[0]).toHaveTextContent('500 ml · 1.5 L · Fridge · Freezer');
    expect(rows[0]).toHaveTextContent('Expiring soon');
    expect(rows[0]).toHaveTextContent('Running low');
    expect(rows[1]).toHaveTextContent('In your Pantry');
    expect(rows[1]).not.toHaveTextContent('Expiring soon');
    expect(rows[1]).not.toHaveTextContent('Running low');
    expect(rows[2]).toHaveTextContent('Only expired');
    expect(rows[2]).toHaveTextContent('Already on your Shopping List');
    expect(rows[3]).toHaveTextContent('Not in your Pantry');
    expect(rows[3]).not.toHaveTextContent('Shopping List');
    expect(rows[4]).toHaveTextContent('Already on your Shopping List');
  });

  it('keeps Review for a note with actions, even beside answers', async () => {
    setup({
      actions: [
        voiceAction({ text: 'eggs', target: 'shopping', ingredient: milk }),
      ],
      answers,
    });
    const dialog = within(await ask(<p>home</p>, '/'));
    expect(dialog.getByRole('heading', { name: 'Review' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Your Pantry' })).toBeNull();
    // Interim until #463: the question stays visible as a Didn't understand row.
    expect(dialog.getByText('“do we have milk”')).toBeVisible();
  });

  it('puts focus back on the voice button after Done', async () => {
    setup({ actions: [], answers });
    const dialog = within(await ask(<p>home</p>, '/'));
    await userEvent.click(dialog.getByRole('button', { name: 'Done' }));
    await act(() => vi.advanceTimersByTimeAsync(10));
    expect(await talkButton()).toHaveFocus();
  });

  it('closes on a scrim tap without applying anything', async () => {
    setup({ actions: [], answers });
    await ask(<p>home</p>, '/');
    fireEvent.click(document.querySelector('.MuiBackdrop-root')!);
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(calls.some((url) => url.endsWith('/voice/apply'))).toBe(false);
  });
});
