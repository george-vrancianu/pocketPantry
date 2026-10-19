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
import { renderWithProviders, stubApi } from '../../test/render';
import { resetVoiceNote } from '../../lib/voiceNoteStore';
import { ShoppingPage } from './ShoppingPage';

// jsdom has no getUserMedia or MediaRecorder: the microphone module is the seam.
const mic = vi.hoisted(() => ({ start: vi.fn() }));
vi.mock('../../lib/microphone', () => ({
  startRecording: mic.start,
  permissionState: vi.fn(async () => 'granted'),
  requestPermission: vi.fn(async () => undefined),
  MicrophoneError: class MicrophoneError extends Error {
    constructor(readonly reason: string) {
      super(reason);
    }
  },
}));
import { MicrophoneError } from '../../lib/microphone';

// A press shorter than 0.3 s is a tap, not a Voice Note.
const heldLongEnough = () =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 320)));

const recording: Recording = {
  blob: new Blob(['audio-bytes'], { type: 'audio/webm' }),
  mimeType: 'audio/webm;codecs=opus',
  durationMs: 3000,
};

function fakeSession() {
  return {
    stop: vi.fn(() => Promise.resolve(recording)),
    cancel: vi.fn(),
    level: vi.fn(() => 0),
  };
}

const emptyList = {
  id: 'l1',
  groups: [],
  summary: { remaining: 0, checked: 0 },
};

type Setup = {
  configured?: boolean;
  note?: () => Response;
  explained?: boolean;
};

function setup({ configured = true, note, explained = true }: Setup = {}) {
  if (explained) localStorage.setItem('pp.voice.micExplained', '1');
  const sent: FormData[] = [];
  const { fetchMock } = stubApi({
    'GET /api/shopping-list': () => Response.json(emptyList),
    'GET /api/voice/config': () => Response.json({ configured }),
    'POST /api/voice': () =>
      note?.() ??
      Response.json({ transcript: 'got the bread and sausages', actions: [] }),
  });
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.body instanceof FormData) sent.push(init.body);
    return fetchMock(input, init);
  });
  return { sent };
}

const talkButton = () =>
  screen.findByRole('button', { name: /hold to record a voice note/i });

async function hold() {
  const button = await talkButton();
  fireEvent.pointerDown(button);
  await screen.findByText('Listening');
  await heldLongEnough();
  return button;
}

