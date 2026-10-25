import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { dispatchScanSession, resetScanSession } from '../../lib/scanSession';
import { Where } from '../../test/intro';
import { renderWithProviders, stubApi } from '../../test/render';
import { scanOnce, shutter } from '../../test/scan';
import { ReviewOverviewPage } from '../Review/ReviewOverviewPage';
import { ScanPage, type ScanPageProps } from './ScanPage';

vi.mock('../../lib/image', async (importActual) => ({
  ...(await importActual<typeof import('../../lib/image')>()),
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
}));
vi.mock('../../lib/camera', async () =>
  (await import('../../test/scan')).fakeCameraModule(),
);

function renderCamera(settings: ScanPageProps) {
  const { fetchMock } = stubApi({
    'POST /api/scan/ingredients': () => Response.json({ lines: [] }),
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <>
      <Routes>
        <Route path="/host/camera" element={<ScanPage {...settings} />} />
        <Route path="*" element={<p>elsewhere</p>} />
      </Routes>
      <Where />
    </>,
    { route: '/host/camera?mode=ingredients' },
  );
}
const where = () => screen.getByLabelText('Where').textContent;

describe('The Scan screen takes its behaviour from the host', () => {
  beforeEach(() => {
    localStorage.clear();
    resetScanSession();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('offers the Import button unless the host turns it off', () => {
    renderCamera({ importOffered: true });
    expect(
      screen.getByRole('button', { name: 'Import from photos' }),
    ).toBeInTheDocument();
  });

  it('hides Import, calls the host after the shutter and sends Close where the host says', async () => {
    const onShot = vi.fn();
    renderCamera({
      importOffered: false,
      onShot,
      closeTo: '/host/home',
      modes: ['ingredients', 'receipt'],
    });
    expect(
      screen.queryByRole('button', { name: 'Import from photos' }),
    ).toBeNull();
    await scanOnce();
    expect(onShot).toHaveBeenCalledTimes(1);
    expect(where()).toBe('/host/camera?mode=ingredients');
    expect(shutter()).toBeInTheDocument();

    resetScanSession();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Close scanner' }));
    expect(where()).toBe('/host/home');
  });

  it('opens the photo stack where the host says', async () => {
    const openStack = vi.fn();
    renderCamera({ openStack });
    act(() =>
      dispatchScanSession({
        type: 'enqueue',
        scan: {
          id: 'first',
          mode: 'ingredients',
          scanLanguage: 'en',
          image: 'data:image/jpeg;base64,YQ==',
          thumbnail: 'data:image/jpeg;base64,YQ==',
        },
      }),
    );
    await userEvent
      .setup()
      .click(await screen.findByRole('button', { name: /Review/ }));
    expect(openStack).toHaveBeenCalledWith('first');
  });
});

describe('The Review overview takes its behaviour from the host', () => {
  beforeEach(() => resetScanSession());
  afterEach(() => vi.unstubAllGlobals());

  it('wraps the overview in the host frame and opens cards and the camera at the host paths', async () => {
    act(() =>
      dispatchScanSession({
        type: 'enqueue',
        scan: {
          id: 'one',
          mode: 'ingredients',
          scanLanguage: 'en',
          image: 'data:image/jpeg;base64,YQ==',
          thumbnail: 'data:image/jpeg;base64,YQ==',
        },
      }),
    );
    const { fetchMock } = stubApi({});
    vi.stubGlobal('fetch', fetchMock);
    renderWithProviders(
      <>
        <Routes>
          <Route
            path="/host/review"
            element={
              <ReviewOverviewPage
                settings={{
                  cameraPath: '/host/camera',
                  cardPath: (id) => `/host/review/${id}`,
                  renderFrame: (content) => (
                    <section aria-label="Host frame">{content}</section>
                  ),
                }}
              />
            }
          />
          <Route path="*" element={<p>elsewhere</p>} />
        </Routes>
        <Where />
      </>,
      { route: '/host/review' },
    );
    const frame = await screen.findByRole('region', { name: 'Host frame' });
    expect(frame).toContainElement(screen.getByTestId('review-overview'));
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: /Take more/ }));
    expect(where()).toBe('/host/camera');
  });
});
