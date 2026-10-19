import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Recording } from '../../lib/microphone';
import { resetRowFlash } from '../../lib/rowFlash';
import { resetVoiceNote } from '../../lib/voiceNoteStore';
import {
  holdLongEnough,
  pressDown,
  useVoiceTimers,
} from '../../test/voiceHold';
import { renderWithProviders, stubApi } from '../../test/render';
import { PantryPage } from './PantryPage';

// jsdom has no getUserMedia or MediaRecorder: the microphone module is the seam.
const mic = vi.hoisted(() => ({
  start: vi.fn(),
  permission: vi.fn(async () => 'granted'),
}));
vi.mock('../../lib/microphone', () => ({
  startRecording: mic.start,
  permissionState: mic.permission,
  requestPermission: vi.fn(async () => undefined),
  watchPermission: () => () => {},
  MicrophoneError: class MicrophoneError extends Error {},
}));

const recording: Recording = {
  blob: new Blob(['audio-bytes'], { type: 'audio/webm' }),
  mimeType: 'audio/webm;codecs=opus',
  durationMs: 3000,
};

const ingredient = (id: string, name: string) => ({
  owner: 'catalog',
  amountScale: 'medium',
  id,
  name,
  defaultUnit: 'pcs',
  leafCategory: { id: 'leaf', name: 'Leaf' },
  parentCategory: {
    id: 'parent',
    name: 'Parent',
    aisle: { id: 'aisle', name: 'Aisle' },
  },
  defaults: { expiryDays: 7, location: 'fridge' },
});
const yogurt = ingredient('ing-yogurt', 'Yogurt');
const rice = ingredient('ing-rice', 'Rice');

const action = (overrides: Record<string, unknown>) => ({
  id: 'a1',
  status: 'ready',
  target: 'pantry',
  op: 'add',
  text: 'yogurt',
  ingredient: yogurt,
  name: null,
  quantity: null,
  unit: null,
  scope: null,
  expiresOn: null,
  noExpiry: false,
  location: null,
  rows: {},
  defaults: {},
  ...overrides,
});

const riceBatch = (id: string, quantity: number, expiresOn: string | null) => ({
  id,
  name: 'Rice',
  quantity,
  unit: 'g',
  location: 'cupboard',
  expiresOn,
});

