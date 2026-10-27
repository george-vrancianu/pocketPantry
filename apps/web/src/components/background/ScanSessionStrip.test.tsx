// The fake voice environment registers its mocks, so it comes before anything that reaches the microphone.
import {
  resetVoiceEnvironment,
  stubVoiceFetch,
  talkButton,
} from '../../test/voice';
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dispatchScanSession, resetScanSession } from '../../lib/scanSession';
import type { CameraMode } from '../../lib/cameraMode';
import { renderWithProviders, stubApi } from '../../test/render';
import {
  holdLongEnough,
  pressDown,
  useVoiceTimers,
} from '../../test/voiceHold';
import { AppLayout } from '../AppLayout';
import ro from '../../i18n/locales/ro/background.json';
import da from '../../i18n/locales/da/background.json';

/** Puts a Scan in the Scan Session as the camera would: queued, started and, unless told otherwise, read. */
const seed = (
  id: string,
  mode: CameraMode,
  outcome: 'reading' | 'read' | 'error' | 'cap' = 'read',
) =>
  act(() => {
    dispatchScanSession({
      type: 'enqueue',
      scan: {
        id,
        mode,
        scanLanguage: 'en',
        image: 'data:image/jpeg;base64,YQ==',
        thumbnail: 'data:image/jpeg;base64,YQ==',
      },
    });
    dispatchScanSession({ type: 'start' });
    if (outcome === 'read')
      dispatchScanSession({ type: 'read', id, lines: [] });
    if (outcome === 'error' || outcome === 'cap')
      dispatchScanSession({ type: 'fail', id, reason: outcome });
  });

function renderAt(route = '/shopping') {
  return renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/shopping"
          element={
            <>
              <Link to="/scan">to the camera</Link>
              <Link to="/pantry">to the pantry</Link>
            </>
          }
        />
        <Route path="/scan" element={<Link to="/shopping">back</Link>} />
        <Route
          path="/pantry"
          element={<Link to="/shopping">to shopping</Link>}
        />
        <Route path="/scan/review" element={<p>review overview</p>} />
        <Route path="/scan/review/:scanId" element={<p>line editor</p>} />
      </Route>
    </Routes>,
    { route },
  );
}

// The layout's refresh loader keeps an empty status region of its own on every screen.
const strip = () => {
  const filled = screen
    .queryAllByRole('status')
    .filter((el) => el.textContent !== '');
  expect(filled.length).toBeLessThanOrEqual(1);
  return filled[0];
};

/** The strip's border as its styles declare it (jsdom cannot compute a border made of a theme variable). */
const outline = () => {
  const classes = Array.from(strip().parentElement!.classList);
  const rules = Array.from(document.styleSheets).flatMap((sheet) =>
    Array.from(sheet.cssRules),
  );
  return rules
    .filter((rule) => classes.some((c) => rule.cssText.includes(`.${c}`)))
    .map((rule) => rule.cssText)
    .join('\n');
};