describe('Voice Note on the Shopping List', () => {
  let session: ReturnType<typeof fakeSession>;

  beforeEach(() => {
    resetVoiceNote();
    session = fakeSession();
    mic.start.mockReset();
    mic.start.mockImplementation(() => Promise.resolve(session));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('is hidden when voice is not configured', async () => {
    setup({ configured: false });
    renderWithProviders(<ShoppingPage />);
    await screen.findByText('Your list is empty');
    expect(
      screen.queryByRole('button', { name: /hold to record a voice note/i }),
    ).toBeNull();
  });

  it('records while held, shows the elapsed time, and sends on release', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { sent } = setup();
    renderWithProviders(<ShoppingPage />);

    const button = await hold();
    expect(screen.getByRole('status')).toHaveTextContent(/Listening\s*0:00/);
    await act(() => vi.advanceTimersByTimeAsync(7000));
    expect(screen.getByRole('status')).toHaveTextContent(
      /Listening\s*0:07\s*\/ 1:00/,
    );
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(mic.start).toHaveBeenCalledTimes(1);
    expect(sent).toHaveLength(0);

    fireEvent.pointerUp(button);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('What I heard');
    expect(session.stop).toHaveBeenCalledTimes(1);
    expect(sent).toHaveLength(1);
    expect(sent[0].get('scanLanguage')).toBe('en');
    expect(sent[0].get('locale')).toBe('en');
    expect(sent[0].get('defaultTarget')).toBe('shopping');
    expect(sent[0].get('today')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sent[0].get('durationMs')).toBe('3000');
    expect((sent[0].get('audio') as File).name).toBe('voice-note.webm');

    await userEvent.click(screen.getByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('cancels without sending when the pointer is dragged off the button', async () => {
    const { sent } = setup();
    renderWithProviders(<ShoppingPage />);

    const button = await hold();
    fireEvent.pointerLeave(button);
    await waitFor(() => expect(session.cancel).toHaveBeenCalledTimes(1));
    fireEvent.pointerUp(button);

    expect(screen.queryByText('Listening')).toBeNull();
    expect(session.stop).not.toHaveBeenCalled();
    expect(sent).toHaveLength(0);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('cancels the recording and sends nothing when released before the microphone is ready', async () => {
    const { sent } = setup();
    let ready: (s: ReturnType<typeof fakeSession>) => void = () => {};
    mic.start.mockImplementation(
      () => new Promise((resolve) => (ready = resolve)),
    );
    renderWithProviders(<ShoppingPage />);

    const button = await talkButton();
    fireEvent.pointerDown(button);
    fireEvent.pointerUp(button);
    await act(async () => ready(session));

    await waitFor(() => expect(session.cancel).toHaveBeenCalledTimes(1));
    expect(session.stop).not.toHaveBeenCalled();
    expect(sent).toHaveLength(0);
    expect(screen.queryByText('Listening')).toBeNull();
  });

  it('shows Starting… until the stream is live, then Listening', async () => {
    setup();
    let ready: (s: ReturnType<typeof fakeSession>) => void = () => {};
    mic.start.mockImplementation(
      () => new Promise((resolve) => (ready = resolve)),
    );
    renderWithProviders(<ShoppingPage />);

    fireEvent.pointerDown(await talkButton());
    expect(await screen.findByText('Starting…')).toBeVisible();
    expect(screen.queryByText('Listening')).toBeNull();

    await act(async () => ready(session));
    expect(await screen.findByText('Listening')).toBeVisible();
    expect(screen.queryByText('Starting…')).toBeNull();
  });

  it('treats a release under 0.3 s as a tap: nothing sent, and a tip', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { sent } = setup();
    renderWithProviders(<ShoppingPage />);

    const button = await talkButton();
    fireEvent.pointerDown(button);
    await screen.findByText('Listening');
    await act(() => vi.advanceTimersByTimeAsync(150));
    fireEvent.pointerUp(button);

    expect(
      await screen.findByText('Hold to talk, let go to send'),
    ).toBeVisible();
    expect(session.stop).not.toHaveBeenCalled();
    expect(session.cancel).toHaveBeenCalledTimes(1);
    expect(sent).toHaveLength(0);
    expect(screen.queryByText('Listening')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();

    await act(() => vi.advanceTimersByTimeAsync(1800));
    expect(screen.queryByText('Hold to talk, let go to send')).toBeNull();
  });

  it('drives the meter from the microphone level and names the target list', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setup();
    session.level.mockReturnValue(1);
    renderWithProviders(<ShoppingPage />);

    await hold();
    await act(() => vi.advanceTimersByTimeAsync(200));

    const bars = screen.getByTestId('level-meter').children;
    expect(bars).toHaveLength(30);
    // Newest on the right; silence on the left.
    expect((bars[29] as HTMLElement).style.height).toBe('38px');
    expect((bars[0] as HTMLElement).style.height).toBe('3px');
    const card = screen.getByRole('status');
    expect(card).toHaveTextContent('Let go to send · slide off to cancel');
    expect(card).toHaveTextContent(
      'Goes to your Shopping List. Say “in the pantry” to add stock.',
    );
    expect(card).toHaveTextContent('EN');
  });

  it('stops itself and sends at 60 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { sent } = setup();
    renderWithProviders(<ShoppingPage />);

    await hold();
    await act(() => vi.advanceTimersByTimeAsync(59_000));
    expect(session.stop).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1_000));

    expect(session.stop).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('dialog')).toHaveTextContent('What I heard');
    expect(sent).toHaveLength(1);
  });

  it('explains why the microphone is needed on first use, then asks for it', async () => {
    setup({ explained: false });
    renderWithProviders(<ShoppingPage />);

    fireEvent.pointerDown(await talkButton());
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent(/microphone/i);
    expect(mic.start).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Allow microphone' }),
    );
    // Asking now keeps the browser's prompt out of the first hold.
    await waitFor(() => expect(mic.start).toHaveBeenCalledTimes(1));
    expect(session.cancel).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('pp.voice.micExplained')).not.toBeNull();
  });

  it('shows how to allow the microphone when permission is denied', async () => {
    setup();
    mic.start.mockRejectedValue(new MicrophoneError('denied'));
    renderWithProviders(<ShoppingPage />);

    fireEvent.pointerDown(await talkButton());

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/microphone is blocked/i);
    expect(alert).toHaveTextContent(/browser settings/i);
  });

  it('says so, and opens no sheet, when nothing was heard', async () => {
    setup({
      note: () =>
        Response.json(
          { code: 'voice.nothing_heard', params: {} },
          { status: 422 },
        ),
    });
    renderWithProviders(<ShoppingPage />);

    fireEvent.pointerUp(await hold());

    expect(
      await screen.findByText("Didn't catch anything, try again"),
    ).toBeVisible();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps a recording that failed to send, and sends it again on Retry', async () => {
    let attempt = 0;
    const { sent } = setup({
      note: () =>
        ++attempt === 1
          ? Response.json(
              { code: 'voice.provider_unavailable', params: {} },
              { status: 502 },
            )
          : Response.json({ transcript: 'two yogurts', actions: [] }),
    });
    renderWithProviders(<ShoppingPage />);

    fireEvent.pointerUp(await hold());
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/not available/i);
    expect(screen.queryByRole('dialog')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('dialog')).toHaveTextContent('What I heard');
    expect(sent).toHaveLength(2);
    // The same recording is sent again: the microphone is not asked twice.
    expect(mic.start).toHaveBeenCalledTimes(1);
    expect(session.stop).toHaveBeenCalledTimes(1);
  });

  it('does not offer Retry for a Voice Cap that is used up', async () => {
    setup({
      note: () =>
        Response.json(
          { code: 'voice.cap_reached', params: { cap: 50 } },
          { status: 429 },
        ),
    });
    renderWithProviders(<ShoppingPage />);

    fireEvent.pointerUp(await hold());

    expect(await screen.findByRole('alert')).toHaveTextContent(/50/);
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it('changes the stored Scan Language from the chip menu, with a toast', async () => {
    setup();
    renderWithProviders(<ShoppingPage />);

    const chip = await screen.findByRole('button', {
      name: 'Scan Language: English. Change',
    });
    await userEvent.click(chip);
    const items = screen.getAllByRole('menuitemradio');
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining('English'),
      expect.stringContaining('Română'),
      expect.stringContaining('Dansk'),
    ]);
    expect(items[0]).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(screen.getByRole('menuitemradio', { name: /Dansk/ }));

    expect(
      await screen.findByText(
        'Scan Language: Danish · Used for Voice Notes and the camera.',
      ),
    ).toBeVisible();
    expect(screen.queryByRole('menu')).toBeNull();
    const changed = screen.getByRole('button', {
      name: 'Scan Language: Danish. Change',
    });
    expect(changed).toHaveFocus();
    // The camera reads the same stored value.
    expect(
      JSON.parse(localStorage.getItem('pocket-pantry.scan-language') ?? '{}'),
    ).toEqual({ locale: 'en', language: 'da' });
  });

  it('closes the language menu with Escape and returns focus to the chip', async () => {
    setup();
    renderWithProviders(<ShoppingPage />);
    const chip = await screen.findByRole('button', {
      name: 'Scan Language: English. Change',
    });
    await userEvent.click(chip);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(chip).toHaveFocus();
  });

  it('reads in the stored Scan Language and offers the chip', async () => {
    localStorage.setItem(
      'pocket-pantry.scan-language',
      JSON.stringify({ locale: 'en', language: 'ro' }),
    );
    const { sent } = setup();
    renderWithProviders(<ShoppingPage />);

    const chip = await screen.findByRole('button', {
      name: 'Scan Language: Romanian. Change',
    });
    expect(chip).toHaveTextContent('ro');
    fireEvent.pointerUp(await hold());
    await screen.findByRole('dialog');
    expect(sent[0].get('scanLanguage')).toBe('ro');
  });
});