describe('Voice Notes on the Pantry page', () => {
  let applied: Record<string, unknown>[];
  let pantryFetches: number;

  function setup(
    actions: unknown[],
    apply: () => Response = () =>
      Response.json(
        {
          applied: [
            { actionId: 'a1', list: 'pantry', rowId: 'b1', alreadyDone: false },
          ],
          skipped: [],
        },
        { status: 201 },
      ),
    batches: unknown[] = [],
  ) {
    applied = [];
    pantryFetches = 0;
    const sent: FormData[] = [];
    const { fetchMock } = stubApi({
      'GET /api/pantry/recently-stocked': () =>
        Response.json({ ingredients: [] }),
      'GET /api/pantry': () => {
        pantryFetches += 1;
        return Response.json({ batches, runningLow: [] });
      },
      'GET /api/voice/config': () => Response.json({ configured: true }),
      'GET /api/catalog/search': () =>
        Response.json({ results: [yogurt, rice] }),
      'POST /api/voice': () =>
        Response.json(
          { transcript: 'a note about the pantry', actions },
          { status: 201 },
        ),
      'POST /api/voice/apply': () => apply(),
    });
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.body instanceof FormData) sent.push(init.body);
      if (
        String(input).endsWith('/voice/apply') &&
        typeof init?.body === 'string'
      ) {
        applied.push(JSON.parse(init.body) as Record<string, unknown>);
      }
      return fetchMock(input, init);
    });
    return { sent };
  }

  async function openReview() {
    renderWithProviders(<PantryPage />);
    const button = await screen.findByRole('button', {
      name: /hold to record a voice note/i,
    });
    pressDown(button);
    await screen.findByText('Listening');
    await holdLongEnough();
    fireEvent.pointerUp(button);
    return screen.findByRole('dialog');
  }

  beforeEach(() => {
    useVoiceTimers();
    resetVoiceNote();
    mic.permission.mockResolvedValue('granted');
    resetRowFlash();
    mic.start.mockReset();
    mic.start.mockImplementation(() =>
      Promise.resolve({
        stop: vi.fn(() => Promise.resolve(recording)),
        cancel: vi.fn(),
        level: vi.fn(() => 0),
      }),
    );
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('puts the voice button on the Pantry page and records for the Pantry', async () => {
    const { sent } = setup([]);
    await openReview();
    expect(sent[0].get('defaultTarget')).toBe('pantry');
  });

  it('shows the Pantry examples in the microphone intro, and records nothing', async () => {
    setup([]);
    mic.permission.mockResolvedValue('prompt');
    renderWithProviders(<PantryPage />);

    pressDown(
      await screen.findByRole('button', {
        name: /hold to record a voice note/i,
      }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('We finished the milk');
    expect(dialog).toHaveTextContent('Marks rice running low');
    expect(dialog).not.toHaveTextContent('Goes straight to the Pantry');
    expect(mic.start).not.toHaveBeenCalled();
  });

  /** The date `days` from now as YYYY-MM-DD, worked out apart from the app's own helper. */
  const inDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };
  const rowOf = (dialog: ReturnType<typeof within>, name: string) =>
    dialog.getByText(name, { selector: 'b' }).closest('li') as HTMLElement;
  const headerOf = (row: HTMLElement) =>
    within(row)
      .getAllByRole('button')
      .find((b) => b.hasAttribute('aria-expanded')) as HTMLElement;
  const header = (dialog: ReturnType<typeof within>, name: string) =>
    headerOf(rowOf(dialog, name));

  it('tells the Member the note goes to the Pantry while listening', async () => {
    setup([]);
    renderWithProviders(<PantryPage />);
    pressDown(
      await screen.findByRole('button', {
        name: /hold to record a voice note/i,
      }),
    );
    expect(await screen.findByText('Listening')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Goes to your Pantry. Say “on the list” for the Shopping List.',
    );
  });

  it('names the Location and expiry an add will use, marking the ones nobody said', async () => {
    setup([
      action({
        quantity: 2,
        unit: 'pcs',
        defaults: { location: 'fridge', expiresOn: '2099-05-20' },
      }),
      action({
        id: 'a2',
        ingredient: rice,
        text: 'rice in the cupboard until June',
        location: 'cupboard',
        expiresOn: '2099-06-01',
      }),
      action({
        id: 'a3',
        ingredient: ingredient('ing-salt', 'Salt'),
        text: 'salt, no expiry',
        location: 'spices',
        noExpiry: true,
      }),
    ]);
    const dialog = within(await openReview());
    await dialog.findByText('Yogurt', { selector: 'b' });

    expect(rowOf(dialog, 'Yogurt').textContent).toMatch(
      /^Add Yogurt2 pcs · Fridge · usual · expires .*2099 · default$/,
    );
    expect(rowOf(dialog, 'Rice').textContent).toMatch(
      /^Add RiceNo amount · Cupboard · expires .*2099$/,
    );
    expect(rowOf(dialog, 'Salt').textContent).toBe(
      'Add SaltNo amount · Spices · no expiry',
    );
    // The marked ones have a dotted underline; the ones said aloud do not.
    expect(dialog.getAllByText(/usual|default/)).toHaveLength(2);

    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 3 changes' }),
    );
    await waitFor(() => expect(applied).toHaveLength(1));
    expect(applied[0]).toMatchObject({
      today: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) as string,
      actions: [
        {
          id: 'a1',
          target: 'pantry',
          op: 'add',
          location: 'fridge',
          expiresOn: '2099-05-20',
          quantity: 2,
          unit: 'pcs',
        },
        { id: 'a2', location: 'cupboard', expiresOn: '2099-06-01' },
        { id: 'a3', location: 'spices', expiresOn: null, noExpiry: true },
      ],
    });
  });

  it('sends a picked Location, a quick-pick expiry and No expiry', async () => {
    setup([
      action({ defaults: { location: 'fridge', expiresOn: '2099-05-20' } }),
      action({
        id: 'a2',
        ingredient: rice,
        text: 'rice',
        defaults: { location: 'cupboard', expiresOn: '2099-05-20' },
      }),
    ]);
    const dialog = within(await openReview());

    await userEvent.click(header(dialog, 'Yogurt'));
    await userEvent.click(dialog.getByRole('button', { name: 'Freezer' }));
    expect(rowOf(dialog, 'Yogurt').textContent).toContain('Freezer · expires');
    expect(rowOf(dialog, 'Yogurt').textContent).not.toContain('usual');
    await userEvent.click(dialog.getByRole('button', { name: /^3 days/ }));
    expect(dialog.queryByText(/Default Expiry for this/)).toBeNull();

    await userEvent.click(header(dialog, 'Rice'));
    await userEvent.click(dialog.getByRole('button', { name: 'No expiry' }));
    expect(rowOf(dialog, 'Rice').textContent).toContain('no expiry');

    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 2 changes' }),
    );
    await waitFor(() => expect(applied).toHaveLength(1));
    expect(applied[0]).toMatchObject({
      actions: [
        {
          id: 'a1',
          location: 'freezer',
          expiresOn: inDays(3),
          noExpiry: false,
        },
        { id: 'a2', location: 'cupboard', expiresOn: null, noExpiry: true },
      ],
    });
  });

  it('picks an expiry in the existing date sheet', async () => {
    setup([
      action({ defaults: { location: 'fridge', expiresOn: '2099-05-20' } }),
    ]);
    const dialog = within(await openReview());
    await userEvent.click(header(dialog, 'Yogurt'));
    expect(
      dialog.getByText(/Default Expiry for this Ingredient/),
    ).toBeVisible();

    await userEvent.click(dialog.getByRole('button', { name: 'Pick a date' }));
    const sheet = within(
      await screen.findByRole('dialog', { name: 'Expires' }),
    );
    await userEvent.click(sheet.getByRole('button', { name: /^1 month/ }));
    await userEvent.click(sheet.getByRole('button', { name: 'Done' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Expires' })).toBeNull(),
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Apply 1 change' }),
    );
    await waitFor(() => expect(applied).toHaveLength(1));
    expect(applied[0]).toMatchObject({
      actions: [{ id: 'a1', expiresOn: inDays(30), noExpiry: false }],
    });
  });

  it('holds Apply back for an add with no Location, opened and focused, until one is picked', async () => {
    setup([action({ ingredient: null, name: 'Quinoa crackers' })]);
    const dialog = within(await openReview());

    const apply = await dialog.findByRole('button', {
      name: 'Pick a place first',
    });
    expect(apply).toHaveAttribute('aria-disabled', 'true');
    expect(header(dialog, 'Quinoa crackers')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(rowOf(dialog, 'Quinoa crackers').textContent).toContain(
      'Pick a place',
    );
    await waitFor(() =>
      expect(dialog.getByRole('button', { name: 'Fridge' })).toHaveFocus(),
    );

    // Tapping the held-back Apply sends focus back to the picker.
    (document.activeElement as HTMLElement).blur();
    await userEvent.click(apply);
    expect(dialog.getByRole('button', { name: 'Fridge' })).toHaveFocus();
    expect(applied).toHaveLength(0);

    await userEvent.click(dialog.getByRole('button', { name: 'Cupboard' }));
    expect(
      dialog.getByRole('button', { name: 'Apply 1 change' }),
    ).not.toHaveAttribute('aria-disabled');
  });

  it("takes the new Match's Location when an Unmatched add gets matched", async () => {
    setup([action({ ingredient: null, name: 'Quinoa crackers' })]);
    const dialog = within(await openReview());
    await dialog.findByRole('button', { name: 'Pick a place first' });

    await userEvent.click(
      dialog.getByRole('button', {
        name: 'Change Ingredient: Quinoa crackers',
      }),
    );
    await userEvent.click(await screen.findByText('Rice'));

    await waitFor(() =>
      expect(
        dialog.getByRole('button', { name: 'Apply 1 change' }),
      ).toBeEnabled(),
    );
    expect(dialog.getByRole('button', { name: 'Fridge' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(rowOf(dialog, 'Rice').textContent).toContain('Fridge · usual');
  });

  it('says what a removal takes: one Batch, all of them, or an amount from several', async () => {
    const batches = [
      { ...riceBatch('b1', 1, '2099-05-20'), name: 'Milk', unit: 'l', take: 1 },
    ];
    const milk = ingredient('ing-milk', 'Milk');
    setup([
      action({
        id: 'a1',
        op: 'remove',
        ingredient: milk,
        text: 'finished the milk',
        scope: 'one',
        rows: { batches },
      }),
      action({
        id: 'a2',
        op: 'remove',
        ingredient: ingredient('ing-eggs', 'Eggs'),
        text: 'out of eggs',
        scope: 'all',
        rows: {
          batches: [
            { ...riceBatch('e1', 6, '2099-05-20'), unit: 'pcs', take: null },
            { ...riceBatch('e2', 10, null), unit: 'pcs', take: null },
          ],
        },
      }),
      action({
        id: 'a3',
        op: 'remove',
        ingredient: rice,
        text: 'used 500 g of rice',
        quantity: 500,
        unit: 'g',
        scope: 'one',
        rows: {
          batches: [
            { ...riceBatch('b1', 300, '2099-05-20'), take: null },
            { ...riceBatch('b2', 400, null), take: 200 },
          ],
        },
      }),
    ]);
    const dialog = within(await openReview());
    await dialog.findByText('Milk', { selector: 'b' });

    expect(rowOf(dialog, 'Milk').textContent).toMatch(
      /^Remove MilkTakes 1 L · .*2099, expiring soonest$/,
    );
    expect(rowOf(dialog, 'Eggs').textContent).toBe(
      'Remove all EggsTakes all 2 batches · 16 pcs',
    );
    expect(rowOf(dialog, 'Rice').textContent).toBe(
      'Use RiceTakes 500 g from 2 batches, soonest first',
    );

    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 3 changes' }),
    );
    await waitFor(() => expect(applied).toHaveLength(1));
    expect(applied[0]).toMatchObject({
      actions: [
        { id: 'a1', op: 'remove', batchId: null, batchIds: ['b1'] },
        { id: 'a2', scope: 'all', batchIds: ['e1', 'e2'] },
        { id: 'a3', quantity: 500, batchIds: ['b1', 'b2'] },
      ],
    });
  });

  it('asks which Batch when the amount does not fit, soonest first, and holds Apply until one is picked', async () => {
    setup([
      action({
        op: 'remove',
        status: 'needsBatch',
        ingredient: rice,
        text: 'used 5 kg of rice',
        quantity: 5,
        unit: 'kg',
        rows: {
          batches: [
            riceBatch('b1', 300, '2099-05-20'),
            riceBatch('b2', 400, null),
            riceBatch('b3', 100, '2098-01-02'),
          ],
        },
      }),
    ]);
    const dialog = within(await openReview());

    const apply = await dialog.findByRole('button', {
      name: 'Pick a batch first',
    });
    expect(apply).toHaveAttribute('aria-disabled', 'true');
    expect(header(dialog, 'Rice').textContent).toBe(
      "Use Rice5 kg doesn't fit batches counted in g · pick one",
    );
    expect(header(dialog, 'Rice')).toHaveAttribute('aria-expanded', 'true');

    const group = within(
      dialog.getByRole('radiogroup', { name: 'Which batch did you use up?' }),
    );
    const radios = group.getAllByRole('radio');
    expect(radios.map((r) => (r as HTMLInputElement).value)).toEqual([
      'b3',
      'b1',
      'b2',
    ]);
    await waitFor(() => expect(radios[0]).toHaveFocus());

    await userEvent.click(radios[1]);
    expect(
      dialog.getByRole('button', { name: 'Apply 1 change' }),
    ).not.toHaveAttribute('aria-disabled');
    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 1 change' }),
    );
    await waitFor(() => expect(applied).toHaveLength(1));
    expect(applied[0]).toMatchObject({
      actions: [{ op: 'remove', batchId: 'b1', batchIds: [] }],
    });
  });

  it('explains a Running low, and one that becomes a Shopping List add', async () => {
    setup([
      action({
        id: 'a1',
        op: 'runningLow',
        ingredient: rice,
        text: 'running low on rice',
        rows: {},
      }),
      action({
        id: 'a2',
        op: 'runningLow',
        ingredient: ingredient('ing-butter', 'Butter'),
        text: 'butter is running low',
        rows: { shoppingFallback: true },
      }),
    ]);
    const dialog = within(await openReview());
    await dialog.findByText('Rice', { selector: 'b' });
    expect(rowOf(dialog, 'Rice').textContent).toBe(
      'Running low RiceShows in Suggestions until a new batch arrives',
    );
    expect(rowOf(dialog, 'Butter').textContent).toBe(
      'Add ButterNo amount · no Butter in the Pantry, so it goes on the list',
    );
  });

  it("lists a removal with nothing to take under Couldn't apply", async () => {
    setup([
      action({
        op: 'remove',
        status: 'notFound',
        ingredient: rice,
        text: 'rice',
      }),
    ]);
    const dialog = within(await openReview());
    const couldnt = within(
      await dialog.findByRole('region', { name: "Couldn't apply" }),
    );
    expect(couldnt.getByText('No Rice in your Pantry.')).toBeVisible();
    expect(dialog.getByText('Nothing to apply')).toBeVisible();
  });

  it('refreshes the Pantry after Apply and names what was skipped', async () => {
    setup(
      [action({ defaults: { location: 'fridge', expiresOn: '2099-05-20' } })],
      () =>
        Response.json(
          {
            applied: [],
            skipped: [{ id: 'a1', reason: 'pantry.batch_not_found' }],
          },
          { status: 201 },
        ),
    );
    const dialog = within(await openReview());
    const before = pantryFetches;
    await userEvent.click(
      await dialog.findByRole('button', { name: 'Apply 1 change' }),
    );
    await waitFor(() => expect(pantryFetches).toBeGreaterThan(before));
    // The skipped name is lowercased to read after "skipped:".
    expect(
      await screen.findByText(
        /^0 applied, 1 skipped: yogurt no longer in Pantry$/,
      ),
    ).toBeTruthy();
  });

  it('names the Pantry first on its own page when both lists changed', async () => {
    setup(
      [
        action({ defaults: { location: 'fridge', expiresOn: '2099-05-20' } }),
        action({
          id: 'a2',
          text: 'rice',
          ingredient: rice,
          defaults: { location: 'cupboard', expiresOn: '2099-05-20' },
        }),
        action({
          id: 'a3',
          target: 'shopping',
          text: 'eggs',
          name: 'Eggs',
          ingredient: null,
        }),
      ],
      () =>
        Response.json(
          {
            applied: [
              {
                actionId: 'a3',
                list: 'shopping',
                rowId: 'i1',
                alreadyDone: false,
              },
              {
                actionId: 'a1',
                list: 'pantry',
                rowId: 'b1',
                alreadyDone: false,
              },
              {
                actionId: 'a2',
                list: 'pantry',
                rowId: 'b2',
                alreadyDone: false,
              },
            ],
            skipped: [],
          },
          { status: 201 },
        ),
    );
    const dialog = within(await openReview());
    await userEvent.click(
      await dialog.findByRole('button', { name: 'Apply 3 changes' }),
    );
    expect(
      await screen.findByText('3 applied: 2 in the Pantry, 1 on the list'),
    ).toBeVisible();
  });

  it('flashes the Pantry row of the Batch Apply touched, and puts focus on the voice button', async () => {
    const stocked = {
      id: 'b1',
      name: 'Yogurt',
      ingredientId: 'ing-yogurt',
      unmatched: false,
      aisle: null,
      amountScale: null,
      defaultUnit: null,
      defaultExpiryDays: null,
      quantity: 2,
      unit: 'pcs',
      location: 'fridge',
      expiryDate: null,
      productDescription: null,
      createdAt: '2026-10-01T00:00:00Z',
    };
    setup(
      [action({ defaults: { location: 'fridge', expiresOn: '2099-05-20' } })],
      undefined,
      [stocked, { ...stocked, id: 'b9', name: 'Milk', ingredientId: 'm' }],
    );
    const dialog = within(await openReview());
    await userEvent.click(
      await dialog.findByRole('button', { name: 'Apply 1 change' }),
    );
    await waitFor(() =>
      expect(
        Array.from(document.querySelectorAll('[data-row-flash]')).map((el) =>
          el.closest('li')?.textContent?.slice(0, 6),
        ),
      ).toEqual(['Yogurt']),
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /hold to record a voice note/i }),
      ).toHaveFocus(),
    );
  });
});
