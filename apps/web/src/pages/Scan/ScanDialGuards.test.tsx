import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearReview } from '../../lib/review';
import { renderWithProviders, stubApi } from '../../test/render';
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
}));
vi.mock('react-easy-crop', () => ({
  default: () => <div data-testid="cropper" />,
}));

function setup(route: string, routes: Record<string, () => Response> = {}) {
  const { fetchMock } = stubApi({
    'GET /api/catalog/parents': () => Response.json({ parents: [] }),
    ...routes,
  });
  vi.stubGlobal('fetch', fetchMock);
  renderWithProviders(
    <Routes>
      <Route path="/scan" element={<ScanPage />} />
    </Routes>,
    { route },
  );
}

const dial = () => screen.getByRole('radiogroup', { name: 'Scan mode' });
const checked = () =>
  within(dial())
    .getAllByRole('radio')
    .filter((r) => r.getAttribute('aria-checked') === 'true')
    .map((r) => r.getAttribute('aria-label') ?? r.textContent);

describe('Scan mode dial: when arrows must not change the mode', () => {
  beforeEach(() => {
    clearReview();
    localStorage.clear();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:photo');
    vi.spyOn(URL, 'revokeObjectURL').mockReturnValue();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('ignores arrows while the receipt cropper is open', async () => {
    setup('/scan?mode=receipt');
    fireEvent.change(screen.getByTestId('gallery-input'), {
      target: {
        files: [new File(['x'], 'a.jpg', { type: 'image/jpeg' })],
      },
    });
    await screen.findByRole('dialog', { name: 'Crop receipt' });
    await userEvent.keyboard('{ArrowRight}');
    expect(
      screen.getByRole('dialog', { name: 'Crop receipt' }),
    ).toBeInTheDocument();
    expect(checked()).toEqual(['Receipt']);
  });

  it('ignores arrows while the Info sheet is open', async () => {
    setup('/scan?mode=product');
    await userEvent.click(
      screen.getByRole('button', { name: 'How scanning works' }),
    );
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(checked()).toEqual(['Product']);
  });

  it('leaves arrows to the Scan Language select', async () => {
    setup('/scan?mode=product');
    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{ArrowLeft}');
    expect(checked()).toEqual(['Product']);
  });

  it('leaves arrows to a textarea and an editable element', async () => {
    setup('/scan?mode=product');
    const area = document.createElement('textarea');
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    document.body.append(area, editable);
    try {
      area.focus();
      await userEvent.keyboard('{ArrowRight}');
      fireEvent.keyDown(editable, { key: 'ArrowRight' });
      expect(checked()).toEqual(['Product']);
    } finally {
      area.remove();
      editable.remove();
    }
  });

  it.each(['altKey', 'ctrlKey', 'metaKey'])(
    'ignores an arrow pressed with %s',
    (modifier) => {
      setup('/scan?mode=product');
      fireEvent.keyDown(document.body, { key: 'ArrowLeft', [modifier]: true });
      expect(checked()).toEqual(['Product']);
    },
  );

  it('ignores an arrow another handler already handled', () => {
    setup('/scan?mode=product');
    const handled = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    handled.preventDefault();
    document.body.dispatchEvent(handled);
    expect(checked()).toEqual(['Product']);
  });

  it('moves focus to the newly selected radio after an arrow press', async () => {
    setup('/scan?mode=product');
    within(dial()).getByRole('radio', { name: 'Product' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(
        within(dial()).getByRole('radio', { name: 'Ingredients' }),
      ).toHaveFocus(),
    );
  });

  it('announces the change in the dial status, naming the new mode', async () => {
    setup('/scan?mode=product');
    await userEvent.click(within(dial()).getByRole('radio', { name: 'Plate' }));
    const live = screen
      .getAllByRole('status')
      .filter((el) => el.textContent?.trim() === 'Plate');
    expect(live).toHaveLength(1);
  });
});
