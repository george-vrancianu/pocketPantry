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
import {
  holdFor,
  holdLongEnough,
  pressDown,
  useVoiceTimers,
} from '../../test/voiceHold';
import { renderWithProviders, stubApi } from '../../test/render';
import { stubMotion } from '../../test/viewport';
import { resetRowFlash } from '../../lib/rowFlash';
import { getVoiceNoteState, resetVoiceNote } from '../../lib/voiceNoteStore';
import { ShoppingPage } from './ShoppingPage';

// jsdom has no getUserMedia or MediaRecorder: the microphone module is the seam.
const mic = vi.hoisted(() => ({ start: vi.fn() }));
vi.mock('../../lib/microphone', () => ({
  startRecording: mic.start,
  permissionState: vi.fn(async () => 'granted'),
  requestPermission: vi.fn(async () => undefined),
  watchPermission: () => () => {},
  MicrophoneError: class MicrophoneError extends Error {
    constructor(readonly reason: string) {
      super(reason);
    }
  },
}));

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
};

function setup({ configured = true, note }: Setup = {}) {
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
  pressDown(button);
  await screen.findByText('Listening');
  await holdLongEnough();
  return button;
}

describe('Voice Note on the Shopping List', () => {
  let session: ReturnType<typeof fakeSession>;

  beforeEach(() => {
    useVoiceTimers();
    resetVoiceNote();
    resetRowFlash();
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
    await userEvent.click(screen.getByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('cancels the recording and sends nothing when released before the microphone is ready', async () => {
    const { sent } = setup();
    let ready: (s: ReturnType<typeof fakeSession>) => void = () => {};
    mic.start.mockImplementation(
      () => new Promise((resolve) => (ready = resolve)),
    );
    renderWithProviders(<ShoppingPage />);

    const button = await talkButton();
    pressDown(button);
    // The permission check comes first, so the microphone is asked for a moment after the press.
    await screen.findByText('Starting…');
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

    pressDown(await talkButton());
    expect(await screen.findByText('Starting…')).toBeVisible();
    expect(screen.queryByText('Listening')).toBeNull();

    await act(async () => ready(session));
    expect(await screen.findByText('Listening')).toBeVisible();
    expect(screen.queryByText('Starting…')).toBeNull();
  });

  it('treats a release under 0.3 s as a tap: nothing sent, and a tip', async () => {
    const { sent } = setup();
    renderWithProviders(<ShoppingPage />);

    const button = await talkButton();
    pressDown(button);
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

  it('counts 299 ms as a tap and 300 ms as a Voice Note', async () => {
    // A clock that only moves when told to, so the boundary is exact.
    const { sent } = setup();
    renderWithProviders(<ShoppingPage />);
    const button = await talkButton();
    vi.useFakeTimers();

    pressDown(button);
    await holdFor(299);
    fireEvent.pointerUp(button);
    await holdFor(0);
    expect(screen.getByText('Hold to talk, let go to send')).toBeVisible();
    expect(sent).toHaveLength(0);
    await holdFor(2000);

    // A fast microphone: the audio is exactly as long as the hold.
    session.stop.mockResolvedValue({ ...recording, durationMs: 300 });
    pressDown(button);
    await holdFor(300);
    fireEvent.pointerUp(button);
    await holdFor(100);
    expect(sent).toHaveLength(1);
  });

  it('ends with the tip, not an Alert, when the microphone recorded too little', async () => {
    const { sent } = setup();
    session.stop.mockResolvedValue({ ...recording, durationMs: 200 });
    renderWithProviders(<ShoppingPage />);
    const button = await talkButton();

    pressDown(button);
    await screen.findByText('Listening');
    await holdFor(350);
    fireEvent.pointerUp(button);

    expect(
      await screen.findByText('Hold to talk, let go to send'),
    ).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(sent).toHaveLength(0);
  });

  it('ends with the tip when let go after 0.3 s but before the stream is live', async () => {
    const { sent } = setup();
    let ready: (s: ReturnType<typeof fakeSession>) => void = () => {};
    mic.start.mockImplementation(
      () => new Promise((resolve) => (ready = resolve)),
    );
    renderWithProviders(<ShoppingPage />);
    const button = await talkButton();

    pressDown(button);
    await screen.findByText('Starting…');
    await holdFor(400);
    fireEvent.pointerUp(button);
    await act(async () => ready(session));

    expect(
      await screen.findByText('Hold to talk, let go to send'),
    ).toBeVisible();
    expect(session.cancel).toHaveBeenCalledTimes(1);
    expect(session.stop).not.toHaveBeenCalled();
    expect(screen.queryByText('Starting…')).toBeNull();
    expect(screen.queryByText('Listening')).toBeNull();
    expect(sent).toHaveLength(0);
  });

  it('drives the meter from the microphone level and names the target list', async () => {
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

const done = (
  actionId: string,
  list: 'shopping' | 'pantry' = 'shopping',
  extra: Record<string, unknown> = {},
) => ({
  actionId,
  list,
  rowId: `row-${actionId}`,
  alreadyDone: false,
  ...extra,
});
const appliedAll = {
  applied: [done('a1'), done('a2'), done('a3')],
  skipped: [],
};

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
    apply: () => Response = () => Response.json(appliedAll, { status: 201 }),
    list: unknown = emptyList,
  ) {
    applied = [];
    listFetches = 0;
    const { fetchMock } = stubApi({
      'GET /api/shopping-list': () => {
        listFetches += 1;
        return Response.json(list);
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
    pressDown(button);
    await screen.findByText('Listening');
    await holdLongEnough();
    fireEvent.pointerUp(button);
    return screen.findByRole('dialog');
  }

  beforeEach(() => {
    useVoiceTimers();
    resetVoiceNote();
    resetRowFlash();
    session = fakeSession();
    mic.start.mockReset();
    mic.start.mockImplementation(() => Promise.resolve(session));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** The button that opens a row: the only one with aria-expanded. */
  const headerOf = (row: HTMLElement) =>
    within(row)
      .getAllByRole('button')
      .find((b) => b.hasAttribute('aria-expanded')) as HTMLElement;

  /** The row of an Ingredient: its verb and name, and the line under them. */
  const rowOf = (dialog: ReturnType<typeof within>, name: string) =>
    dialog.getByText(name, { selector: 'b' }).closest('li') as HTMLElement;

  it('opens a tall Review that the scrim and Escape cannot close, and says nothing is saved yet', async () => {
    setupReview(threeAdds);
    const dialog = await openReview();

    expect(dialog).toHaveAccessibleName('Review');
    expect(
      await within(dialog).findByText(
        '3 changes · nothing is saved until you Apply',
      ),
    ).toBeVisible();

    const scrim = document.querySelector('.MuiBackdrop-root') as HTMLElement;
    await userEvent.click(scrim);
    expect(screen.getByRole('dialog')).toBeVisible();

    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement),
    );
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(within(dialog).getByText('Discard this Voice Note?')).toBeVisible();
    expect(
      within(dialog).getByText(
        "Nothing changes, and you'll have to say it again.",
      ),
    ).toBeVisible();
    expect(within(dialog).queryByRole('button', { name: /^Apply/ })).toBeNull();
  });

  it('keeps reviewing when the Discard confirmation is declined, and discards on confirm with a toast', async () => {
    setupReview(threeAdds);
    const dialog = within(await openReview());

    await userEvent.click(dialog.getByRole('button', { name: 'Discard' }));
    await userEvent.click(
      dialog.getByRole('button', { name: 'Keep reviewing' }),
    );
    expect(
      dialog.getByRole('button', { name: 'Apply 3 changes' }),
    ).toBeVisible();

    await userEvent.click(dialog.getByRole('button', { name: 'Discard' }));
    await userEvent.click(dialog.getByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(applied).toHaveLength(0);
    expect(
      await screen.findByText('Voice Note discarded · Nothing was changed.'),
    ).toBeVisible();
  });

  it('shows What I heard collapsed to its first line, and opens it to the transcript and its language', async () => {
    setupReview(threeAdds);
    const dialog = within(await openReview());

    const heard = await dialog.findByRole('button', { name: /What I heard/ });
    expect(heard).toHaveAttribute('aria-expanded', 'false');
    expect(heard).toHaveTextContent(
      'eggs, two litres of milk and quinoa crackers',
    );
    expect(dialog.queryByText('English · 0:03')).toBeNull();

    await userEvent.click(heard);
    expect(heard).toHaveAttribute('aria-expanded', 'true');
    expect(dialog.getByText('English · 0:03')).toBeVisible();
    const transcript = dialog.getByText(
      'eggs, two litres of milk and quinoa crackers',
      { selector: 'p' },
    );
    expect(transcript).toHaveAttribute('lang', 'en');
  });

  it('says what every Shopping List Voice Action will do on its second line', async () => {
    const item = (
      name: string,
      quantity: number | null,
      unit: string | null,
    ) => ({
      id: `row-${name}`,
      name,
      quantity,
      unit,
      checked: false,
    });
    const bread = catalogItem('ing-bread', 'Bread');
    const butter = catalogItem('ing-butter', 'Butter');
    const spinach = catalogItem('ing-spinach', 'Spinach');
    const rice = catalogItem('ing-rice', 'Rice');
    setupReview([
      action({
        id: 'c1',
        op: 'check',
        text: 'bread',
        ingredient: bread,
        rows: { shoppingItem: item('Bread', 1, 'pcs') },
      }),
      action({
        id: 'c2',
        op: 'check',
        text: 'milk',
        ingredient: milk,
        quantity: 2,
        unit: 'l',
        rows: { shoppingItem: item('Milk', 3, 'l') },
      }),
      action({
        id: 'c3',
        op: 'check',
        text: 'sausages',
        ingredient: null,
        name: 'Sausages',
        rows: { shoppingItem: null },
      }),
      action({
        id: 'c4',
        op: 'add',
        text: 'twelve eggs',
        quantity: 12,
        unit: 'pcs',
      }),
      action({
        id: 'c5',
        op: 'uncheck',
        text: 'butter',
        ingredient: butter,
        rows: { shoppingItem: item('Butter', null, null) },
      }),
      action({
        id: 'c6',
        op: 'remove',
        text: 'spinach',
        ingredient: spinach,
        rows: { shoppingItem: item('Spinach', 200, 'g') },
      }),
      action({
        id: 'c7',
        op: 'setQuantity',
        text: 'rice',
        ingredient: rice,
        quantity: 12,
        unit: 'pcs',
        rows: { shoppingItem: item('Rice', 6, 'pcs') },
      }),
    ]);
    const dialog = within(await openReview());
    await dialog.findByText('Bread', { selector: 'b' });

    const line = (name: string) => rowOf(dialog, name).textContent;
    expect(line('Bread')).toBe('Tick BreadOn your list · 1 pcs');
    expect(line('Milk')).toBe('Tick Milk2 L, list said 3 L');
    expect(line('Sausages')).toBe(
      "Add, ticked SausagesNot on your list, so it's added ticked",
    );
    expect(line('Eggs')).toBe('Add Eggs12 pcs');
    expect(line('Butter')).toBe('Untick ButterBack on your list');
    expect(line('Spinach')).toBe('Remove SpinachComes off your list · 200 g');
    expect(line('Rice')).toBe('Change Rice12 pcs, list said 6 pcs');
  });

  it('drops a change from this Review only, so it is not applied', async () => {
    setupReview(threeAdds);
    const dialog = within(await openReview());

    await userEvent.click(
      await dialog.findByRole('button', { name: 'Drop this change: Add Eggs' }),
    );
    expect(dialog.queryByText('Eggs', { selector: 'b' })).toBeNull();
    expect(
      dialog.getByText('2 changes · nothing is saved until you Apply'),
    ).toBeVisible();
    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 2 changes' }),
    );

    await waitFor(() => expect(applied).toHaveLength(1));
    expect(
      (applied[0] as { actions: { id: string }[] }).actions.map((a) => a.id),
    ).toEqual(['a2', 'a3']);
  });

  it('shows what could not be applied as read-only entries that can be hidden', async () => {
    setupReview([
      action({
        id: 'a1',
        op: 'check',
        text: 'milk',
        ingredient: milk,
        rows: {
          shoppingItem: {
            id: 'r',
            name: 'Milk',
            quantity: null,
            unit: null,
            checked: false,
          },
        },
      }),
      action({
        id: 'a2',
        op: 'remove',
        status: 'notFound',
        text: 'cheddar',
        ingredient: null,
        name: 'Cheddar',
      }),
      didntUnderstand('a3', 'do a dance'),
    ]);
    const dialog = within(await openReview());

    const couldnt = within(
      await dialog.findByRole('region', { name: "Couldn't apply" }),
    );
    expect(couldnt.getAllByRole('listitem')).toHaveLength(2);
    expect(couldnt.getByText(/Not found:/).closest('li')).toHaveTextContent(
      'Not found: “cheddar”No Cheddar on your list.',
    );
    expect(couldnt.getByText('No Cheddar on your list.')).toBeVisible();
    expect(
      couldnt.getByText(/Didn't understand:/).closest('li'),
    ).toHaveTextContent("Didn't understand: “do a dance”");
    // Read-only: only the × is a button.
    expect(couldnt.getAllByRole('button')).toHaveLength(2);

    await userEvent.click(
      couldnt.getByRole('button', { name: 'Hide this entry: do a dance' }),
    );
    expect(dialog.queryByText(/do a dance/)).toBeNull();
    // They never counted as changes.
    expect(
      dialog.getByText('1 change · nothing is saved until you Apply'),
    ).toBeVisible();
    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 1 change' }),
    );
    await waitFor(() => expect(applied).toHaveLength(1));
    expect(
      (applied[0] as { actions: { id: string }[] }).actions.map((a) => a.id),
    ).toEqual(['a1']);
  });

  it('opens one row at a time and shows what was heard, with line 2 following each edit', async () => {
    setupReview(threeAdds);
    const dialog = within(await openReview());
    const header = (name: string) => headerOf(rowOf(dialog, name));

    await userEvent.click(header('Eggs'));
    expect(header('Eggs')).toHaveAttribute('aria-expanded', 'true');
    expect(dialog.getByText(/Heard:/)).toHaveTextContent('Heard: “eggs”');

    await userEvent.click(header('Milk'));
    expect(header('Eggs')).toHaveAttribute('aria-expanded', 'false');
    expect(header('Milk')).toHaveAttribute('aria-expanded', 'true');
    expect(dialog.getAllByText(/Heard:/)).toHaveLength(1);

    await userEvent.click(header('Eggs'));
    await userEvent.type(dialog.getByLabelText('Amount of Eggs'), '12');
    await userEvent.click(dialog.getByRole('button', { name: 'pcs' }));
    expect(rowOf(dialog, 'Eggs').textContent).toContain('12 pcs');
    await userEvent.click(dialog.getByRole('button', { name: 'Done' }));
    expect(header('Eggs')).toHaveAttribute('aria-expanded', 'false');
  });

  it('applies the edited amount and unit, refreshes the list and says what was added', async () => {
    setupReview(threeAdds);
    const dialog = within(await openReview());
    const before = listFetches;

    await userEvent.click(headerOf(rowOf(dialog, 'Eggs')));
    await userEvent.type(dialog.getByLabelText('Amount of Eggs'), '12');
    await userEvent.click(dialog.getByRole('button', { name: 'pcs' }));
    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 3 changes' }),
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
    expect(await screen.findByText('3 applied')).toBeVisible();
    await waitFor(() => expect(listFetches).toBeGreaterThan(before));
  });

  it('clears the amount to mean no amount, and blocks Apply while it cannot be read', async () => {
    setupReview(threeAdds);
    const dialog = within(await openReview());
    await userEvent.click(headerOf(rowOf(dialog, 'Milk')));
    const amount = dialog.getByLabelText('Amount of Milk');
    const apply = dialog.getByRole('button', { name: 'Apply 3 changes' });

    await userEvent.clear(amount);
    await userEvent.type(amount, '0');
    expect(dialog.getByText(/Enter an amount from 0.001/)).toBeVisible();
    expect(apply).toBeDisabled();

    await userEvent.clear(amount);
    expect(apply).toBeEnabled();
    expect(rowOf(dialog, 'Milk').textContent).toContain('No amount');
    await userEvent.click(apply);

    await waitFor(() => expect(applied).toHaveLength(1));
    expect(applied[0]).toMatchObject({
      actions: [{}, { id: 'a2', quantity: null, unit: null }, {}],
    });
  });

  it('swaps the shared Catalog search into the row to change the Ingredient', async () => {
    setupReview(threeAdds);
    const dialog = within(await openReview());
    await userEvent.click(headerOf(rowOf(dialog, 'Quinoa crackers')));
    expect(dialog.getByText('Unmatched')).toBeVisible();

    await userEvent.click(
      dialog.getByRole('button', {
        name: 'Change Ingredient: Quinoa crackers',
      }),
    );
    const search = await screen.findByRole('combobox');
    expect(search).toHaveValue('Quinoa crackers');
    await userEvent.clear(search);
    await userEvent.type(search, 'milk');
    await userEvent.click(await screen.findByRole('option', { name: /Milk/ }));

    expect(dialog.queryByText('Unmatched')).toBeNull();
    expect(dialog.queryByRole('combobox')).toBeNull();
    expect(dialog.queryByText('Quinoa crackers', { selector: 'b' })).toBeNull();
    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 3 changes' }),
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

  it('opens What I heard and offers only Discard when nothing was understood', async () => {
    setupReview([didntUnderstand('a1', 'do a dance')]);
    const dialog = within(await openReview());

    expect(await dialog.findByText('Nothing to apply')).toBeVisible();
    expect(
      dialog.getByRole('button', { name: /What I heard/ }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(dialog.getByRole('button', { name: 'Discard' })).toBeVisible();
    expect(dialog.queryByRole('button', { name: /^Apply/ })).toBeNull();
    expect(dialog.queryByRole('region', { name: 'Shopping List' })).toBeNull();
  });

  it('disables both buttons and shows Applying while the request is in flight', async () => {
    let finish: (response: Response) => void = () => {};
    setupReview(
      threeAdds,
      () =>
        new Promise<Response>(
          (resolve) => (finish = resolve),
        ) as unknown as Response,
    );
    const dialog = within(await openReview());

    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 3 changes' }),
    );
    const applying = await dialog.findByRole('button', { name: 'Applying' });
    expect(applying).toBeDisabled();
    expect(dialog.getByRole('button', { name: 'Discard' })).toBeDisabled();

    finish(Response.json(appliedAll, { status: 201 }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('ignores Escape, and freezes the rows, while Apply is in flight', async () => {
    let finish: (response: Response) => void = () => {};
    setupReview(
      threeAdds,
      () =>
        new Promise<Response>(
          (resolve) => (finish = resolve),
        ) as unknown as Response,
    );
    const dialog = within(await openReview());
    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 3 changes' }),
    );
    await dialog.findByRole('button', { name: 'Applying' });

    await userEvent.keyboard('{Escape}');
    expect(dialog.queryByText('Discard this Voice Note?')).toBeNull();
    expect(getVoiceNoteState().phase).toBe('applying');
    expect(
      dialog
        .getByRole('button', { name: 'Drop this change: Add Eggs' })
        .closest('[inert]'),
    ).not.toBeNull();

    finish(Response.json(appliedAll, { status: 201 }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByText(/Voice Note discarded/)).toBeNull();
  });

  it('closes only the Catalog search on Escape, not the Review', async () => {
    setupReview(threeAdds);
    const dialog = within(await openReview());
    await userEvent.click(
      dialog.getByRole('button', { name: /Eggs/, expanded: false }),
    );
    await userEvent.click(dialog.getByRole('button', { name: /Change/ }));
    expect(await dialog.findByRole('combobox')).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await userEvent.keyboard('{Escape}');
    expect(dialog.queryByText('Discard this Voice Note?')).toBeNull();
    expect(dialog.queryByRole('combobox')).toBeNull();
    expect(dialog.getByRole('button', { name: /Change/ })).toHaveFocus();
  });

  it('puts focus back on Discard after Keep reviewing', async () => {
    setupReview(threeAdds);
    const dialog = within(await openReview());
    await userEvent.click(dialog.getByRole('button', { name: 'Discard' }));
    await userEvent.click(
      dialog.getByRole('button', { name: 'Keep reviewing' }),
    );
    expect(dialog.getByRole('button', { name: 'Discard' })).toHaveFocus();
  });

  it('scrolls the alert into view when Apply fails', async () => {
    const scrolled = vi.fn();
    Element.prototype.scrollIntoView = scrolled;
    setupReview(threeAdds, () =>
      Response.json(
        { code: 'internal_error', message: 'boom' },
        { status: 500 },
      ),
    );
    const dialog = within(await openReview());
    scrolled.mockClear();
    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 3 changes' }),
    );
    const alert = await dialog.findByRole('alert');
    await waitFor(() => expect(scrolled.mock.contexts).toContain(alert));
    // @ts-expect-error test cleanup
    delete Element.prototype.scrollIntoView;
  });

  it('keeps the sheet and every edit when Apply fails, with an alert at the top', async () => {
    setupReview(threeAdds, () =>
      Response.json(
        { code: 'internal_error', message: 'boom' },
        { status: 500 },
      ),
    );
    const dialog = within(await openReview());
    await userEvent.click(headerOf(rowOf(dialog, 'Eggs')));
    await userEvent.type(dialog.getByLabelText('Amount of Eggs'), '12');
    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 3 changes' }),
    );

    expect(await dialog.findByRole('alert')).toBeVisible();
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(
      dialog.getByRole('button', { name: 'Apply 3 changes' }),
    ).toBeEnabled();
    expect(dialog.getByLabelText('Amount of Eggs')).toHaveValue('12');
    expect(getVoiceNoteState().phase).toBe('review');
  });

  const applyAll = async () => {
    const dialog = within(await openReview());
    await userEvent.click(
      await dialog.findByRole('button', { name: /^Apply \d+ changes?$/ }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  };

  it('names what was skipped in the result toast', async () => {
    setupReview(threeAdds, () =>
      Response.json(
        {
          applied: [done('a1'), done('a2')],
          skipped: [{ id: 'a3', reason: 'shopping.quantity_too_large' }],
        },
        { status: 201 },
      ),
    );
    await applyAll();
    expect(
      await screen.findByText(
        '2 applied, 1 skipped: quinoa crackers amount too large',
      ),
    ).toBeVisible();
  });

  it('names the first two skips and counts the rest', async () => {
    setupReview(
      [...threeAdds, action({ id: 'a4', text: 'bread', name: 'Bread' })],
      () =>
        Response.json(
          {
            applied: [done('a1')],
            skipped: [
              { id: 'a2', reason: 'voice.item_not_found' },
              { id: 'a3', reason: 'shopping.quantity_too_large' },
              { id: 'a4', reason: 'voice.invalid_action' },
            ],
          },
          { status: 201 },
        ),
    );
    await applyAll();
    expect(
      await screen.findByText(
        '1 applied, 3 skipped: milk no longer on the list, quinoa crackers amount too large, +1',
      ),
    ).toBeVisible();
  });

  it('splits the count by list, naming the page list first', async () => {
    setupReview(threeAdds, () =>
      Response.json(
        {
          applied: [done('a1'), done('a2', 'pantry'), done('a3')],
          skipped: [],
        },
        { status: 201 },
      ),
    );
    await applyAll();
    expect(
      await screen.findByText('3 applied: 2 on the list, 1 in the Pantry'),
    ).toBeVisible();
  });

  it('says in a second line which actions were already done', async () => {
    setupReview(
      [
        action({
          id: 'a1',
          op: 'check',
          text: 'got eggs',
          rows: { shoppingItem: { id: 'row-a1', checked: true } },
        }),
      ],
      () =>
        Response.json(
          {
            applied: [done('a1', 'shopping', { alreadyDone: true })],
            skipped: [],
          },
          { status: 201 },
        ),
    );
    await applyAll();
    expect(await screen.findByText('1 applied')).toBeVisible();
    expect(
      screen.getByText('Eggs was already ticked, so that one counts as done.'),
    ).toBeVisible();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('keeps the toast for 5.2 seconds without an Undo', async () => {
    setupReview(threeAdds);
    await applyAll();
    expect(await screen.findByText('3 applied')).toBeVisible();
    expect(screen.queryByRole('button', { name: /undo/i })).toBeNull();
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(screen.getByText('3 applied')).toBeVisible();
    await act(() => vi.advanceTimersByTimeAsync(1000));
    await waitFor(() => expect(screen.queryByText('3 applied')).toBeNull());
  });

  it('puts the result toast clear of the voice button', async () => {
    setupReview(threeAdds);
    await applyAll();
    await screen.findByText('3 applied');
    // jsdom's getComputedStyle ignores the responsive (media query) `bottom`, so the rule text is the only
    // place to read it; kept loose on purpose. 62 px button + 10 px gap above it, rather than just above the Dock.
    const css = Array.from(document.styleSheets)
      .flatMap((sheet) => Array.from(sheet.cssRules))
      .map((rule) => rule.cssText)
      .join('\n');
    expect(css).toMatch(/MuiSnackbar-root \{ bottom: calc\(72px \+/);
  });

  it('puts focus on the voice button after Apply and after Discard', async () => {
    setupReview(threeAdds);
    await applyAll();
    const button = await talkButton();
    await waitFor(() => expect(button).toHaveFocus());

    const dialog = within(await openReview());
    await userEvent.click(dialog.getByRole('button', { name: 'Discard' }));
    await userEvent.click(dialog.getByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(button).toHaveFocus());
  });

  describe('flashing the rows that changed', () => {
    const rows = {
      id: 'l1',
      groups: [
        {
          aisle: { id: 'aisle', name: 'Dairy', sortOrder: 1 },
          items: ['eggs', 'milk'].map((n) => ({
            id: `row-${n === 'eggs' ? 'a1' : 'a2'}`,
            ingredientId: `ing-${n}`,
            name: n === 'eggs' ? 'Eggs' : 'Milk',
            quantity: null,
            unit: null,
            checked: false,
            unmatched: false,
          })),
        },
      ],
      summary: { remaining: 2, checked: 0 },
    };
    // jsdom cannot paint, so the flash overlay is found by its marker attribute (it has no role or text).
    const flashed = () =>
      Array.from(document.querySelectorAll('[data-row-flash]')).map((el) =>
        el.closest('[role="group"]')?.getAttribute('aria-label'),
      );

    afterEach(() => stubMotion(false));

    it('flashes the rows the result names, once', async () => {
      setupReview(
        threeAdds,
        () =>
          Response.json(
            { applied: [done('a1')], skipped: [] },
            { status: 201 },
          ),
        rows,
      );
      await screen.findByText('Eggs').catch(() => undefined);
      await applyAll();
      await waitFor(() => expect(flashed()).toEqual(['Eggs']));
      // The tint sits behind the row's content: a negative z-index inside a host that is its own stacking
      // context (so it still lands above the opaque swipe surface, not behind it).
      const tint = document.querySelector('[data-row-flash]') as HTMLElement;
      expect(getComputedStyle(tint).zIndex).toBe('-1');
      expect(getComputedStyle(tint.parentElement!).isolation).toBe('isolate');
      expect(getComputedStyle(tint.parentElement!).position).toBe('relative');
      await act(() => vi.advanceTimersByTimeAsync(5000));
      expect(flashed()).toEqual([]);
    });

    it('flashes no row under reduced motion', async () => {
      stubMotion(true);
      setupReview(
        threeAdds,
        () =>
          Response.json(
            { applied: [done('a1'), done('a2')], skipped: [] },
            { status: 201 },
          ),
        rows,
      );
      await applyAll();
      await screen.findByRole('group', { name: 'Eggs' });
      expect(flashed()).toEqual([]);
    });
  });

  it('puts the Shopping List first on its own page, with the Pantry tagged "you named it"', async () => {
    setupReview([
      ...threeAdds.slice(0, 1),
      action({
        id: 'p1',
        target: 'pantry',
        op: 'add',
        text: 'yogurt in the pantry',
        ingredient: catalogItem('ing-yogurt', 'Yogurt'),
        location: 'fridge',
        rows: {},
      }),
    ]);
    const dialog = within(await openReview());
    await dialog.findByText('Yogurt', { selector: 'b' });

    expect(
      dialog.getByText(
        '2 changes on both lists · nothing is saved until you Apply',
      ),
    ).toBeVisible();
    const regions = dialog.getAllByRole('region');
    expect(regions.map((r) => r.getAttribute('aria-label'))).toEqual([
      'Shopping List',
      'Pantry',
    ]);
    expect(within(regions[0]).queryByText('you named it')).toBeNull();
    expect(within(regions[1]).getByText('you named it')).toBeVisible();
  });
});