describe('the Scan Session in the background strip', () => {
  beforeEach(() => {
    const { fetchMock } = stubApi({
      'GET /api/voice/config': () => Response.json({ configured: false }),
    });
    stubVoiceFetch(fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('shows nothing while the Scan Session holds no Scan, however voice is configured', () => {
    renderAt();
    expect(strip()).toBeUndefined();
  });

  it('shows after the Member leaves the camera, and is hidden on it', async () => {
    seed('a', 'receipt', 'reading');
    renderAt('/scan');
    expect(strip()).toBeUndefined();

    await userEvent.click(screen.getByRole('link', { name: 'back' }));
    expect(strip()).toHaveTextContent('1 receipt');
    expect(strip()).toHaveTextContent('1 reading');
  });

  it('is hidden on the Review overview', () => {
    seed('a', 'receipt');
    renderAt('/scan/review');
    expect(screen.getByText('review overview')).toBeVisible();
    expect(strip()).toBeUndefined();
  });

  it("is hidden on a Scan's line editor", () => {
    seed('a', 'receipt');
    renderAt('/scan/review/a');
    expect(screen.getByText('line editor')).toBeVisible();
    expect(strip()).toBeUndefined();
  });

  it('is one item however many Scans it holds, with its read and reading summary', () => {
    seed('a', 'receipt');
    seed('b', 'receipt');
    seed('c', 'receipt', 'reading');
    renderAt();
    expect(strip()).toHaveTextContent('3 receipts');
    expect(strip()).toHaveTextContent('2 read · 1 reading');
    expect(screen.queryByText(/in the background/)).toBeNull();
  });

  it('is a photo item unless every Scan is a receipt, and leaves out barcode lookups and uncropped receipts', () => {
    seed('a', 'receipt');
    seed('b', 'product');
    seed('code', 'barcode', 'reading');
    act(() =>
      dispatchScanSession({
        type: 'enqueue',
        scan: {
          id: 'g',
          mode: 'receipt',
          thumbnail: 'blob',
          source: new Blob(),
        },
      }),
    );
    renderAt();
    expect(strip()).toHaveTextContent('2 photos');
    expect(strip()).toHaveTextContent('2 read');
  });

  it('opens the Review overview when tapped, reading or read', async () => {
    seed('a', 'receipt', 'reading');
    renderAt();
    await userEvent.click(strip());
    expect(await screen.findByText('review overview')).toBeVisible();
  });

  it('opens the Review overview from its button once every Scan is read', async () => {
    seed('a', 'product');
    renderAt();
    await userEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(await screen.findByText('review overview')).toBeVisible();
  });

  it.each([
    ['failed', 'error'],
    ['capped', 'cap'],
  ] as const)(
    'outlines the strip as a failure when a Scan is %s',
    (_name, outcome) => {
      seed('a', 'receipt');
      seed('b', 'receipt', outcome);
      renderAt();
      expect(strip()).toHaveTextContent('1 read · 1 failed');
      expect(outline()).toMatch(/border: 2px solid/);
    },
  );

  it('announces a failure once as an alert, and not again when the host remounts', async () => {
    seed('a', 'receipt');
    seed('b', 'receipt', 'error');
    seed('c', 'receipt', 'error');
    renderAt('/scan');
    await userEvent.click(screen.getByRole('link', { name: 'back' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '2 Scans failed',
    );

    // Off to the camera and back: the host remounts, the same failures are not announced again.
    await userEvent.click(screen.getByRole('link', { name: 'to the camera' }));
    await userEvent.click(screen.getByRole('link', { name: 'back' }));
    expect(strip()).toHaveTextContent('2 failed');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('takes the alert down when the Member changes page, and does not announce it again', async () => {
    seed('a', 'receipt');
    renderAt();
    seed('b', 'receipt', 'error');
    expect(await screen.findByRole('alert')).toHaveTextContent('1 Scan failed');

    await userEvent.click(screen.getByRole('link', { name: 'to the pantry' }));
    expect(strip()).toHaveTextContent('1 failed');
    expect(screen.queryByRole('alert')).toBeNull();

    await userEvent.click(screen.getByRole('link', { name: 'to shopping' }));
    expect(strip()).toHaveTextContent('1 failed');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('announces the first failures of a new Session after the previous Session alert', async () => {
    seed('a', 'receipt', 'error');
    seed('b', 'receipt', 'error');
    renderAt();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '2 Scans failed',
    );
    // The Session ends (Review saved it, or the Member signed out) and a new one fails once.
    act(() => resetScanSession());
    seed('c', 'receipt', 'error');
    expect(await screen.findByRole('alert')).toHaveTextContent('1 Scan failed');
  });

  it('buzzes once when the last reading Scan is read while the Member is on a Dock page', async () => {
    const vibrate = vi.fn();
    vi.stubGlobal('navigator', { ...navigator, vibrate });
    seed('a', 'receipt', 'reading');
    renderAt();
    expect(vibrate).not.toHaveBeenCalled();
    act(() => dispatchScanSession({ type: 'read', id: 'a', lines: [] }));
    expect(vibrate).toHaveBeenCalledTimes(1);
  });

  it('does not buzz for a Session that was already read when the Member arrived', async () => {
    const vibrate = vi.fn();
    vi.stubGlobal('navigator', { ...navigator, vibrate });
    seed('a', 'receipt');
    renderAt('/scan');
    await userEvent.click(screen.getByRole('link', { name: 'back' }));
    expect(strip()).toHaveTextContent('1 read');
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('has no failure outline while every Scan reads or is read', () => {
    seed('a', 'receipt');
    seed('b', 'receipt', 'reading');
    renderAt();
    expect(outline()).not.toMatch(/border: 2px solid/);
  });

  it('rests as the dark pill with a happy Gator once all are read', () => {
    seed('a', 'receipt');
    renderAt();
    expect(
      strip().parentElement!.querySelector('img[data-mood]'),
    ).toHaveAttribute('data-mood', 'happy');
  });

  it('shows the reading art while Scans are read', async () => {
    seed('a', 'receipt', 'reading');
    renderAt();
    expect(strip().parentElement!.querySelector('svg')).not.toBeNull();
  });
});

describe('the Scan Session and Voice Notes in the strip', () => {
  let fake: ReturnType<typeof stubVoiceFetch>;
  beforeEach(() => {
    useVoiceTimers();
    resetVoiceEnvironment();
    const { fetchMock } = stubApi({
      'GET /api/voice/config': () => Response.json({ configured: true }),
    });
    fake = stubVoiceFetch(fetchMock);
    fake.holdReads();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  async function speak() {
    const button = await talkButton();
    pressDown(button);
    await screen.findByText("Gator's listening");
    await holdLongEnough();
    fireEvent.pointerUp(button);
    await waitFor(() => expect(fake.reads).toHaveLength(1));
  }

  it('counts the Scan Session once beside a Voice Note, with the general summary and Open', async () => {
    seed('a', 'receipt', 'reading');
    seed('b', 'receipt', 'reading');
    renderAt();
    await speak();
    expect(await screen.findByText('2 in the background')).toBeVisible();
    expect(strip()).toHaveTextContent('2 reading');

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const sheet = await screen.findByRole('dialog', {
      name: 'In the background',
    });
    expect(sheet.querySelectorAll('li')).toHaveLength(2);
    expect(sheet).toHaveTextContent('2 receipts');
  });

  it('opens the Review overview from the Scan Session row of the sheet', async () => {
    seed('a', 'receipt', 'reading');
    renderAt();
    await speak();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const sheet = await screen.findByRole('dialog', {
      name: 'In the background',
    });
    const row = Array.from(sheet.querySelectorAll('li')).find((li) =>
      li.textContent?.includes('1 receipt'),
    )!;
    expect(
      within(row).getByRole('button', { name: 'Review 1 receipt' }),
    ).toBeVisible();
    await userEvent.click(row.querySelector('button')!);
    expect(await screen.findByText('review overview')).toBeVisible();
  });

  // Pins today's choice (inherited from the Voice Inbox strip, still waiting for a human decision):
  // with exactly one ready item among several, the strip button opens that item rather than the sheet.
  it('with one ready item among several, the button is Review and opens that item', async () => {
    seed('a', 'receipt');
    renderAt();
    await speak();
    expect(await screen.findByText('2 in the background')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(await screen.findByText('review overview')).toBeVisible();
  });
});

describe('the failure alert copy', () => {
  it('has plural forms in Romanian and Danish', () => {
    expect(ro.scan.failedAlert_few).toContain('{{count}}');
    expect(da.scan.failedAlert_other).toContain('{{count}}');
  });
});

describe('the background copy for Scan Sessions', () => {
  it('has plural forms in Romanian and Danish', () => {
    expect(ro.scan.receipt_few).toContain('{{count}}');
    expect(da.scan.receipt_other).toContain('{{count}}');
  });
});
