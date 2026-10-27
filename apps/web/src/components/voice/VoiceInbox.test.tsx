import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// The fake voice environment registers its mocks, so it comes before anything that reaches the microphone.
import {
  mic,
  openReady,
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
import { Link, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, stubApi } from '../../test/render';
import { AppLayout } from '../AppLayout';
import en from '../../i18n/locales/en/voice.json';
import ro from '../../i18n/locales/ro/voice.json';
import da from '../../i18n/locales/da/voice.json';

const bread = voiceIngredient('ing-bread', 'Bread');
const heard = (text = 'got the bread') => ({
  transcript: text,
  actions: [
    voiceAction({
      target: 'shopping',
      op: 'check',
      text: 'bread',
      ingredient: bread,
    }),
  ],
});

function renderAt(route = '/shopping') {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/shopping"
          element={<Link to="/pantry">to the pantry</Link>}
        />
        <Route path="/pantry" element={<p>pantry page</p>} />
      </Route>
    </Routes>,
    { route },
  );
}

describe('the Voice Inbox strip', () => {
  let fake: ReturnType<typeof stubVoiceFetch>;
  let applied: Record<string, unknown>[];

  beforeEach(() => {
    useVoiceTimers();
    resetVoiceEnvironment();
    applied = [];
    const { fetchMock } = stubApi({
      'GET /api/voice/config': () => Response.json({ configured: true }),
      'GET /api/catalog/search': () => Response.json({ results: [bread] }),
      'GET /api/catalog/aisles': () => Response.json({ aisles: [] }),
      'POST /api/voice/apply': () =>
        Response.json(
          {
            applied: [
              {
                actionId: 'a1',
                list: 'shopping',
                rowId: 'r1',
                alreadyDone: false,
              },
            ],
            skipped: [],
          },
          { status: 201 },
        ),
    });
    fake = stubVoiceFetch(fetchMock, (input, init) => {
      if (String(input).endsWith('/voice/apply')) {
        applied.push(JSON.parse(init?.body as string) as never);
      }
    });
    fake.holdReads();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** Holds the mic, lets go, and waits for the upload to be on its way (or queued). */
  async function speak(reads?: number) {
    const button = await talkButton();
    pressDown(button);
    await screen.findByText("Gator's listening");
    await holdLongEnough();
    fireEvent.pointerUp(button);
    if (reads !== undefined) {
      await waitFor(() => expect(fake.reads).toHaveLength(reads));
    }
  }
  const answer = (index: number) =>
    fake.reads[index].resolve(Response.json(heard(), { status: 201 }));
  // The layout's refresh loader keeps an empty status region of its own on every screen.
  const voiceStatuses = () =>
    screen.queryAllByRole('status').filter((el) => el.textContent !== '');
  const strip = () => {
    const [only, ...rest] = voiceStatuses();
    expect(rest).toHaveLength(0);
    return only;
  };

  it('shows nothing when the Voice Inbox is empty and while recording', async () => {
    renderAt();
    await talkButton();
    expect(voiceStatuses()).toHaveLength(0);

    await speak(1);
    expect(await screen.findByText(/^Voice Note · 0:\d\d$/)).toBeVisible();

    const button = await talkButton();
    pressDown(button);
    await screen.findByText("Gator's listening");
    await holdLongEnough();
    expect(screen.queryByText(/^Voice Note · 0:\d\d$/)).toBeNull();
    expect(strip()).toHaveTextContent("Gator's listening");
  });

  it('records while others are read, two at a time, and the rest wait in order', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    expect(await screen.findByText('2 in the background')).toBeVisible();
    expect(strip()).toHaveTextContent('2 reading');

    await speak();
    expect(await screen.findByText('3 in the background')).toBeVisible();
    // The third waits: still two uploads.
    expect(fake.reads).toHaveLength(2);

    answer(0);
    await waitFor(() => expect(fake.reads).toHaveLength(3));
    expect(strip()).toHaveTextContent('2 reading · 1 ready');
  });

  it('keeps the strip Gator on its Signature while a note is read, then rests on idle once it is ready', async () => {
    renderAt();
    await speak(1);
    await screen.findByText(/^Voice Note · 0:\d\d$/);
    const gator = () => strip().parentElement!.querySelector('img[data-mood]');
    expect(gator()).toHaveAttribute('data-mood', 'thinking');
    expect(gator()).toHaveAttribute('data-motion', 'signature');

    answer(0);
    await waitFor(() => expect(gator()).toHaveAttribute('data-mood', 'happy'));
    expect(gator()).toHaveAttribute('data-motion', 'idle');
  });

  it('offers Review only when exactly one note is ready, and opens it', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    expect(screen.queryByRole('button', { name: 'Review' })).toBeNull();

    answer(1);
    expect(await screen.findByRole('button', { name: 'Review' })).toBeVisible();
    expect(strip()).toHaveTextContent('1 reading · 1 ready');

    const dialog = await openReady();
    expect(dialog).toHaveTextContent('What I heard');
    // The strip steps aside while a sheet is up.
    expect(screen.queryByText('2 in the background')).toBeNull();
  });

  it('opens the oldest ready note from the sheet when several are ready, and Apply removes only that note', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    fake.reads[1].resolve(Response.json(heard('second note'), { status: 201 }));
    fake.reads[0].resolve(Response.json(heard('first note'), { status: 201 }));
    await screen.findByText('2 ready');
    expect(screen.queryByRole('button', { name: 'Review' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Open 2' }));
    const sheet = within(await screen.findByRole('dialog'));
    await userEvent.click(
      sheet.getAllByRole('button', { name: /^Review: / })[1],
    );
    const dialog = within(
      await screen.findByRole('dialog', { name: 'Review' }),
    );
    // The oldest is the first recorded, although the second was answered first.
    await userEvent.click(dialog.getByRole('button', { name: /What I heard/ }));
    expect(await dialog.findByText(/first note/)).toBeVisible();

    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 1 change' }),
    );
    await waitFor(() => expect(applied).toHaveLength(1));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    // The other note is still there, ready.
    expect(await screen.findByText('second note')).toBeVisible();
    expect(screen.getByText(/Ready to review$/)).toBeVisible();
  });

  it('opens the sheet for any mix but one ready note, with a row per note, newest first', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    await speak();
    // Nothing ready yet: the strip offers Open, and the sheet lists the notes being read.
    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));
    let sheet = within(
      await screen.findByRole('dialog', { name: 'In the background' }),
    );
    let rows = sheet.getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    rows.forEach((row) => {
      expect(row).toHaveTextContent(/Voice Note · 0:\d\d/);
      expect(row).toHaveTextContent('Shopping List');
      expect(row).toHaveTextContent('Being read');
      expect(
        within(row).getByRole('button', { name: /^Cancel/ }),
      ).toBeVisible();
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    // One ready note: Review opens it directly, no sheet.
    answer(0);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Review' }),
    );
    expect(await screen.findByRole('dialog', { name: 'Review' })).toBeVisible();
    expect(
      screen.queryByRole('dialog', { name: 'In the background' }),
    ).toBeNull();
  });

  it('shows ready rows with their transcript and Review, and opens that note and closes the sheet', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    answer(0);
    fake.reads[1].resolve(Response.json(heard('second note'), { status: 201 }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Open 2' }),
    );
    const sheet = within(
      await screen.findByRole('dialog', { name: 'In the background' }),
    );
    const rows = sheet.getAllByRole('listitem');
    // Newest first.
    expect(rows[1]).toHaveTextContent('got the bread');
    expect(rows[0]).toHaveTextContent('second note');
    expect(rows[0]).toHaveTextContent('Ready to review');
    expect(
      within(rows[0]).queryByRole('button', { name: /^Cancel/ }),
    ).toBeNull();

    await userEvent.click(
      within(rows[0]).getByRole('button', { name: /^Review/ }),
    );
    const dialog = within(await screen.findByRole('dialog'));
    expect(
      screen.queryByRole('dialog', { name: 'In the background' }),
    ).toBeNull();
    await userEvent.click(dialog.getByRole('button', { name: /What I heard/ }));
    expect(await dialog.findByText(/second note/)).toBeVisible();
  });

  it('shows an answers-only row with See, which opens the answer sheet and closes the Voice Inbox', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    fake.reads[0].resolve(
      Response.json(
        {
          transcript: 'do we have bread',
          actions: [],
          answers: [
            {
              id: 'q1',
              kind: 'no',
              text: 'bread',
              ingredient: bread,
              onShoppingList: false,
            },
          ],
        },
        { status: 201 },
      ),
    );
    fake.reads[1].resolve(Response.json(heard(), { status: 201 }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Open 2' }),
    );
    const sheet = within(
      await screen.findByRole('dialog', { name: 'In the background' }),
    );
    const row = sheet.getAllByRole('listitem')[1];
    expect(row).toHaveTextContent('Answers ready');
    expect(row).toHaveTextContent('English');
    await userEvent.click(within(row).getByRole('button', { name: /^See: / }));
    expect(
      await screen.findByRole('dialog', { name: 'Your Pantry' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('dialog', { name: 'In the background' }),
    ).toBeNull();
  });

  it('cancels only the read of the row it is on', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));
    const sheet = within(
      await screen.findByRole('dialog', { name: 'In the background' }),
    );
    await userEvent.click(
      within(sheet.getAllByRole('listitem')[0]).getByRole('button', {
        name: /^Cancel/,
      }),
    );
    await waitFor(() => expect(sheet.getAllByRole('listitem')).toHaveLength(1));
    expect(fake.signals[0].aborted).toBe(false);
    expect(fake.signals[1].aborted).toBe(true);
  });

  it('keeps focus in the sheet when a row is cancelled', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    await userEvent.click(await screen.findByRole('button', { name: 'Open' }));
    const sheet = within(
      await screen.findByRole('dialog', { name: 'In the background' }),
    );
    await userEvent.click(
      within(sheet.getAllByRole('listitem')[1]).getByRole('button', {
        name: /^Cancel/,
      }),
    );
    await waitFor(() => expect(sheet.getAllByRole('listitem')).toHaveLength(1));
    expect(
      sheet.getByRole('heading', { name: 'In the background' }),
    ).toHaveFocus();
  });

  it('shows one note by its own title and detail, with Review once it is ready', async () => {
    renderAt();
    await speak(1);
    expect(await screen.findByText(/^Voice Note · 0:\d\d$/)).toBeVisible();
    expect(strip()).toHaveTextContent('Being read');
    expect(screen.queryByText(/in the background/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Review' })).toBeNull();

    answer(0);
    expect(await screen.findByText('got the bread')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Review' })).toBeVisible();
  });

  it('sums up several notes as what is in the background, with Open, then Open N once more are ready', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    await speak();
    expect(await screen.findByText('3 in the background')).toBeVisible();
    expect(screen.getByText('3 reading')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Open' })).toBeVisible();

    answer(0);
    answer(1);
    expect(await screen.findByText('1 reading · 2 ready')).toBeVisible();
    expect(screen.getByText('3 in the background')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Open 2' })).toBeVisible();
  });

  it('turns into the dark pill once everything in the background is ready', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    const pill = () =>
      document.querySelector<HTMLElement>('[data-voice-pill]')!;
    await screen.findByText('2 in the background');
    const whileReading = getComputedStyle(pill()).backgroundColor;
    answer(0);
    await screen.findByText('1 reading · 1 ready');
    expect(getComputedStyle(pill()).backgroundColor).toBe(whileReading);

    answer(1);
    await screen.findByText('2 ready');
    expect(getComputedStyle(pill()).backgroundColor).not.toBe(whileReading);
    expect(pill().querySelector('img[data-mood]')).toHaveAttribute(
      'data-mood',
      'happy',
    );
  });

  it('titles the sheet "In the background" and lists the newest note first', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    answer(0);
    fake.reads[1].resolve(Response.json(heard('second note'), { status: 201 }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Open 2' }),
    );
    const sheet = within(
      await screen.findByRole('dialog', { name: 'In the background' }),
    );
    expect(
      sheet.getByRole('heading', { name: 'In the background' }),
    ).toBeVisible();
    expect(sheet.getAllByRole('listitem')[0]).toHaveTextContent('second note');
    expect(sheet.getByRole('button', { name: 'Review all (2)' })).toBeVisible();
  });

  it('reads the strip politely, and raises an alert only when a note fails', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    expect(screen.queryByRole('alert')).toBeNull();
    answer(0);
    await screen.findByText('1 reading · 1 ready');
    expect(screen.queryByRole('alert')).toBeNull();

    fake.reads[1].reject(new TypeError('Failed to fetch'));
    await waitFor(() => expect(fake.reads.length).toBeGreaterThan(2));
    fake.reads[2].reject(new TypeError('Failed to fetch'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '1 Voice Note failed',
    );
    expect(strip()).toHaveTextContent('1 ready · 1 failed');
  });

  it('sends each note with the Default List of the page it was recorded on, whichever page opens it', async () => {
    renderAt('/shopping');
    await speak(1);
    await userEvent.click(screen.getByRole('link', { name: 'to the pantry' }));
    await screen.findByText('pantry page');
    await speak(2);

    expect(fake.reads.map((r) => r.body.get('defaultTarget'))).toEqual([
      'shopping',
      'pantry',
    ]);
    answer(0);
    const dialog = await openReady();
    expect(dialog).toHaveTextContent('What I heard');
    expect(screen.getByText('pantry page')).toBeVisible();
  });

  it('refuses the mic while a Review is open, and works again once it closes', async () => {
    renderAt();
    await speak(1);
    answer(0);
    const dialog = within(await openReady());
    mic.start.mockClear();

    const voiceButton = document.querySelector(
      '[data-voice-button]',
    ) as HTMLElement;
    pressDown(voiceButton);
    await holdLongEnough();
    expect(mic.start).not.toHaveBeenCalled();
    expect(screen.queryByText("Gator's listening")).toBeNull();

    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 1 change' }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await speak();
    expect(mic.start).toHaveBeenCalledOnce();
  });

  it('refuses a sixth note with "Review your notes first"', async () => {
    renderAt();
    for (let i = 0; i < 5; i++) await speak(Math.min(i + 1, 2));
    expect(await screen.findByText('5 in the background')).toBeVisible();
    mic.start.mockClear();

    const button = await talkButton();
    pressDown(button);
    expect(await screen.findByText('Review your notes first')).toBeVisible();
    expect(mic.start).not.toHaveBeenCalled();
  });

  it('buzzes once for each note that becomes ready, with no toast', async () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });
    renderAt();
    await speak(1);
    await speak(2);
    vibrate.mockClear();

    answer(0);
    await screen.findByText('1 reading · 1 ready');
    expect(vibrate).toHaveBeenCalledTimes(1);
    answer(1);
    await screen.findByText('2 ready');
    expect(vibrate).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('asks the browser to confirm leaving while a note is unapplied, and stops when it is empty', async () => {
    const leaving = () => {
      const event = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };
    renderAt();
    expect(leaving()).toBe(false);
    await speak(1);
    expect(leaving()).toBe(true);
    answer(0);
    const dialog = within(await openReady());
    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 1 change' }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(leaving()).toBe(false);
  });

  it('has its copy in English, Romanian and Danish', () => {
    // Plural forms differ per language.
    const keys = (voice: typeof en) =>
      Object.keys(voice.inbox)
        .filter((k) => !k.startsWith('title') && !k.startsWith('failed'))
        .sort();
    expect(keys(ro)).toEqual(keys(en));
    expect(keys(da)).toEqual(keys(en));
    for (const voice of [en, ro, da]) {
      expect(voice.inbox.full).toBeTruthy();
      expect(voice.inbox.review).toBeTruthy();
    }
  });
});
