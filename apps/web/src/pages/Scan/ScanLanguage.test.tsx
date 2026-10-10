import { act, cleanup, screen } from '@testing-library/react';
import { scanViaGuide } from '../../test/scan';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReview } from '../../lib/review';
import { renderWithProviders, stubApi } from '../../test/render';
import { ReviewPage } from '../Review/ReviewPage';
import { ScanPage } from './ScanPage';

// jsdom has no camera or canvas: the camera and the image preparation are the seams.
vi.mock('../../lib/camera', () => ({
  useCamera: () => ({
    videoRef: { current: null },
    status: 'ready',
    torchSupported: true,
    capture: () => Promise.resolve(new Blob(['frame'], { type: 'image/jpeg' })),
    setTorch: () => Promise.resolve(true),
  }),
}));
vi.mock('../../lib/image', () => ({
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
  cropToReceiptGuide: () => Promise.resolve('data:image/jpeg;base64,Y3JvcA=='),
}));

const unmatchedLine = {
  name: 'Cheese',
  match: null,
  lowConfidence: false,
  quantity: null,
  unit: null,
  expiryDate: null,
  sourceText: 'OST 200G',
  productDescription: null,
};

const chip = () =>
  screen.getByRole('combobox', { name: /Reading as|Citit ca|Læses på/ });

function renderScan(
  route: string,
  routes: Record<string, () => Response> = {},
  locale: 'en' | 'ro' | 'da' = 'en',
) {
  const { fetchMock, calls } = stubApi({
    'GET /api/catalog/parents': () => Response.json({ parents: [] }),
    'POST /api/scan/product': () => Response.json({ lines: [unmatchedLine] }),
    'POST /api/scan/ingredients': () =>
      Response.json({ lines: [unmatchedLine] }),
    'POST /api/scan/receipt': () => Response.json({ lines: [unmatchedLine] }),
    'POST /api/scan/receipt/confirm': () =>
      Response.json({ batches: [], matchedShoppingItemIds: [] }),
    'POST /api/pantry/batches/bulk': () => Response.json({ batches: [] }),
    ...routes,
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review" element={<ReviewPage />} />
      <Route path="/pantry" element={<p>pantry screen</p>} />
    </Routes>,
    { route, locale },
  );
  return calls;
}

describe('Scan Language on the Scan screen', () => {
  beforeEach(() => {
    clearReview();
    window.localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('shows the UI language as the default, listed first among the three languages', () => {
    renderScan('/scan', {}, 'ro');
    expect(chip()).toHaveValue('ro');
    expect(
      Array.from(chip().querySelectorAll('option')).map((o) => o.textContent),
    ).toEqual(['RO', 'EN', 'DA']);
  });

  it('defaults to Dansk under a Danish UI, listed first', () => {
    renderScan('/scan', {}, 'da');
    expect(chip()).toHaveValue('da');
    expect(
      Array.from(chip().querySelectorAll('option')).map((o) => o.textContent),
    ).toEqual(['DA', 'EN', 'RO']);
  });

  it('forgets a Scan Language chosen under a Danish UI when the UI language changes', async () => {
    const { i18n } = renderWithProviders(<ScanPage />, {
      route: '/scan',
      locale: 'da',
    });
    await userEvent.selectOptions(chip(), 'ro');
    await act(() => i18n.changeLanguage('en'));
    expect(chip()).toHaveValue('en');
    await act(() => i18n.changeLanguage('da'));
    expect(chip()).toHaveValue('da');
  });

  it('changes the Scan Language without changing the UI language', async () => {
    renderScan('/scan');
    await userEvent.selectOptions(chip(), 'da');
    expect(chip()).toHaveValue('da');
    expect(screen.getByRole('button', { name: 'Close scanner' })).toBeVisible();
    expect(document.documentElement.lang).toBe('en');
  });

  it('keeps the choice across a reload, and starts from the UI language again when that changes', async () => {
    renderScan('/scan');
    await userEvent.selectOptions(chip(), 'da');
    cleanup();
    renderScan('/scan');
    expect(chip()).toHaveValue('da');
    cleanup();
    renderScan('/scan', {}, 'ro');
    expect(chip()).toHaveValue('ro');
  });

  it('forgets the choice when the UI language changes, even if it changes back', async () => {
    const { i18n } = renderWithProviders(<ScanPage />, {
      route: '/scan',
      locale: 'ro',
    });
    await userEvent.selectOptions(chip(), 'da');
    await act(() => i18n.changeLanguage('en'));
    expect(chip()).toHaveValue('en');
    await act(() => i18n.changeLanguage('ro'));
    expect(chip()).toHaveValue('ro');
  });

  it('has no picker for Plate Scan', () => {
    renderScan('/scan?mode=plate');
    expect(
      screen.queryByRole('combobox', { name: /Reading as|Citit ca|Læses på/ }),
    ).not.toBeInTheDocument();
  });

  it.each(['product', 'ingredients'])(
    '%s Scan reads in the chosen language, and Review saves in it with the printed text',
    async (mode) => {
      const calls = renderScan(`/scan?mode=${mode}`);
      await userEvent.selectOptions(chip(), 'da');
      scanViaGuide();
      await userEvent.click(
        await screen.findByRole('button', { name: 'Save 1 item' }),
      );
      await screen.findByText('pantry screen');
      const scan = calls.find((c) => c.key === `POST /api/scan/${mode}`);
      expect(new URLSearchParams(scan?.search).get('scanLanguage')).toBe('da');
      expect(new URLSearchParams(scan?.search).get('locale')).toBe('en');
      const save = calls.find((c) => c.key === 'POST /api/pantry/batches/bulk');
      expect(new URLSearchParams(save?.search).get('scanLanguage')).toBe('da');
      expect(save?.body).toMatchObject({
        batches: [{ rawName: 'Cheese', sourceText: 'OST 200G' }],
      });
    },
  );

  it('reads every Receipt Section in the chosen language, locks the picker once one is captured, and confirms in it', async () => {
    const calls = renderScan('/scan?mode=receipt');
    await userEvent.selectOptions(chip(), 'da');
    expect(chip()).toBeEnabled();
    scanViaGuide();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Finish' }),
    );
    const scan = calls.find((c) => c.key === 'POST /api/scan/receipt');
    expect(new URLSearchParams(scan?.search).get('scanLanguage')).toBe('da');
    await userEvent.click(
      await screen.findByRole('button', { name: 'Save 1 item' }),
    );
    await screen.findByText('pantry screen');
    const confirm = calls.find(
      (c) => c.key === 'POST /api/scan/receipt/confirm',
    );
    expect(new URLSearchParams(confirm?.search).get('scanLanguage')).toBe('da');
  });

  it('disables the picker after the first Receipt Section', async () => {
    renderScan('/scan?mode=receipt');
    scanViaGuide();
    await screen.findByRole('button', { name: 'Finish' });
    expect(chip()).toBeDisabled();
  });
});
