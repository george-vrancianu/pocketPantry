import { fireEvent, screen, within, waitFor } from '@testing-library/react';
import { scanGuide } from '../../test/scan';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppDock } from '../../components/AppDock';
import { clearReview } from '../../lib/review';
import { renderWithProviders, stubApi } from '../../test/render';
import { reviewRowNames } from '../../test/review';
import { ReviewPage } from '../Review/ReviewPage';
import { ScanPage } from './ScanPage';

vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: 'ready',
    torchSupported: true,
    capture: () => Promise.resolve(new Blob(['frame'], { type: 'image/jpeg' })),
    setTorch: () => Promise.resolve(true),
  }),
}));
vi.mock('../../lib/image', async (importActual) => ({
  ...(await importActual<typeof import('../../lib/image')>()),
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
  cropToReceiptGuide: () => Promise.resolve('data:image/jpeg;base64,Y3JvcA=='),
  cropToReceiptArea: () => Promise.resolve('data:image/jpeg;base64,Y3JvcA=='),
}));
vi.mock('react-easy-crop', async () => {
  const { useEffect } = await import('react');
  return {
    default: ({
      onCropComplete,
    }: {
      onCropComplete: (
        area: unknown,
        pixels: { x: number; y: number; width: number; height: number },
      ) => void;
    }) => {
      useEffect(() => {
        onCropComplete({}, { x: 10, y: 20, width: 300, height: 900 });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- report once, like the real cropper on load
      }, []);
      return <div data-testid="cropper" />;
    },
  };
});

const line = (name: string) => ({
  name,
  match: null,
  lowConfidence: false,
  quantity: 1,
  unit: 'pcs',
  expiryDate: null,
  productDescription: null,
});
const lines = (...names: string[]) => Response.json({ lines: names.map(line) });
const capReached = () =>
  Response.json(
    { code: 'scan.cap_reached', params: { cap: 30 } },
    { status: 429 },
  );
const providerDown = () =>
  Response.json(
    { code: 'scan.provider_incomplete', params: {} },
    { status: 502 },
  );

