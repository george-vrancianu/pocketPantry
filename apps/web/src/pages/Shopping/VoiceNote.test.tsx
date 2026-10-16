import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Recording } from '../../lib/microphone';
import { renderWithProviders, stubApi } from '../../test/render';
import { ShoppingPage } from './ShoppingPage';

// jsdom has no getUserMedia or MediaRecorder: the microphone module is the seam.
const mic = vi.hoisted(() => ({ start: vi.fn() }));
vi.mock('../../lib/microphone', () => ({
  startRecording: mic.start,
  MicrophoneError: class MicrophoneError extends Error {
    constructor(readonly reason: string) {
      super(reason);
    }
  },
}));
import { MicrophoneError } from '../../lib/microphone';

const recording: Recording = {
  blob: new Blob(['audio-bytes'], { type: 'audio/webm' }),
  mimeType: 'audio/webm;codecs=opus',
  durationMs: 3000,
};

function fakeSession() {
  return {
    stop: vi.fn(() => Promise.resolve(recording)),
    cancel: vi.fn(),
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
      note?.() ?? Response.json({ transcript: 'got the bread and sausages' }),
  });
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.body instanceof FormData) sent.push(init.body);
    return fetchMock(input, init);
  });
  return { sent };
}

const talkButton = () => screen.findByRole('button', { name: /hold to talk/i });

async function hold() {
  const button = await talkButton();
  fireEvent.pointerDown(button);
  await screen.findByRole('status');
  return button;
}

describe('Voice Note on the Shopping List', () => {
  let session: ReturnType<typeof fakeSession>;

  beforeEach(() => {
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
    expect(screen.queryByRole('button', { name: /hold to talk/i })).toBeNull();
  });

  it('records while held, shows the elapsed time, and sends on release', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { sent } = setup();
    renderWithProviders(<ShoppingPage />);

    const button = await hold();
    expect(screen.getByRole('status')).toHaveTextContent(/Recording\s*0:00/);
    await act(() => vi.advanceTimersByTimeAsync(7000));
    expect(screen.getByRole('status')).toHaveTextContent(/Recording\s*0:07/);
    expect(mic.start).toHaveBeenCalledTimes(1);
    expect(sent).toHaveLength(0);

    fireEvent.pointerUp(button);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('What I heard');
    expect(dialog).toHaveTextContent('got the bread and sausages');
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

    expect(screen.queryByRole('status')).toBeNull();
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
    expect(screen.queryByRole('status')).toBeNull();
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
    expect(await screen.findByRole('dialog')).toHaveTextContent(
      'got the bread and sausages',
    );
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
          : Response.json({ transcript: 'two yogurts' }),
    });
    renderWithProviders(<ShoppingPage />);

    fireEvent.pointerUp(await hold());
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/not available/i);
    expect(screen.queryByRole('dialog')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('dialog')).toHaveTextContent('two yogurts');
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

  it('reads in the stored Scan Language and offers the chip', async () => {
    localStorage.setItem(
      'pocket-pantry.scan-language',
      JSON.stringify({ locale: 'en', language: 'ro' }),
    );
    const { sent } = setup();
    renderWithProviders(<ShoppingPage />);

    const chip = await screen.findByRole('combobox', { name: 'Reading as' });
    expect(chip).toHaveValue('ro');
    fireEvent.pointerUp(await hold());
    await screen.findByRole('dialog');
    expect(sent[0].get('scanLanguage')).toBe('ro');
  });
});
