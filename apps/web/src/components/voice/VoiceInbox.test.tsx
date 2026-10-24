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
  const strip = () => screen.getByRole('status');

  it('shows nothing when the Voice Inbox is empty and while recording', async () => {
    renderAt();
    await talkButton();
    expect(screen.queryByRole('status')).toBeNull();

    await speak(1);
    expect(await screen.findByText('1 Voice Note')).toBeVisible();

    const button = await talkButton();
    pressDown(button);
    await screen.findByText("Gator's listening");
    await holdLongEnough();
    expect(screen.queryByText('1 Voice Note')).toBeNull();
    expect(strip()).toHaveTextContent("Gator's listening");
  });

  it('records while others are read, two at a time, and the rest wait in order', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    expect(await screen.findByText('2 Voice Notes')).toBeVisible();
    expect(strip()).toHaveTextContent('Reading 2');

    await speak();
    expect(await screen.findByText('3 Voice Notes')).toBeVisible();
    // The third waits: still two uploads.
    expect(fake.reads).toHaveLength(2);

    answer(0);
    await waitFor(() => expect(fake.reads).toHaveLength(3));
    expect(strip()).toHaveTextContent('Reading 2 · 1 ready');
  });

  it('offers Review only when exactly one note is ready, and opens it', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    expect(
      within(strip()).queryByRole('button', { name: 'Review' }),
    ).toBeNull();

    answer(1);
    expect(
      await within(strip()).findByRole('button', { name: 'Review' }),
    ).toBeVisible();
    expect(strip()).toHaveTextContent('Reading 1 · 1 ready');

    const dialog = await openReady();
    expect(dialog).toHaveTextContent('What I heard');
    // The strip steps aside while a sheet is up.
    expect(screen.queryByText('2 Voice Notes')).toBeNull();
  });

  it('opens the oldest ready note when several are ready, and Apply removes only that note', async () => {
    renderAt();
    await speak(1);
    await speak(2);
    fake.reads[1].resolve(Response.json(heard('second note'), { status: 201 }));
    fake.reads[0].resolve(Response.json(heard('first note'), { status: 201 }));
    await screen.findByText('2 ready');
    expect(
      within(strip()).queryByRole('button', { name: 'Review' }),
    ).toBeNull();

    await userEvent.click(strip());
    const dialog = within(await screen.findByRole('dialog'));
    // The oldest is the first recorded, although the second was answered first.
    await userEvent.click(dialog.getByRole('button', { name: /What I heard/ }));
    expect(await dialog.findByText(/first note/)).toBeVisible();

    await userEvent.click(
      dialog.getByRole('button', { name: 'Apply 1 change' }),
    );
    await waitFor(() => expect(applied).toHaveLength(1));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    // The other note is still there, ready.
    expect(await screen.findByText('1 Voice Note')).toBeVisible();
    expect(screen.getByText('1 ready')).toBeVisible();
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
    expect(await screen.findByText('5 Voice Notes')).toBeVisible();
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
    await screen.findByText('Reading 1 · 1 ready');
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
    const keys = (voice: typeof en) => Object.keys(voice.inbox).sort();
    expect(keys(ro).filter((k) => !k.startsWith('title'))).toEqual(
      keys(en).filter((k) => !k.startsWith('title')),
    );
    expect(keys(da).filter((k) => !k.startsWith('title'))).toEqual(
      keys(en).filter((k) => !k.startsWith('title')),
    );
    for (const voice of [en, ro, da]) {
      expect(voice.inbox.full).toBeTruthy();
      expect(voice.inbox.review).toBeTruthy();
    }
  });
});