const catalogItem = (id: string, name: string) => ({
  id,
  name,
  owner: 'catalog',
  defaultUnit: 'pcs',
  amountScale: 'medium',
  leafCategory: { id: 'leaf', name: 'Dairy' },
  parentCategory: {
    id: 'parent',
    name: 'Dairy and eggs',
    aisle: { id: 'aisle', name: 'Dairy' },
  },
  defaults: { expiryDays: null, location: null },
});
const eggs = catalogItem('ing-eggs', 'Eggs');
const milk = catalogItem('ing-milk', 'Milk');

const action = (overrides: Record<string, unknown>) => ({
  id: 'a1',
  status: 'ready',
  target: 'shopping',
  op: 'add',
  text: 'eggs',
  ingredient: eggs,
  name: null,
  quantity: null,
  unit: null,
  scope: null,
  expiresOn: null,
  noExpiry: false,
  location: null,
  rows: { shoppingItem: null },
  defaults: {},
  ...overrides,
});
const didntUnderstand = (id: string, text: string) =>
  action({
    id,
    status: 'notUnderstood',
    target: null,
    op: null,
    text,
    ingredient: null,
  });

const threeAdds = [
  action({ id: 'a1' }),
  action({
    id: 'a2',
    text: 'two litres of milk',
    ingredient: milk,
    quantity: 2,
    unit: 'l',
  }),
  action({
    id: 'a3',
    text: 'quinoa crackers',
    ingredient: null,
    name: 'Quinoa crackers',
  }),
];