/** Renders the Scan screen in Receipt mode; the receipt endpoint answers with each response in turn. */
function setup(responses: Array<() => Response>) {
  const queue = [...responses];
  const { fetchMock, calls } = stubApi({
    'GET /api/catalog/parents': () => Response.json({ parents: [] }),
    'POST /api/scan/receipt': () => (queue.shift() ?? providerDown)(),
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <>
      <Routes>
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/scan/review/draft" element={<ReviewPage />} />
        <Route path="/pantry" element={<p>pantry page</p>} />
        <Route path="/" element={<p>home</p>} />
      </Routes>
      <AppDock variant="dark" activeKey="scan" />
    </>,
    { route: '/scan?mode=receipt' },
  );
  return { calls };
}

const click = (name: string) =>
  userEvent.click(screen.getByRole('button', { name }));
// Camera receipts join the Scan Session; Receipt Sections are still built from gallery photos.
const shoot = async () => {
  fireEvent.change(screen.getByTestId('gallery-input'), {
    target: { files: [new File(['x'], 'part.jpg', { type: 'image/jpeg' })] },
  });
  await userEvent.click(
    await screen.findByRole('button', { name: 'Use photo' }),
  );
};
const reviewNames = async () => {
  await waitFor(() => expect(reviewRowNames()).not.toHaveLength(0));
  return reviewRowNames();
};

// The Dock links to plain /scan, which opens the last-used Scan Mode.
const switchLastUsedToProduct = () =>
  localStorage.setItem('pocket-pantry.scan-mode', 'product');

describe('Receipt Scan in sections', () => {
  beforeEach(() => {
    clearReview();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:photo');
    vi.spyOn(URL, 'revokeObjectURL').mockReturnValue();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('shows each section result, then Finish lands on Review with all lines in section order', async () => {
    const { calls } = setup([() => lines('Eggs', 'Milk'), () => lines('Rice')]);
    await shoot();
    expect(
      await screen.findByText('Section 1: 2 lines found'),
    ).toBeInTheDocument();
    expect(screen.getByText('Eggs')).toBeInTheDocument();
    expect(scanGuide()).toHaveAttribute('aria-disabled', 'true');

    await click('Next photo');
    await shoot();
    expect(
      await screen.findByText('Section 2: 1 line found'),
    ).toBeInTheDocument();
    await click('Finish');

    expect(await reviewNames()).toEqual(['Eggs', 'Milk', 'Rice']);
    expect(
      calls.filter((c) => c.key === 'POST /api/scan/receipt'),
    ).toHaveLength(2);
  });

  it('locks the camera while a section is being read', async () => {
    let release: (r: Response) => void = () => undefined;
    const pending = new Promise<Response>((resolve) => (release = resolve));
    const { fetchMock } = stubApi({
      'GET /api/catalog/parents': () => Response.json({ parents: [] }),
    });
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) =>
      String(input).includes('/scan/receipt')
        ? pending
        : fetchMock(input, init),
    );
    renderWithProviders(<ScanPage />, { route: '/scan?mode=receipt' });
    await shoot();
    expect(await screen.findByText('Reading section 1…')).toBeInTheDocument();
    expect(scanGuide()).toHaveAttribute('aria-disabled', 'true');
    release(lines('Eggs'));
    expect(
      await screen.findByText('Section 1: 1 line found'),
    ).toBeInTheDocument();
  });

  it('retaking a section replaces only that section lines', async () => {
    setup([() => lines('Eggs'), () => lines('Rice'), () => lines('Flour')]);
    await shoot();
    await screen.findByText('Section 1: 1 line found');
    await click('Next photo');
    await shoot();
    await screen.findByText('Section 2: 1 line found');
    await click('Retake');
    await shoot();
    await screen.findByText('Section 2: 1 line found');
    expect(screen.getByText('Flour')).toBeInTheDocument();
    await click('Finish');
    expect(await reviewNames()).toEqual(['Eggs', 'Flour']);
  });

  it('lets a failed section be retaken', async () => {
    setup([() => lines('Eggs'), providerDown, () => lines('Rice')]);
    await shoot();
    await screen.findByText('Section 1: 1 line found');
    await click('Next photo');
    await shoot();
    expect(
      await screen.findByText('The scan did not finish. Please try again.'),
    ).toBeInTheDocument();
    await click('Retake');
    await shoot();
    await screen.findByText('Section 2: 1 line found');
    await click('Finish');
    expect(await reviewNames()).toEqual(['Eggs', 'Rice']);
  });

  it('keeps a section result when its retake fails', async () => {
    setup([() => lines('Eggs'), providerDown]);
    await shoot();
    await screen.findByText('Section 1: 1 line found');
    await click('Retake');
    await shoot();
    await screen.findByText('The scan did not finish. Please try again.');
    await click('Show section 1');
    expect(screen.getByText('Eggs')).toBeInTheDocument();
  });

  it('deleting a section removes its lines from Review', async () => {
    setup([() => lines('Eggs'), () => lines('Rice')]);
    await shoot();
    await screen.findByText('Section 1: 1 line found');
    await click('Next photo');
    await shoot();
    await screen.findByText('Section 2: 1 line found');
    await click('Show section 1');
    await click('Delete section');
    await click('Finish');
    expect(await reviewNames()).toEqual(['Rice']);
  });

  it('warns about a section with no lines without ending the batch', async () => {
    setup([() => lines(), () => lines('Rice')]);
    await shoot();
    expect(await screen.findByText(/No lines were found/)).toBeInTheDocument();
    await click('Next photo');
    expect(scanGuide()).not.toHaveAttribute('aria-disabled');
    await shoot();
    await screen.findByText('Section 2: 1 line found');
    await click('Finish');
    expect(await reviewNames()).toEqual(['Rice']);
  });

  it('says nothing was found when Finish is pressed with no lines at all', async () => {
    setup([() => lines()]);
    await shoot();
    await screen.findByText(/No lines were found/);
    await click('Finish');
    expect(
      await screen.findByText(/could not spot any ingredients/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
  });

  it('stops at 10 sections with a message', async () => {
    setup(Array.from({ length: 10 }, (_, i) => () => lines(`Item ${i}`)));
    for (let i = 0; i < 10; i++) {
      await shoot();
      await screen.findByText(`Section ${i + 1}: 1 line found`);
      await click('Next photo');
    }
    expect(screen.getByText(/limit of 10 sections/)).toBeInTheDocument();
    expect(scanGuide()).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not announce the limit while the 10th result is still on screen', async () => {
    setup(Array.from({ length: 10 }, (_, i) => () => lines(`Item ${i}`)));
    for (let i = 0; i < 9; i++) {
      await shoot();
      await screen.findByText(`Section ${i + 1}: 1 line found`);
      await click('Next photo');
    }
    await shoot();
    await screen.findByText('Section 10: 1 line found');
    expect(screen.queryByText(/limit of 10 sections/)).not.toBeInTheDocument();
    await click('Next photo');
    expect(screen.getByText(/limit of 10 sections/)).toBeInTheDocument();
  });

  it('disables the Scan Mode buttons while a section is being read', async () => {
    let release: (r: Response) => void = () => undefined;
    const pending = new Promise<Response>((resolve) => (release = resolve));
    const { fetchMock } = stubApi({
      'GET /api/catalog/parents': () => Response.json({ parents: [] }),
    });
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) =>
      String(input).includes('/scan/receipt')
        ? pending
        : fetchMock(input, init),
    );
    renderWithProviders(<ScanPage />, { route: '/scan?mode=receipt' });
    await shoot();
    await screen.findByText('Reading section 1…');
    expect(screen.getByRole('radio', { name: 'Product' })).toBeDisabled();
    release(lines('Eggs'));
    await screen.findByText('Section 1: 1 line found');
    expect(screen.getByRole('radio', { name: 'Product' })).toBeEnabled();
  });

  it('reports a reached Scan Cap and lets the Member finish what was read', async () => {
    setup([() => lines('Eggs'), capReached]);
    await shoot();
    await screen.findByText('Section 1: 1 line found');
    await click('Next photo');
    await shoot();
    expect(await screen.findByText(/used all 30 scans/)).toBeInTheDocument();
    await click('Finish');
    expect(await reviewNames()).toEqual(['Eggs']);
  });

  describe('leaving with sections pending', () => {
    it('asks before closing and stays when declined', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
      setup([() => lines('Eggs')]);
      await shoot();
      await screen.findByText('Section 1: 1 line found');
      await click('Close scanner');
      expect(confirm).toHaveBeenCalled();
      expect(screen.queryByText('home')).not.toBeInTheDocument();
      confirm.mockReturnValue(true);
      await click('Close scanner');
      expect(await screen.findByText('home')).toBeInTheDocument();
    });

    it('asks before switching Scan Mode and keeps the sections when declined', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
      setup([() => lines('Eggs')]);
      await shoot();
      await screen.findByText('Section 1: 1 line found');
      await userEvent.click(screen.getByRole('radio', { name: 'Product' }));
      expect(confirm).toHaveBeenCalled();
      expect(screen.getByRole('radio', { name: 'Receipt' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      expect(
        within(screen.getByRole('group', { name: 'Section 1' })).getByText(
          'Eggs',
        ),
      ).toBeInTheDocument();
    });

    it('asks before the Dock leaves the screen and stays when declined', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
      setup([() => lines('Eggs')]);
      await shoot();
      await screen.findByText('Section 1: 1 line found');
      await userEvent.click(screen.getByRole('link', { name: 'Pantry' }));
      expect(confirm).toHaveBeenCalled();
      expect(screen.queryByText('pantry page')).not.toBeInTheDocument();
      confirm.mockReturnValue(true);
      await userEvent.click(screen.getByRole('link', { name: 'Pantry' }));
      expect(await screen.findByText('pantry page')).toBeInTheDocument();
    });

    it('drops the batch and its guards when the Dock Scan item switches to Product', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      setup([() => lines('Eggs')]);
      await shoot();
      await screen.findByText('Section 1: 1 line found');
      switchLastUsedToProduct();
      await userEvent.click(screen.getByRole('link', { name: 'Scan' }));
      expect(confirm).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('radio', { name: 'Product' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
      // The leave guard is gone: the Dock leaves without asking again.
      await userEvent.click(screen.getByRole('link', { name: 'Pantry' }));
      expect(await screen.findByText('pantry page')).toBeInTheDocument();
      expect(confirm).toHaveBeenCalledTimes(1);
    });

    it('does not bring the batch back when switching to Receipt after the Dock Scan item', async () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      setup([() => lines('Eggs')]);
      await shoot();
      await screen.findByText('Section 1: 1 line found');
      switchLastUsedToProduct();
      await userEvent.click(screen.getByRole('link', { name: 'Scan' }));
      await userEvent.click(screen.getByRole('radio', { name: 'Receipt' }));
      expect(confirm).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByRole('group', { name: 'Section 1' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Eggs')).not.toBeInTheDocument();
    });

    it('throws away a section read that lands after the Dock Scan item switched to Product', async () => {
      const confirm = vi.spyOn(window, 'confirm');
      let release: (r: Response) => void = () => undefined;
      const pending = new Promise<Response>((resolve) => (release = resolve));
      const { fetchMock } = stubApi({
        'GET /api/catalog/parents': () => Response.json({ parents: [] }),
      });
      vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) =>
        String(input).includes('/scan/receipt')
          ? pending
          : fetchMock(input, init),
      );
      renderWithProviders(
        <>
          <Routes>
            <Route path="/scan" element={<ScanPage />} />
          </Routes>
          <AppDock variant="dark" activeKey="scan" />
        </>,
        { route: '/scan?mode=receipt' },
      );
      await shoot();
      await screen.findByText('Reading section 1…');
      switchLastUsedToProduct();
      await userEvent.click(screen.getByRole('link', { name: 'Scan' }));
      expect(confirm).not.toHaveBeenCalled();
      release(lines('Eggs'));
      await new Promise((r) => setTimeout(r, 20));
      await userEvent.click(screen.getByRole('radio', { name: 'Receipt' }));
      expect(confirm).not.toHaveBeenCalled();
      expect(screen.queryByText('Eggs')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('group', { name: 'Section 1' }),
      ).not.toBeInTheDocument();
    });

    it('lets the Dock leave without asking when nothing has been scanned', async () => {
      const confirm = vi.spyOn(window, 'confirm');
      setup([]);
      await userEvent.click(screen.getByRole('link', { name: 'Pantry' }));
      expect(await screen.findByText('pantry page')).toBeInTheDocument();
      expect(confirm).not.toHaveBeenCalled();
    });

    it('does not ask when nothing has been scanned', async () => {
      const confirm = vi.spyOn(window, 'confirm');
      setup([]);
      await click('Close scanner');
      expect(confirm).not.toHaveBeenCalled();
    });
  });
});
