import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from 'vitest';
import type { Recording } from '../../lib/microphone';
import {
  holdFor,
  holdLongEnough,
  pressDown,
  useVoiceTimers,
} from '../../test/voiceHold';
import { renderWithProviders, stubApi } from '../../test/render';
import { resetVoiceNote } from '../../lib/voiceNoteStore';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
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

function setup() {
  const sent: FormData[] = [];
  const { fetchMock } = stubApi({
    'GET /api/shopping-list': () =>
      Response.json({
        id: 'l1',
        groups: [],
        summary: { remaining: 0, checked: 0 },
      }),
    'GET /api/voice/config': () => Response.json({ configured: true }),
    'POST /api/voice': () =>
      Response.json({ transcript: 'got the bread', actions: [] }),
  });
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.body instanceof FormData) sent.push(init.body);
    return fetchMock(input, init);
  });
  return { sent };
}

const talkButton = () =>
  screen.findByRole('button', { name: /hold to record a voice note/i });

/** jsdom has no layout: the button sits at 100..162 x 500..562. */
function place(button: HTMLElement) {
  button.getBoundingClientRect = () =>
    ({
      left: 100,
      right: 162,
      top: 500,
      bottom: 562,
      width: 62,
      height: 62,
    }) as DOMRect;
}

async function hold() {
  const button = await talkButton();
  place(button);
  pressDown(button, { clientX: 130, clientY: 530 });
  await screen.findByText('Listening');
  await holdLongEnough();
  return button;
}

const cancelledToast = 'Cancelled. Nothing was sent.';

