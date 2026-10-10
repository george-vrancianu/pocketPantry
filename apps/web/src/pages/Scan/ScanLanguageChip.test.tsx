import { screen, within } from '@testing-library/react';
import { scanViaGuide } from '../../test/scan';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReview } from '../../lib/review';
import { renderWithProviders, stubApi } from '../../test/render';
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
vi.mock('../../lib/image', () => ({
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,YQ=='),
  cropToReceiptGuide: () => Promise.resolve('data:image/jpeg;base64,Y3JvcA=='),
}));

const line = {
  name: 'Cheese',
  match: null,
  lowConfidence: false,
  quantity: null,
  unit: null,
  expiryDate: null,
  sourceText: 'OST 200G',
  productDescription: null,
};

const chipName = /Reading as|Citit ca|Læses på/;
const chip = () => screen.getByRole('combobox', { name: chipName });

function renderScan(route: string) {
  const { fetchMock, calls } = stubApi({
    'GET /api/catalog/parents': () => Response.json({ parents: [] }),
    'POST /api/scan/product': () => Response.json({ lines: [line] }),
    'POST /api/scan/ingredients': () => Response.json({ lines: [line] }),
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/scan/review" element={<ReviewPage />} />
    </Routes>,
    { route },
  );
  return calls;
}

describe('Scan Language chip in the top bar', () => {
  beforeEach(() => {
    clearReview();
    window.localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('sits in the top bar', () => {
    renderScan('/scan?mode=product');
    const bar = screen.getByRole('button', { name: 'Close scanner' })
      .parentElement as HTMLElement;
    expect(within(bar).getByRole('combobox', { name: chipName })).toBe(chip());
  });

  it('is compact: the languages are EN, RO and DA, the UI language first', () => {
    renderScan('/scan?mode=product');
    expect(
      Array.from(chip().querySelectorAll('option')).map((o) => o.textContent),
    ).toEqual(['EN', 'RO', 'DA']);
    expect(chip()).toHaveValue('en');
  });

  it.each(['product', 'ingredients', 'receipt'])(
    'is shown in %s mode',
    (mode) => {
      renderScan(`/scan?mode=${mode}`);
      expect(chip()).toBeVisible();
    },
  );

  it('is hidden in Plate mode', () => {
    renderScan('/scan?mode=plate');
    expect(
      screen.queryByRole('combobox', { name: chipName }),
    ).not.toBeInTheDocument();
  });

  it('sends the chosen Scan Language with the next Scan', async () => {
    const calls = renderScan('/scan?mode=product');
    await userEvent.selectOptions(chip(), 'ro');
    scanViaGuide();
    await screen.findByRole('button', { name: /Save 1 item/ });
    const scan = calls.find((c) => c.key === 'POST /api/scan/product');
    expect(new URLSearchParams(scan?.search).get('scanLanguage')).toBe('ro');
    expect(new URLSearchParams(scan?.search).get('locale')).toBe('en');
  });
});
