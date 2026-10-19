import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Recording } from '../../lib/microphone';
import { resetVoiceNote } from '../../lib/voiceNoteStore';
import { renderWithProviders, stubApi } from '../../test/render';
import { PantryPage } from './PantryPage';

const mic = vi.hoisted(() => ({ start: vi.fn() }));
vi.mock('../../lib/microphone', () => ({
  startRecording: mic.start,
  permissionState: vi.fn(async () => 'granted'),
  requestPermission: vi.fn(async () => undefined),
  MicrophoneError: class MicrophoneError extends Error {},
}));

// A press shorter than 0.3 s is a tap, not a Voice Note.
const heldLongEnough = () =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 320)));

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

const action = (overrides: Record<string, unknown>) => ({
  id: 'a1',
  status: 'ready',
  target: 'pantry',
  op: 'add',
  text: 'x',
  ingredient: null,
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

// "put the yogurts in the pantry, got the bread, and add milk" said on the Pantry page.
const mixed = [
  action({
    id: 'y',
    ingredient: ingredient('ing-yogurt', 'Yogurt'),
    quantity: 2,
    unit: 'pcs',
    defaults: { location: 'fridge', expiresOn: '2030-05-20' },
  }),
  action({
    id: 'b',
    target: 'shopping',
    op: 'uncheck',
    ingredient: ingredient('ing-bread', 'Bread'),
    rows: { shoppingItem: { id: 'i1' } },
  }),
  action({
    id: 'm',
    target: 'shopping',
    op: 'add',
    ingredient: ingredient('ing-milk', 'Milk'),
  }),
];

describe('A Voice Note across both lists', () => {
  beforeEach(() => {
    resetVoiceNote();
    localStorage.setItem('pp.voice.micExplained', '1');
    mic.start.mockReset();
    mic.start.mockImplementation(() =>
      Promise.resolve({
        stop: vi.fn(() => Promise.resolve(recording)),
        cancel: vi.fn(),
        level: vi.fn(() => 0),
      }),
    );
    const { fetchMock } = stubApi({
      'GET /api/pantry/recently-stocked': () =>
        Response.json({ ingredients: [] }),
      'GET /api/pantry': () => Response.json({ batches: [], runningLow: [] }),
      'GET /api/voice/config': () => Response.json({ configured: true }),
      'GET /api/catalog/search': () => Response.json({ results: [] }),
      'POST /api/voice': () =>
        Response.json(
          { transcript: 'a mixed note', actions: mixed },
          { status: 201 },
        ),
      'POST /api/voice/apply': () =>
        Response.json(
          {
            applied: ['m'],
            skipped: [
              { id: 'y', reason: 'pantry.location_required' },
              { id: 'b', reason: 'shopping.item_not_found' },
            ],
          },
          { status: 201 },
        ),
    });
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  async function openReview() {
    const view = renderWithProviders(<PantryPage />);
    const button = await screen.findByRole('button', {
      name: /hold to record a voice note/i,
    });
    fireEvent.pointerDown(button);
    await screen.findByText('Listening');
    await heldLongEnough();
    fireEvent.pointerUp(button);
    return { ...view, dialog: await screen.findByRole('dialog') };
  }

  it('groups the Voice Actions under Shopping List and Pantry headings', async () => {
    const { dialog } = await openReview();
    const shopping = within(
      await within(dialog).findByRole('region', { name: 'Shopping List' }),
    );
    const pantry = within(
      within(dialog).getByRole('region', { name: 'Pantry' }),
    );
    expect(shopping.getByText('Bread')).toBeVisible();
    expect(shopping.getByText('Milk')).toBeVisible();
    expect(shopping.queryByText('Yogurt')).toBeNull();
    expect(pantry.getByText('Yogurt')).toBeVisible();
  });

  it('names every skipped Voice Action across both lists and refreshes both lists', async () => {
    const { dialog, queryClient } = await openReview();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    await userEvent.click(
      await within(dialog).findByRole('button', { name: 'Apply' }),
    );

    const toast = await screen.findByText(/Applied 1 voice action\./);
    expect(toast).toHaveTextContent(
      /Skipped: Yogurt \(no location chosen\), Bread \(no longer on the list\)\./,
    );
    await waitFor(() => {
      const keys = invalidate.mock.calls.map(
        ([filters]) => filters?.queryKey?.[0],
      );
      expect(keys).toEqual(expect.arrayContaining(['shopping-list', 'pantry']));
    });
  });
});