describe('the recording gesture on the Shopping List', () => {
  let session: ReturnType<typeof fakeSession>;
  let vibrate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    useVoiceTimers();
    resetVoiceNote();
    session = fakeSession();
    mic.start.mockReset();
    mic.start.mockImplementation(() => Promise.resolve(session));
    vibrate = vi.fn();
    vi.stubGlobal(
      'navigator',
      Object.assign(Object.create(navigator), { vibrate }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('slide to cancel', () => {
    it('does not arm within 72 px, arms beyond it, and disarms when back', async () => {
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      vibrate.mockClear();

      // 70 px left of the box: still keeping it.
      fireEvent.pointerMove(button, { clientX: 30, clientY: 530 });
      expect(screen.queryByText('Let go to cancel')).toBeNull();
      expect(vibrate).not.toHaveBeenCalled();

      // 80 px left of the box.
      fireEvent.pointerMove(button, { clientX: 20, clientY: 530 });
      expect(await screen.findAllByText('Let go to cancel')).not.toHaveLength(
        0,
      );
      expect(screen.getByText('Slide back to keep recording')).toBeVisible();
      expect(vibrate).toHaveBeenCalledWith(6);
      expect(session.cancel).not.toHaveBeenCalled();

      fireEvent.pointerMove(button, { clientX: 130, clientY: 530 });
      expect(screen.queryByText('Slide back to keep recording')).toBeNull();
      expect(vibrate).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Listening')).toBeVisible();
    });

    it('arms by sliding down or up too', async () => {
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      fireEvent.pointerMove(button, { clientX: 130, clientY: 700 });
      expect(screen.getByText('Slide back to keep recording')).toBeVisible();
      fireEvent.pointerMove(button, { clientX: 130, clientY: 530 });
      fireEvent.pointerMove(button, { clientX: 130, clientY: 400 });
      expect(screen.getByText('Slide back to keep recording')).toBeVisible();
    });

    it('discards on release while armed, and says so', async () => {
      const { sent } = setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      fireEvent.pointerMove(button, { clientX: 10, clientY: 530 });
      fireEvent.pointerUp(button);

      expect(await screen.findByText(cancelledToast)).toBeVisible();
      expect(session.cancel).toHaveBeenCalledTimes(1);
      expect(session.stop).not.toHaveBeenCalled();
      expect(sent).toHaveLength(0);
      expect(screen.queryByText('Listening')).toBeNull();
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('keeps recording when the pointer leaves the button but not the margin', async () => {
      const { sent } = setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      fireEvent.pointerLeave(button);
      fireEvent.pointerMove(button, { clientX: 60, clientY: 530 });
      expect(session.cancel).not.toHaveBeenCalled();
      fireEvent.pointerUp(button);
      await screen.findByRole('dialog');
      expect(sent).toHaveLength(1);
    });

    it('cancels on a pointer cancel (a system gesture)', async () => {
      const { sent } = setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      fireEvent.pointerCancel(button);

      await waitFor(() => expect(session.cancel).toHaveBeenCalledTimes(1));
      expect(screen.queryByText('Listening')).toBeNull();
      expect(sent).toHaveLength(0);
    });
  });

  describe('a press that is no longer a recording', () => {
    it('does not arm, buzz or grey the button after Escape or the 60 s auto-stop while the finger is still down', async () => {
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      await userEvent.keyboard('{Escape}');
      await screen.findByText(cancelledToast);
      vibrate.mockClear();
      fireEvent.pointerMove(button, { clientX: 10, clientY: 530 });
      expect(vibrate).not.toHaveBeenCalled();
      expect(screen.queryByText('Slide back to keep recording')).toBeNull();
      fireEvent.pointerUp(button);

      const again = await hold();
      await holdFor(60_000);
      await screen.findByRole('dialog');
      vibrate.mockClear();
      fireEvent.pointerMove(again, { clientX: 10, clientY: 530 });
      expect(vibrate).not.toHaveBeenCalled();
      expect(screen.queryByText('Slide back to keep recording')).toBeNull();
    });

    it('still treats a later click with no press before it as assistive after a press that ended early', async () => {
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      await userEvent.keyboard('{Escape}');
      await holdFor(1_000);
      fireEvent.click(button);
      await screen.findByText('Listening');
      expect(mic.start).toHaveBeenCalledTimes(2);
    });

    it('ignores a second finger or a right click', async () => {
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await talkButton();
      pressDown(button, { isPrimary: false });
      pressDown(button, { button: 2 });
      await holdFor(100);
      expect(mic.start).not.toHaveBeenCalled();
    });

    it('is not ended by a second finger lifting or being cancelled', async () => {
      const { sent } = setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      fireEvent.pointerUp(button, { pointerId: 2, isPrimary: false });
      fireEvent.pointerCancel(button, { pointerId: 2, isPrimary: false });
      fireEvent.lostPointerCapture(button, { pointerId: 2 });
      expect(session.cancel).not.toHaveBeenCalled();
      expect(screen.getByText('Listening')).toBeVisible();
      expect(sent).toHaveLength(0);

      fireEvent.pointerUp(button);
      await screen.findByRole('dialog');
      expect(sent).toHaveLength(1);
    });

    it('has the destination as the button description', async () => {
      setup();
      renderWithProviders(<ShoppingPage />);
      expect(await talkButton()).toHaveAccessibleDescription(/shopping/i);
    });

    it('shows only Cancelled, not the hold tip, after a quick release then Escape before the stream arrives', async () => {
      let arrive: (value: ReturnType<typeof fakeSession>) => void = () => {};
      mic.start.mockImplementation(
        () => new Promise((resolve) => (arrive = resolve)),
      );
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await talkButton();
      pressDown(button, { clientX: 130, clientY: 530 });
      await screen.findByText('Starting…');
      await holdLongEnough();
      fireEvent.pointerUp(button);
      await userEvent.keyboard('{Escape}');
      expect(await screen.findByText(cancelledToast)).toBeVisible();
      await act(async () => arrive(session));
      await holdFor(1_000);
      expect(screen.queryByText('Hold to talk, let go to send')).toBeNull();
    });

    it('says Cancelled even when the stream had not arrived yet, and then records nothing', async () => {
      let arrive: (value: ReturnType<typeof fakeSession>) => void = () => {};
      mic.start.mockImplementation(
        () => new Promise((resolve) => (arrive = resolve)),
      );
      const { sent } = setup();
      renderWithProviders(<ShoppingPage />);
      const button = await talkButton();
      pressDown(button, { clientX: 130, clientY: 530 });
      await screen.findByText('Starting…');
      await userEvent.keyboard('{Escape}');

      expect(await screen.findByText(cancelledToast)).toBeVisible();
      await act(async () => arrive(session));
      expect(session.cancel).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Listening')).toBeNull();
      expect(sent).toHaveLength(0);
    });

    it('records nothing when the stream arrives after leaving the page', async () => {
      let arrive: (value: ReturnType<typeof fakeSession>) => void = () => {};
      mic.start.mockImplementation(
        () => new Promise((resolve) => (arrive = resolve)),
      );
      const { sent } = setup();
      const view = renderWithProviders(<ShoppingPage />);
      const button = await talkButton();
      pressDown(button);
      await screen.findByText('Starting…');
      view.unmount();

      await act(async () => arrive(session));
      await holdFor(61_000);
      expect(session.cancel).toHaveBeenCalledTimes(1);
      expect(session.stop).not.toHaveBeenCalled();
      expect(sent).toHaveLength(0);
    });
  });

  describe('time limit', () => {
    it('turns to "n s left" from 50 s, and stops and sends at 60 s with a toast', async () => {
      const { sent } = setup();
      renderWithProviders(<ShoppingPage />);
      await hold();
      expect(screen.queryByText(/s left/)).toBeNull();

      await holdFor(50_000);
      expect(screen.getByText('10 s left')).toBeVisible();
      expect(screen.getByTestId('elapsed')).toHaveStyle({
        color: 'var(--mui-palette-warning-main)',
      });
      await holdFor(4_000);
      expect(screen.getByText('6 s left')).toBeVisible();
      expect(session.stop).not.toHaveBeenCalled();

      vibrate.mockClear();
      await holdFor(6_000);
      expect(vibrate).toHaveBeenCalledWith(14);
      expect(
        await screen.findByText('Stopped at 1 minute · Sending what you said.'),
      ).toBeVisible();
      expect(await screen.findByRole('dialog')).toHaveTextContent(
        'What I heard',
      );
      expect(sent).toHaveLength(1);
    });
  });

  describe('keyboard', () => {
    it('records while Space is down and sends on key up', async () => {
      const { sent } = setup();
      renderWithProviders(<ShoppingPage />);
      const button = await talkButton();
      button.focus();

      fireEvent.keyDown(button, { key: ' ' });
      await screen.findByText('Listening');
      fireEvent.keyDown(button, { key: ' ', repeat: true });
      await holdLongEnough();
      fireEvent.keyUp(button, { key: ' ' });

      expect(await screen.findByRole('dialog')).toHaveTextContent(
        'What I heard',
      );
      expect(mic.start).toHaveBeenCalledTimes(1);
      expect(sent).toHaveLength(1);
    });

    it('records with Enter, and a quick Enter is only a tap', async () => {
      const { sent } = setup();
      renderWithProviders(<ShoppingPage />);
      const button = await talkButton();

      fireEvent.keyDown(button, { key: 'Enter' });
      await screen.findByText('Listening');
      fireEvent.keyUp(button, { key: 'Enter' });

      expect(
        await screen.findByText('Hold to talk, let go to send'),
      ).toBeVisible();
      expect(sent).toHaveLength(0);
    });

    it('cancels with Escape while recording', async () => {
      const { sent } = setup();
      renderWithProviders(<ShoppingPage />);
      const button = await talkButton();
      fireEvent.keyDown(button, { key: ' ' });
      await screen.findByText('Listening');
      await holdLongEnough();

      await userEvent.keyboard('{Escape}');

      expect(await screen.findByText(cancelledToast)).toBeVisible();
      expect(session.cancel).toHaveBeenCalledTimes(1);
      fireEvent.keyUp(button, { key: ' ' });
      expect(sent).toHaveLength(0);
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('assistive activation', () => {
    it('toggles: one click starts, the next sends', async () => {
      const { sent } = setup();
      renderWithProviders(<ShoppingPage />);
      const button = await talkButton();

      fireEvent.click(button);
      await screen.findByText('Listening');
      expect(button).toHaveAttribute('aria-pressed', 'true');
      await holdFor(1_000);
      expect(sent).toHaveLength(0);

      fireEvent.click(button);
      expect(await screen.findByRole('dialog')).toHaveTextContent(
        'What I heard',
      );
      expect(sent).toHaveLength(1);
    });

    it('cancels a toggled recording with Escape', async () => {
      const { sent } = setup();
      renderWithProviders(<ShoppingPage />);
      const button = await talkButton();
      fireEvent.click(button);
      await screen.findByText('Listening');
      await holdLongEnough();

      await userEvent.keyboard('{Escape}');

      expect(await screen.findByText(cancelledToast)).toBeVisible();
      expect(sent).toHaveLength(0);
    });

    it('does not treat the click after a press as a toggle', async () => {
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      fireEvent.pointerUp(button);
      fireEvent.click(button);
      await screen.findByRole('dialog');
      expect(mic.start).toHaveBeenCalledTimes(1);
      expect(session.stop).toHaveBeenCalledTimes(1);
    });
  });

  describe('live region', () => {
    it('announces Recording, Let go to cancel and 10 seconds left once each, never the ticking time', async () => {
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await talkButton();
      place(button);
      pressDown(button, { clientX: 130, clientY: 530 });
      const card = (await screen.findByText('Listening')).closest(
        '[role="status"]',
      )!;
      expect(card).toHaveAttribute('role', 'status');

      // What a screen reader reads: everything not aria-hidden.
      const live = () =>
        Array.from(card.querySelectorAll('*'))
          .filter((node) => !node.closest('[aria-hidden="true"]'))
          .map((node) => (node.children.length === 0 ? node.textContent : ''))
          .join('')
          .trim();
      const announced: string[] = [];
      const watch = new MutationObserver(() => {
        const now = live();
        if (now) announced.push(now);
      });
      watch.observe(card, {
        subtree: true,
        childList: true,
        characterData: true,
      });
      const arm = () => {
        fireEvent.pointerMove(button, { clientX: 10, clientY: 530 });
      };
      const disarm = () => {
        fireEvent.pointerMove(button, { clientX: 130, clientY: 530 });
      };

      await holdFor(3_000);
      arm();
      await holdFor(10);
      disarm();
      await holdFor(10);
      arm();
      await holdFor(10);
      disarm();
      await holdFor(47_000);
      arm();
      await holdFor(10);
      disarm();
      await holdFor(5_000);
      watch.disconnect();

      expect(announced).toEqual([
        'Recording',
        'Let go to cancel',
        '10 seconds left',
      ]);
    });
  });

  describe('wake lock', () => {
    let request: ReturnType<typeof vi.fn>;
    let released: Mock<() => Promise<void>>;

    beforeEach(() => {
      released = vi.fn<() => Promise<void>>(() => Promise.resolve());
      request = vi.fn(() => Promise.resolve({ release: released }));
      vi.stubGlobal(
        'navigator',
        Object.assign(Object.create(navigator), {
          vibrate,
          wakeLock: { request },
        }),
      );
    });

    it('is held from the press until Review opens', async () => {
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      expect(request).toHaveBeenCalledWith('screen');
      expect(released).not.toHaveBeenCalled();

      fireEvent.pointerUp(button);
      await screen.findByRole('dialog');
      expect(request).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(released).toHaveBeenCalledTimes(1));
    });

    it('is released when cancelled', async () => {
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      fireEvent.pointerMove(button, { clientX: 10, clientY: 530 });
      fireEvent.pointerUp(button);
      await waitFor(() => expect(released).toHaveBeenCalledTimes(1));
    });

    it('is released after a tap', async () => {
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await talkButton();
      pressDown(button);
      await screen.findByText('Listening');
      fireEvent.pointerUp(button);
      await waitFor(() => expect(released).toHaveBeenCalledTimes(1));
    });

    it('is released when the read fails', async () => {
      const { fetchMock } = stubApi({
        'GET /api/shopping-list': () =>
          Response.json({
            id: 'l1',
            groups: [],
            summary: { remaining: 0, checked: 0 },
          }),
        'GET /api/voice/config': () => Response.json({ configured: true }),
        'POST /api/voice': () =>
          Response.json(
            { code: 'voice.nothing_heard', params: {} },
            { status: 422 },
          ),
      });
      vi.stubGlobal('fetch', fetchMock);
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      fireEvent.pointerUp(button);
      await screen.findByText(/Didn't catch anything/);
      await waitFor(() => expect(released).toHaveBeenCalledTimes(1));
    });

    it('is released even when the grant arrives after the press ended', async () => {
      let grant: (lock: { release: () => Promise<void> }) => void = () => {};
      request.mockImplementation(
        () => new Promise((resolve) => (grant = resolve)),
      );
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      fireEvent.pointerMove(button, { clientX: 10, clientY: 530 });
      fireEvent.pointerUp(button);
      await act(async () => grant({ release: released }));
      expect(released).toHaveBeenCalledTimes(1);
    });

    it('is released on Escape, a pointer cancel, the 60 s auto-stop and leaving the page', async () => {
      setup();
      const view = renderWithProviders(<ShoppingPage />);
      await hold();
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(released).toHaveBeenCalledTimes(1));

      const button = await talkButton();
      pressDown(button);
      await screen.findByText('Listening');
      fireEvent.pointerCancel(button);
      await waitFor(() => expect(released).toHaveBeenCalledTimes(2));

      pressDown(button);
      await screen.findByText('Listening');
      await holdFor(60_000);
      await screen.findByRole('dialog');
      await waitFor(() => expect(released).toHaveBeenCalledTimes(3));

      view.unmount();
      resetVoiceNote();
      const second = renderWithProviders(<ShoppingPage />);
      await hold();
      second.unmount();
      await waitFor(() => expect(released).toHaveBeenCalledTimes(4));
      expect(request).toHaveBeenCalledTimes(4);
    });

    it('is skipped silently when the browser has none, or refuses', async () => {
      request.mockImplementation(() => Promise.reject(new Error('denied')));
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      fireEvent.pointerUp(button);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(released).not.toHaveBeenCalled();
    });

    it('works where wakeLock is unsupported', async () => {
      vi.stubGlobal(
        'navigator',
        Object.assign(Object.create(navigator), { vibrate }),
      );
      setup();
      renderWithProviders(<ShoppingPage />);
      const button = await hold();
      fireEvent.pointerUp(button);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('keyboard order', () => {
    it('tabs from the page to the Scan Language chip, then the button, then the Dock', async () => {
      setup();
      renderWithProviders(
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/shopping" element={<ShoppingPage />} />
          </Route>
        </Routes>,
        { route: '/shopping' },
      );
      const chip = await screen.findByRole('button', {
        name: /Scan Language: English/,
      });
      const button = await talkButton();
      const dock = screen.getByRole('navigation');

      chip.focus();
      // Before the chip is the page itself.
      await userEvent.tab({ shift: true });
      expect(document.querySelector('main')).toContainElement(
        document.activeElement as HTMLElement,
      );
      await userEvent.tab();
      expect(chip).toHaveFocus();
      await userEvent.tab();
      expect(button).toHaveFocus();
      await userEvent.tab();
      expect(dock.contains(document.activeElement)).toBe(true);
      await userEvent.tab({ shift: true });
      expect(button).toHaveFocus();
      await userEvent.tab({ shift: true });
      expect(chip).toHaveFocus();
    });
  });
});
