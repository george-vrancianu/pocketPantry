import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// The fake voice environment registers its mocks, so it comes before anything that reaches the microphone.
import {
  openReady,
  mic,
  resetVoiceEnvironment,
  stubVoiceFetch,
  talkButton,
  voiceAction,
  voiceIngredient,
} from '../../test/voice';
import { App } from '../../App';
import {
  goToSayIt,
  preferenceSaves,
  stubSetupMember,
  Where,
} from '../../test/intro';
import { renderWithProviders } from '../../test/render';
import { photoStack, shutter, stackCount, takeScan } from '../../test/scan';
import {
  pressDown,
  holdLongEnough,
  useVoiceTimers,
} from '../../test/voiceHold';

vi.mock('../../lib/camera', async () =>
  (await import('../../test/scan')).fakeCameraModule(),
);
vi.mock('../../lib/image', async (importActual) => ({
  ...(await importActual<typeof import('../../lib/image')>()),
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
  cropToReceiptGuide: () => Promise.resolve('data:image/jpeg;base64,Y3JvcA=='),
}));

/** A way back to Set up or skip, which the app has no link to once Setup is under way. */
function ToSetup() {
  const navigate = useNavigate();
  return (
    <button onClick={() => void navigate('/intro/setup')}>To Setup</button>
  );
}

const where = () => screen.getByLabelText('Where').textContent;

const rice = voiceIngredient('rice', 'Rice');
const tomatoes = voiceIngredient('tomatoes', 'Chopped tomatoes');
const milk = voiceIngredient('milk', 'Milk');

/** "We have rice and two tins of tomatoes. Put milk on the list." with no list named for the first two. */
const HEARD = {
  transcript: 'We have rice and two tins of tomatoes. Put milk on the list.',
  actions: [
    voiceAction({
      id: 'a1',
      target: 'pantry',
      op: 'add',
      text: 'rice',
      ingredient: rice,
      defaults: { location: 'cupboard' },
    }),
    voiceAction({
      id: 'a2',
      target: 'pantry',
      op: 'add',
      text: 'two tins of tomatoes',
      ingredient: tomatoes,
      defaults: { location: 'cupboard' },
      quantity: 2,
      unit: 'pcs',
    }),
    voiceAction({
      id: 'a3',
      target: 'shopping',
      op: 'add',
      text: 'milk',
      ingredient: milk,
    }),
  ],
};

const entry = (actionId: string, list: 'pantry' | 'shopping') => ({
  actionId,
  list,
  rowId: `row-${actionId}`,
  alreadyDone: false,
});

const APPLIED_ALL = {
  applied: [
    entry('a1', 'pantry'),
    entry('a2', 'pantry'),
    entry('a3', 'shopping'),
  ],
  skipped: [],
};

const VOICE_ROUTES = (
  heard: unknown = HEARD,
  applied: unknown = APPLIED_ALL,
) => ({
  'POST /api/voice': () => Response.json(heard, { status: 201 }),
  'POST /api/voice/apply': () => Response.json(applied, { status: 201 }),
});

type Options = Parameters<typeof stubSetupMember>[0];

/** The app at Say it, with a fake read of what was said. */
async function openSayIt(
  heard?: unknown,
  applied?: unknown,
  options: Options = {},
  route?: string,
) {
  const calls = stubSetupMember({
    ...options,
    routes: { ...VOICE_ROUTES(heard, applied), ...options?.routes },
  });
  const { sent } = stubVoiceFetch(globalThis.fetch as never);
  renderWithProviders(
    <>
      <App />
      <Where />
      <ToSetup />
    </>,
    { route: route ?? '/intro/setup' },
  );
  if (!route) await goToSayIt();
  return { calls, sent };
}

/** Holds the mic, speaks (the fake read is canned) and lets go; the Review opens. */
async function speak() {
  const button = await talkButton();
  pressDown(button);
  await screen.findByText("Gator's listening");
  await holdLongEnough();
  fireEvent.pointerUp(button);
  return await screen.findByRole('dialog', { name: "Here's what I heard" });
}

const writes = (calls: ReturnType<typeof stubSetupMember>) =>
  calls.filter((call) => !call.key.startsWith('GET ')).map((c) => c.key);

