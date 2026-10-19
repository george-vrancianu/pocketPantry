import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Recording } from '../../lib/microphone';
import { resetVoiceNote } from '../../lib/voiceNoteStore';
import { holdLongEnough, useVoiceTimers } from '../../test/voiceHold';
import { renderWithProviders, stubApi } from '../../test/render';
import { PantryPage } from './PantryPage';

// jsdom has no getUserMedia or MediaRecorder: the microphone module is the seam.
const mic = vi.hoisted(() => ({ start: vi.fn() }));
vi.mock('../../lib/microphone', () => ({
  startRecording: mic.start,
  permissionState: vi.fn(async () => 'granted'),
  requestPermission: vi.fn(async () => undefined),
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
      Response.json({ applied: ['a1'], skipped: [] }, { status: 201 }),
  ) {
    localStorage.setItem('pp.voice.micExplained', '1');
    applied = [];
    pantryFetches = 0;
    const sent: FormData[] = [];
    const { fetchMock } = stubApi({
      'GET /api/pantry/recently-stocked': () =>
        Response.json({ ingredients: [] }),
      'GET /api/pantry': () => {
        pantryFetches += 1;
        return Response.json({ batches: [], runningLow: [] });
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
    fireEvent.pointerDown(button);
    await screen.findByText('Listening');
    await holdLongEnough();
    fireEvent.pointerUp(button);
    return screen.findByRole('dialog');
  }

  beforeEach(() => {
    useVoiceTimers();
    resetVoiceNote();
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

  it('tells the Member the note goes to the Pantry while listening', async () => {
    setup([]);
    renderWithProviders(<PantryPage />);
    fireEvent.pointerDown(
      await screen.findByRole('button', {
        name: /hold to record a voice note/i,
      }),
    );
    expect(await screen.findByText('Listening')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Goes to your Pantry. Say “on the list” for the Shopping List.',
    );
  });

  it('shows the Location and expiry an add will use, defaults included, and sends what was edited', async () => {
    setup([
      action({
        quantity: 2,
        unit: 'pcs',
        defaults: { location: 'fridge', expiresOn: '2030-05-20' },
      }),
    ]);
    const dialog = await openReview();
    const location = within(dialog).getByLabelText('Location');
    expect(location).toHaveValue('fridge');
    const expiry = within(dialog).getByLabelText('Expires');
    expect(expiry).toHaveValue('2030-05-20');

    fireEvent.change(location, { target: { value: 'freezer' } });
    fireEvent.change(expiry, { target: { value: '2030-06-01' } });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Apply' }),
    );

    await waitFor(() => expect(applied).toHaveLength(1));
    expect(applied[0]).toMatchObject({
      today: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) as string,
      actions: [
        {
          id: 'a1',
          target: 'pantry',
          op: 'add',
          location: 'freezer',
          expiresOn: '2030-06-01',
          noExpiry: false,
          quantity: 2,
          unit: 'pcs',
        },
      ],
    });
  });

  it('sends the defaults when nothing was edited, and no expiry when asked', async () => {
    setup([
      action({ defaults: { location: 'fridge', expiresOn: '2030-05-20' } }),
      action({
        id: 'a2',
        ingredient: rice,
        text: 'rice',
        defaults: { location: 'cupboard', expiresOn: '2030-05-20' },
      }),
    ]);
    const dialog = await openReview();
    await userEvent.click(
      within(dialog).getAllByRole('button', { name: 'No expiry' })[1],
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Apply' }),
    );
    await waitFor(() => expect(applied).toHaveLength(1));
    expect(applied[0]).toMatchObject({
      actions: [
        { id: 'a1', location: 'fridge', expiresOn: '2030-05-20' },
        { id: 'a2', location: 'cupboard', expiresOn: null, noExpiry: true },
      ],
    });
  });

  it('cannot apply an add with no Location until one is chosen', async () => {
    setup([action({ ingredient: null, name: 'Quinoa crackers' })]);
    const dialog = await openReview();
    const apply = within(dialog).getByRole('button', { name: 'Apply' });
    expect(apply).toBeDisabled();
    fireEvent.change(within(dialog).getByLabelText('Location'), {
      target: { value: 'cupboard' },
    });
    expect(apply).toBeEnabled();
  });

  it("takes the new Match's Location when an Unmatched add gets matched", async () => {
    setup([action({ ingredient: null, name: 'Quinoa crackers' })]);
    const dialog = await openReview();
    const apply = within(dialog).getByRole('button', { name: 'Apply' });
    expect(apply).toBeDisabled();
    await userEvent.click(
      within(dialog).getByRole('button', {
        name: 'Change match for Quinoa crackers',
      }),
    );
    await userEvent.click(await screen.findByText('Rice'));
    await waitFor(() => expect(apply).toBeEnabled());
    expect(within(dialog).getByLabelText('Location')).toHaveValue('fridge');
  });

  it('shows the Batches a removal will take, with their expiry dates', async () => {
    setup([
      action({
        op: 'remove',
        ingredient: rice,
        text: 'used 500 g of rice',
        quantity: 500,
        unit: 'g',
        scope: 'one',
        rows: {
          batches: [
            { ...riceBatch('b1', 300, '2030-05-20'), take: null },
            { ...riceBatch('b2', 400, null), take: 200 },
          ],
        },
      }),
    ]);
    const dialog = await openReview();
    const lines = within(dialog).getAllByRole('listitem');
    const texts = lines.map((li) => li.textContent);
    expect(
      texts.some((x) => /300 g · expires .*2030.* · all of it/.test(x ?? '')),
    ).toBe(true);
    expect(
      texts.some((x) =>
        /400 g · expires no expiry date · takes 200 g/.test(x ?? ''),
      ),
    ).toBe(true);

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Apply' }),
    );
    await waitFor(() => expect(applied).toHaveLength(1));
    expect(applied[0]).toMatchObject({
      actions: [{ op: 'remove', batchId: null, batchIds: ['b1', 'b2'] }],
    });
  });

  it('asks which Batch when the amount does not fit, and holds Apply until one is picked', async () => {
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
            riceBatch('b1', 300, '2030-05-20'),
            riceBatch('b2', 400, null),
          ],
        },
      }),
    ]);
    const dialog = await openReview();
    const apply = within(dialog).getByRole('button', { name: 'Apply' });
    expect(apply).toBeDisabled();
    expect(
      within(dialog).getByText('Pick a batch to take it from.'),
    ).toBeTruthy();

    await userEvent.selectOptions(
      within(dialog).getByLabelText('Which batch of Rice?'),
      'b2',
    );
    expect(apply).toBeEnabled();
    await userEvent.click(apply);
    await waitFor(() => expect(applied).toHaveLength(1));
    expect(applied[0]).toMatchObject({
      actions: [{ op: 'remove', batchId: 'b2', batchIds: [] }],
    });
  });

  it('explains a Running low that becomes a Shopping List add', async () => {
    setup([
      action({
        op: 'runningLow',
        ingredient: rice,
        text: 'running low on rice',
        rows: { shoppingFallback: true },
      }),
    ]);
    const dialog = await openReview();
    expect(
      within(dialog).getByText('Add Rice to the Shopping List'),
    ).toBeTruthy();
  });

  it('shows Not found for a removal with nothing to take', async () => {
    setup([
      action({
        op: 'remove',
        status: 'notFound',
        ingredient: rice,
        text: 'rice',
      }),
    ]);
    const dialog = await openReview();
    expect(within(dialog).getByText('Not found: Rice')).toBeTruthy();
  });

  it('refreshes the Pantry after Apply and names what was skipped', async () => {
    setup(
      [
        action({
          defaults: { location: 'fridge', expiresOn: '2030-05-20' },
        }),
      ],
      () =>
        Response.json(
          {
            applied: [],
            skipped: [{ id: 'a1', reason: 'pantry.batch_not_found' }],
          },
          { status: 201 },
        ),
    );
    const dialog = await openReview();
    const before = pantryFetches;
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Apply' }),
    );
    await waitFor(() => expect(pantryFetches).toBeGreaterThan(before));
    expect(await screen.findByText(/that batch is already gone/)).toBeTruthy();
  });
});