describe('Reviewing a Voice Note on the Shopping List', () => {
  let session: ReturnType<typeof fakeSession>;
  let applied: unknown[];
  let listFetches: number;

  function setupReview(
    actions: unknown[],
    apply: () => Response = () =>
      Response.json(
        { applied: ['a1', 'a2', 'a3'], skipped: [] },
        { status: 201 },
      ),
  ) {
    localStorage.setItem('pp.voice.micExplained', '1');
    applied = [];
    listFetches = 0;
    const { fetchMock } = stubApi({
      'GET /api/shopping-list': () => {
        listFetches += 1;
        return Response.json(emptyList);
      },
      'GET /api/voice/config': () => Response.json({ configured: true }),
      'GET /api/catalog/search': () => Response.json({ results: [eggs, milk] }),
      'GET /api/catalog/aisles': () => Response.json({ aisles: [] }),
      'POST /api/voice': () =>
        Response.json(
          {
            transcript: 'eggs, two litres of milk and quinoa crackers',
            actions,
          },
          { status: 201 },
        ),
      'POST /api/voice/apply': () => apply(),
    });
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
      if (
        String(input).endsWith('/voice/apply') &&
        typeof init?.body === 'string'
      ) {
        applied.push(JSON.parse(init.body));
      }
      return fetchMock(input, init);
    });
  }

  async function openReview() {
    renderWithProviders(<ShoppingPage />);
    const button = await talkButton();
    fireEvent.pointerDown(button);
    await screen.findByText('Listening');
    await heldLongEnough();
    fireEvent.pointerUp(button);
    return screen.findByRole('dialog');
  }

  beforeEach(() => {
    resetVoiceNote();
    session = fakeSession();
    mic.start.mockReset();
    mic.start.mockImplementation(() => Promise.resolve(session));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('groups the Voice Actions under their list, with the transcript collapsed under What I heard', async () => {
    setupReview([...threeAdds, didntUnderstand('a4', 'do a dance')]);
    const dialog = await openReview();

    const shopping = within(
      await within(dialog).findByRole('region', { name: 'Shopping List' }),
    );
    expect(shopping.getAllByRole('listitem')).toHaveLength(3);
    expect(shopping.getByText('Eggs')).toBeVisible();
    expect(shopping.getByText('Quinoa crackers')).toBeVisible();
    expect(shopping.getByLabelText(/^Amount of Milk/)).toHaveValue('2');
    expect(
      shopping.getByRole('button', { name: 'Unit: L' }),
    ).toBeInTheDocument();

    const unclear = within(
      within(dialog).getByRole('region', { name: "Didn't understand" }),
    );
    expect(unclear.getByText('do a dance')).toBeVisible();
    expect(unclear.queryByRole('button')).toBeNull();

    expect(dialog).not.toHaveTextContent('two litres of milk and quinoa');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'What I heard' }),
    );
    expect(dialog).toHaveTextContent(
      'eggs, two litres of milk and quinoa crackers',
    );
  });

  it('applies the edited quantity and unit, refreshes the list and says what was added', async () => {
    setupReview(threeAdds);
    const dialog = await openReview();
    const before = listFetches;

    const quantity = await within(dialog).findByLabelText(/^Amount of Eggs/);
    await userEvent.type(quantity, '12');
    await userEvent.click(
      within(dialog).getAllByRole('button', { name: /^Unit: / })[0],
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'pcs' }));
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Apply' }),
    );

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(applied).toHaveLength(1);
    expect(applied[0]).toMatchObject({
      actions: [
        { id: 'a1', ingredientId: 'ing-eggs', quantity: 12, unit: 'pcs' },
        { id: 'a2', ingredientId: 'ing-milk', quantity: 2, unit: 'l' },
        { id: 'a3', ingredientId: null, name: 'Quinoa crackers' },
      ],
    });
    expect(await screen.findByText(/Applied 3 voice actions/)).toBeVisible();
    await waitFor(() => expect(listFetches).toBeGreaterThan(before));
  });

  it('shows an error and blocks Apply while a quantity is invalid, then applies once fixed', async () => {
    setupReview(threeAdds);
    const dialog = await openReview();
    const apply = within(dialog).getByRole('button', { name: 'Apply' });
    const quantity = await within(dialog).findByLabelText(/^Amount of Milk/);

    await userEvent.clear(quantity);
    await userEvent.type(quantity, '0');
    expect(
      within(dialog).getByText(/Enter an amount from 0.001/),
    ).toBeVisible();
    expect(apply).toBeDisabled();

    await userEvent.clear(quantity);
    await userEvent.type(quantity, 'abc');
    expect(apply).toBeDisabled();

    await userEvent.clear(quantity);
    await userEvent.type(quantity, '3');
    expect(within(dialog).queryByText(/Enter an amount from/)).toBeNull();
    expect(apply).toBeEnabled();
    await userEvent.click(apply);

    await waitFor(() => expect(applied).toHaveLength(1));
    expect(applied[0]).toMatchObject({
      actions: [{}, { id: 'a2', quantity: 3 }, {}],
    });
  });

  it('lets the Member fix a Match with the catalog search', async () => {
    setupReview(threeAdds);
    const dialog = await openReview();

    await userEvent.click(
      await within(dialog).findByRole('button', {
        name: 'Change match for Quinoa crackers',
      }),
    );
    const search = await screen.findByRole('combobox');
    await userEvent.type(search, 'milk');
    await userEvent.click(await screen.findByRole('option', { name: /Milk/ }));

    const shopping = within(
      await within(dialog).findByRole('region', { name: 'Shopping List' }),
    );
    expect(shopping.queryByText('Quinoa crackers')).toBeNull();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Apply' }),
    );
    await waitFor(() => expect(applied).toHaveLength(1));
    expect(applied[0]).toMatchObject({
      actions: expect.arrayContaining([
        expect.objectContaining({
          id: 'a3',
          ingredientId: 'ing-milk',
          name: null,
        }),
      ]) as unknown,
    });
  });

  it('drops a removed Voice Action from Apply', async () => {
    setupReview(threeAdds);
    const dialog = await openReview();

    await userEvent.click(
      await within(dialog).findByRole('button', { name: 'Remove Eggs' }),
    );
    expect(within(dialog).queryByText('Eggs')).toBeNull();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Apply' }),
    );

    await waitFor(() => expect(applied).toHaveLength(1));
    expect(
      (applied[0] as { actions: { id: string }[] }).actions.map((a) => a.id),
    ).toEqual(['a2', 'a3']);
  });

  it('discards the Voice Note without applying anything', async () => {
    setupReview(threeAdds);
    const dialog = await openReview();

    await userEvent.click(
      await within(dialog).findByRole('button', { name: 'Discard' }),
    );

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(applied).toHaveLength(0);
  });

  it('opens Review even when nothing was understood, with nothing to apply', async () => {
    setupReview([didntUnderstand('a1', 'do a dance')]);
    const dialog = await openReview();

    expect(
      await within(dialog).findByRole('region', { name: "Didn't understand" }),
    ).toHaveTextContent('do a dance');
    expect(
      within(dialog).queryByRole('region', { name: 'Shopping List' }),
    ).toBeNull();
    expect(
      within(dialog).getByRole('button', { name: 'Apply' }),
    ).toBeDisabled();
  });

  it('names what was skipped in the result toast', async () => {
    setupReview(threeAdds, () =>
      Response.json(
        {
          applied: ['a1', 'a2'],
          skipped: [{ id: 'a3', reason: 'shopping.quantity_too_large' }],
        },
        { status: 201 },
      ),
    );
    const dialog = await openReview();

    await userEvent.click(
      await within(dialog).findByRole('button', { name: 'Apply' }),
    );

    const toast = await screen.findByText(/Applied 2 voice actions/);
    expect(toast).toHaveTextContent(/Skipped: Quinoa crackers/);
  });

  describe('every other Shopping List Voice Action', () => {
    const onList = (quantity: number | null = null) => ({
      id: 'row-1',
      name: 'Eggs',
      quantity,
      unit: null,
      checked: false,
    });
    const opRow = (dialog: HTMLElement, name: string) =>
      within(within(dialog).getByRole('region', { name: 'Shopping List' }))
        .getByText(name)
        .closest('li') as HTMLElement;

    it('shows set quantity with its editable amount', async () => {
      setupReview([
        action({
          op: 'setQuantity',
          text: 'make the eggs twelve',
          quantity: 12,
          unit: 'pcs',
          rows: { shoppingItem: onList(6) },
        }),
      ]);
      const dialog = await openReview();
      const row = within(await within(dialog).findByRole('listitem'));
      expect(row.getByText('Set quantity')).toBeVisible();
      expect(row.getByLabelText(/^Amount of Eggs/)).toHaveValue('12');
    });

    it('shows check, and Add & check when it is not on the list', async () => {
      setupReview([
        action({ id: 'a1', op: 'check', rows: { shoppingItem: onList() } }),
        action({
          id: 'a2',
          op: 'check',
          text: 'bread',
          ingredient: null,
          name: 'Bread',
          rows: { shoppingItem: null },
        }),
      ]);
      const dialog = await openReview();
      expect(within(opRow(dialog, 'Eggs')).getByText('Check')).toBeVisible();
      expect(
        within(opRow(dialog, 'Bread')).getByText('Add & check'),
      ).toBeVisible();
    });

    it('shows uncheck and remove without an amount field', async () => {
      setupReview([
        action({ id: 'a1', op: 'uncheck', rows: { shoppingItem: onList() } }),
        action({
          id: 'a2',
          op: 'remove',
          text: 'milk',
          ingredient: milk,
          rows: { shoppingItem: { ...onList(), name: 'Milk' } },
        }),
      ]);
      const dialog = await openReview();
      const uncheck = within(opRow(dialog, 'Eggs'));
      expect(uncheck.getByText('Uncheck')).toBeVisible();
      expect(uncheck.queryByLabelText(/^Amount of/)).toBeNull();
      const remove = within(opRow(dialog, 'Milk'));
      expect(remove.getByText('Remove from list')).toBeVisible();
      expect(remove.queryByLabelText(/^Amount of/)).toBeNull();
    });

    it('shows Not found: … for nothing to act on and does not send it on Apply', async () => {
      setupReview([
        action({ id: 'a1', op: 'remove', status: 'notFound' }),
        action({ id: 'a2', op: 'check', text: 'milk', ingredient: milk }),
      ]);
      const dialog = await openReview();
      expect(await within(dialog).findByText('Not found: Eggs')).toBeVisible();
      await userEvent.click(
        within(dialog).getByRole('button', { name: 'Apply' }),
      );
      await waitFor(() => expect(applied).toHaveLength(1));
      expect(
        (applied[0] as { actions: { id: string }[] }).actions.map((a) => a.id),
      ).toEqual(['a2']);
    });

    it('sends the op with the quantity on Apply, and names a partly skipped Apply in the toast', async () => {
      setupReview(
        [
          action({
            id: 'a1',
            op: 'setQuantity',
            quantity: 12,
            unit: 'pcs',
            rows: { shoppingItem: onList(6) },
          }),
          action({
            id: 'a2',
            op: 'uncheck',
            text: 'milk',
            ingredient: milk,
            rows: { shoppingItem: { ...onList(), name: 'Milk' } },
          }),
        ],
        () =>
          Response.json(
            {
              applied: ['a1'],
              skipped: [{ id: 'a2', reason: 'voice.item_not_found' }],
            },
            { status: 201 },
          ),
      );
      const dialog = await openReview();
      await userEvent.click(
        await within(dialog).findByRole('button', { name: 'Apply' }),
      );
      const toast = await screen.findByText(/Applied 1 voice action\./);
      expect(toast).toHaveTextContent(
        /Skipped: Milk \(no longer on the list\)/,
      );
      expect(applied[0]).toMatchObject({
        actions: [
          { id: 'a1', op: 'setQuantity', quantity: 12, unit: 'pcs' },
          { id: 'a2', op: 'uncheck', ingredientId: 'ing-milk' },
        ],
      });
    });
  });
});