describe('Setup 2: What Gator heard, Do these, All set', () => {
  beforeEach(() => {
    useVoiceTimers();
    resetVoiceEnvironment();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('goes from the hold to the Review, "Do these 3", All set with both counts and the Dashboard', async () => {
    const { calls, sent } = await openSayIt();
    const user = userEvent.setup();

    const button = await talkButton();
    pressDown(button);
    // Listening: the card with Gator, and the coach line over the scrim.
    expect(await screen.findByText("Gator's listening")).toBeVisible();
    await holdLongEnough();
    expect(screen.getByText('Keep holding while you talk.')).toBeVisible();
    expect(mic.start).toHaveBeenCalledTimes(1);
    // The browser asks for the microphone itself on the first hold; the app does not pre-ask.
    expect(mic.request).not.toHaveBeenCalled();
    fireEvent.pointerUp(button);

    const review = await screen.findByRole('dialog', {
      name: "Here's what I heard",
    });
    expect(sent[0].get('defaultTarget')).toBe('pantry');
    expect(
      within(review).getByRole('img', { name: 'Gator, happy' }),
    ).toBeVisible();
    expect(
      within(review).getByText(
        'We have rice and two tins of tomatoes. Put milk on the list.',
      ),
    ).toBeVisible();
    // Grouped by list, each line an Add.
    const pantry = within(review).getByRole('region', { name: 'Pantry' });
    expect(pantry).toHaveTextContent('Rice');
    expect(pantry).toHaveTextContent('Chopped tomatoes');
    expect(within(pantry).getAllByText('Add')).toHaveLength(2);
    const shopping = within(review).getByRole('region', {
      name: 'Shopping List',
    });
    expect(shopping).toHaveTextContent('Milk');
    expect(within(shopping).getAllByText('Add')).toHaveLength(1);
    expect(
      within(review).getByText(
        'Nothing is saved until you say so. Tap a line to change it.',
      ),
    ).toBeVisible();
    // Nothing was written while the Review is open.
    expect(writes(calls)).toEqual(['POST /api/voice']);

    await user.click(
      within(review).getByRole('button', { name: 'Do these 3' }),
    );

    expect(
      await screen.findByText(
        "You're all set! I'll keep an eye on your kitchen.",
      ),
    ).toBeInTheDocument();
    expect(where()).toBe('/intro/all-set');
    const tiles = screen.getAllByRole('listitem');
    expect(tiles[0]).toHaveTextContent('2in your Pantry');
    expect(tiles[1]).toHaveTextContent('1on your Shopping List');

    // The Pantry's Batches and the Shopping Item go through the normal apply, each to its own list.
    const apply = calls.filter((c) => c.key === 'POST /api/voice/apply');
    expect(apply).toHaveLength(1);
    const body = apply[0].body as {
      actions: { id: string; target: string; op: string }[];
    };
    expect(body.actions.map((a) => [a.id, a.target, a.op])).toEqual([
      ['a1', 'pantry', 'add'],
      ['a2', 'pantry', 'add'],
      ['a3', 'shopping', 'add'],
    ]);

    await user.click(screen.getByRole('button', { name: 'Go to my kitchen' }));
    expect(
      await screen.findByRole('link', { name: 'Customise dashboard' }),
    ).toBeInTheDocument();
    expect(where()).toBe('/');
    expect(preferenceSaves(calls)).toEqual([{ introDone: true }]);
  });

  it('reads a bare "rice and tomatoes" as Pantry Batches and "milk on the list" as a Shopping Item', async () => {
    const { sent } = await openSayIt();
    const review = await speak();
    // The Pantry is the Default List, so nothing needs a list picked.
    expect(sent[0].get('defaultTarget')).toBe('pantry');
    expect(within(review).queryByText('Pick a list')).toBeNull();
    expect(
      within(review).getByRole('region', { name: 'Pantry' }),
    ).toHaveTextContent('Rice');
    expect(
      within(review).getByRole('region', { name: 'Shopping List' }),
    ).toHaveTextContent('Milk');
  });

  it('keeps the normal Review as it was when no Setup is involved (no Gator title, Apply N changes)', async () => {
    await openSayIt(
      undefined,
      undefined,
      {
        routes: {
          'GET /api/settings/preferences': () =>
            Response.json({ introDone: true, theme: null, locale: 'en' }),
        },
      },
      '/pantry',
    );
    const button = await talkButton();
    pressDown(button);
    await screen.findByText("Gator's listening");
    await holdLongEnough();
    fireEvent.pointerUp(button);
    const review = await openReady({ name: 'Review' });
    expect(
      within(review).queryByRole('img', { name: 'Gator, happy' }),
    ).toBeNull();
    expect(
      within(review).getByRole('button', { name: 'Apply 3 changes' }),
    ).toBeInTheDocument();
    expect(
      within(review).queryByText(/Nothing is saved until you say so/),
    ).toBeNull();
  });

  it('Discard closes the Review and stays on Say it with nothing saved', async () => {
    const { calls } = await openSayIt();
    const user = userEvent.setup();
    const review = await speak();

    await user.click(within(review).getByRole('button', { name: 'Discard' }));
    await user.click(await screen.findByRole('button', { name: 'Discard' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(where()).toBe('/intro/say-it');
    expect(screen.getByText('Hold the mic, talk, let go')).toBeVisible();
    expect(screen.queryByText(/in your Pantry$/)).toBeNull();
    expect(writes(calls)).toEqual(['POST /api/voice']);

    // Skipping from here shows no tiles: Discard left the counts alone.
    await user.click(screen.getByRole('link', { name: 'Skip' }));
    await screen.findByText(
      "You're all set! I'll keep an eye on your kitchen.",
    );
    expect(screen.queryByText('in your Pantry')).toBeNull();
    expect(screen.queryByText('on your Shopping List')).toBeNull();
  });

  it('shows only the Shopping List tile when Setup added nothing to the Pantry', async () => {
    const { calls } = await openSayIt(
      {
        transcript: 'Put milk on the list.',
        actions: [HEARD.actions[2]],
      },
      { applied: [entry('a3', 'shopping')], skipped: [] },
    );
    const user = userEvent.setup();
    const review = await speak();
    await user.click(
      within(review).getByRole('button', { name: 'Do this one' }),
    );

    await screen.findByText(
      "You're all set! I'll keep an eye on your kitchen.",
    );
    expect(screen.getByText('on your Shopping List')).toBeVisible();
    expect(screen.queryByText('in your Pantry')).toBeNull();
    expect(calls.filter((c) => c.key === 'POST /api/voice/apply')).toHaveLength(
      1,
    );
  });

  it('counts only what the server applied when some actions were skipped', async () => {
    await openSayIt(HEARD, {
      applied: [entry('a1', 'pantry'), entry('a3', 'shopping')],
      skipped: [{ id: 'a2', reason: 'other' }],
    });
    const user = userEvent.setup();
    const review = await speak();
    await user.click(
      within(review).getByRole('button', { name: 'Do these 3' }),
    );

    await screen.findByText(
      "You're all set! I'll keep an eye on your kitchen.",
    );
    const tiles = screen.getAllByRole('listitem');
    expect(tiles[0]).toHaveTextContent('1in your Pantry');
    expect(tiles[1]).toHaveTextContent('1on your Shopping List');
  });

  it('stays in the Review with its edits when the save fails, and counts nothing', async () => {
    const { calls } = await openSayIt(HEARD, undefined, {
      routes: {
        'POST /api/voice/apply': () =>
          Response.json({ code: 'unknown', params: {} }, { status: 500 }),
      },
    });
    const user = userEvent.setup();
    const review = await speak();
    await user.click(
      within(review).getByRole('button', { name: 'Do these 3' }),
    );

    expect(await within(review).findByRole('alert')).toBeVisible();
    expect(where()).toBe('/intro/say-it');
    expect(
      within(review).getByRole('button', { name: 'Do these 3' }),
    ).toBeEnabled();
    expect(calls.some((c) => c.key === 'PUT /api/settings/preferences')).toBe(
      false,
    );
  });

  it('lands back on Say it when the note reads nothing', async () => {
    await openSayIt({ transcript: 'um', actions: [] });
    const user = userEvent.setup();
    const review = await speak();
    // Nothing to do: only a Discard, no "Do these 0".
    expect(
      within(review).queryByRole('button', { name: /Do these/ }),
    ).toBeNull();
    await user.click(within(review).getByRole('button', { name: 'Discard' }));
    await user.click(await screen.findByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(where()).toBe('/intro/say-it');
  });

  it('shows only the reading pill, not the callout, while Gator reads the note', async () => {
    await openSayIt(undefined, undefined, {
      routes: { 'POST /api/voice': () => new Promise<Response>(() => {}) },
    });
    const button = await talkButton();
    pressDown(button);
    await screen.findByText("Gator's listening");
    await holdLongEnough();
    fireEvent.pointerUp(button);
    expect(await screen.findByText(/Gator's reading your note/)).toBeVisible();
    expect(screen.queryByText('Hold the mic, talk, let go')).toBeNull();
  });

  it('cannot be skipped while Gator is still reading the note, so that note is not lost', async () => {
    await openSayIt(undefined, undefined, {
      routes: { 'POST /api/voice': () => new Promise<Response>(() => {}) },
    });
    const button = await talkButton();
    expect(screen.getByRole('link', { name: 'Skip' })).toBeVisible();
    pressDown(button);
    await screen.findByText("Gator's listening");
    await holdLongEnough();
    fireEvent.pointerUp(button);
    await screen.findByText(/Gator's reading your note/);
    expect(screen.queryByRole('link', { name: 'Skip' })).toBeNull();
    expect(screen.getByText('Skip')).toHaveAttribute('aria-disabled', 'true');
  });

  it('lands back on Say it when the Voice Note cannot be read', async () => {
    await openSayIt(undefined, undefined, {
      routes: {
        'POST /api/voice': () =>
          Response.json({ code: 'unknown', params: {} }, { status: 500 }),
      },
    });
    const button = await talkButton();
    pressDown(button);
    await screen.findByText("Gator's listening");
    await holdLongEnough();
    fireEvent.pointerUp(button);
    expect(await screen.findByText("Couldn't send")).toBeVisible();
    // The pill owns the space above the mic: the resting callout stays out of its way.
    expect(screen.queryByText('Hold the mic, talk, let go')).toBeNull();
    expect(
      screen.queryByRole('dialog', { name: "Here's what I heard" }),
    ).toBeNull();
    expect(where()).toBe('/intro/say-it');
  });
});

describe('Setup 2: the Voice Cap', () => {
  beforeEach(() => {
    useVoiceTimers();
    resetVoiceEnvironment();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("says so when the day's Voice Notes are used up, and stays on Say it", async () => {
    const { calls } = await openSayIt(undefined, undefined, {
      routes: {
        'POST /api/voice': () =>
          Response.json(
            { code: 'voice.cap_reached', params: { cap: 30 } },
            { status: 429 },
          ),
      },
    });
    const button = await talkButton();
    pressDown(button);
    await screen.findByText("Gator's listening");
    await holdLongEnough();
    fireEvent.pointerUp(button);

    expect(
      await screen.findByText("That's today's 30 Voice Notes"),
    ).toBeVisible();
    expect(screen.queryByText('Hold the mic, talk, let go')).toBeNull();
    expect(
      screen.queryByRole('dialog', { name: "Here's what I heard" }),
    ).toBeNull();
    expect(where()).toBe('/intro/say-it');
    expect(writes(calls)).toEqual(['POST /api/voice']);
  });
});

describe('Setup: counts across both steps', () => {
  beforeEach(() => {
    useVoiceTimers();
    resetVoiceEnvironment();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('adds Say it to what Snap saved, and starts again from zero when Setup is resumed', async () => {
    const lines = [
      {
        name: 'Tomatoes',
        match: voiceIngredient('tomato', 'Tomatoes'),
        lowConfidence: false,
        quantity: 2,
        unit: 'pcs',
        expiryDate: null,
        sourceText: null,
        productDescription: null,
      },
      {
        name: 'Onions',
        match: voiceIngredient('onion', 'Onions'),
        lowConfidence: false,
        quantity: 1,
        unit: 'pcs',
        expiryDate: null,
        sourceText: null,
        productDescription: null,
      },
    ];
    const { calls } = await openSayIt(
      undefined,
      undefined,
      {
        routes: {
          'POST /api/scan/ingredients': () => Response.json({ lines }),
          'POST /api/pantry/batches/bulk': () => Response.json({ batches: [] }),
        },
      },
      '/intro/setup',
    );
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole('button', { name: /Show me how/ }),
    );
    await screen.findByRole('radiogroup', { name: "What's in front of you?" });
    await user.click(screen.getByRole('link', { name: 'Camera' }));
    await waitFor(() => expect(shutter()).toBeInTheDocument());
    takeScan();
    await waitFor(() => expect(stackCount()).toBe(1));
    await user.click(photoStack());
    await user.click((await screen.findAllByTestId('card-result'))[0]);
    await user.click(
      await screen.findByRole('button', { name: 'Add 2 to Pantry' }),
    );
    expect(await screen.findByText('2 things in your Pantry')).toBeVisible();

    const review = await speak();
    await user.click(
      within(review).getByRole('button', { name: 'Do these 3' }),
    );

    await screen.findByText(
      "You're all set! I'll keep an eye on your kitchen.",
    );
    const tiles = screen.getAllByRole('listitem');
    // Snap's 2 and Say it's 2 Batches, and the Shopping Item.
    expect(tiles[0]).toHaveTextContent('4in your Pantry');
    expect(tiles[1]).toHaveTextContent('1on your Shopping List');
    expect(
      calls.filter((c) => c.key === 'POST /api/pantry/batches/bulk'),
    ).toHaveLength(1);

    // Setup started again from the top counts from zero.
    await user.click(screen.getByRole('button', { name: 'To Setup' }));
    await user.click(
      await screen.findByRole('button', { name: /Show me how/ }),
    );
    await user.click(await screen.findByRole('link', { name: 'Skip' }));
    expect(screen.queryByText(/in your Pantry$/)).toBeNull();
    await user.click(await screen.findByRole('link', { name: 'Skip' }));
    await screen.findByText(
      "You're all set! I'll keep an eye on your kitchen.",
    );
    expect(screen.queryByText('in your Pantry')).toBeNull();
    expect(screen.queryByText('on your Shopping List')).toBeNull();
  });
});
