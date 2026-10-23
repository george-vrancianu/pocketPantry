import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openOverlay, stubPantry } from '../../test/addBatch';
import { emitBarcode, fakeCamera } from '../../test/scan';

// The add-Batch camera's v3 chrome, opened from the Pantry's add-Batch form. Prefill itself is
// covered in AddBatchPrefill and AddBatchBarcode; here the camera closes on a result.
vi.mock('../../lib/camera', async () =>
  (await import('../../test/scan')).fakeCameraModule(),
);
vi.mock('../../lib/image', () => ({
  resizeImage: () => Promise.resolve('data:image/jpeg;base64,AAAA'),
}));

const bar = () => within(screen.getByTestId('scan-top-bar'));
const overlay = () => screen.queryByTestId('camera-overlay');

describe('The add-Batch camera chrome', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('has the glass top bar, the two-word slider and no stack, in Product', async () => {
    stubPantry();
    await openOverlay('product');
    expect(bar().getByRole('button', { name: 'Close scanner' })).toBeVisible();
    expect(bar().getByRole('button', { name: /^Torch/ })).toBeVisible();
    expect(bar().getByRole('button', { name: 'Reading as' })).toBeVisible();
    expect(
      bar().getByRole('button', { name: 'How scanning works' }),
    ).toBeVisible();
    expect(
      screen.getAllByRole('radio').map((radio) => radio.textContent),
    ).toEqual(['Product', 'Barcode']);
    expect(screen.queryByTestId('photo-stack')).toBeNull();
  });

  it('keeps Info and drops the language chip in Barcode', async () => {
    stubPantry();
    await openOverlay('barcode');
    expect(
      bar().getByRole('button', { name: 'How scanning works' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Reading as' }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('shutter-ring')).toBeInTheDocument();
  });

  it('opens an Info sheet about Product and Barcode only, and Escape closes it, not the camera', async () => {
    stubPantry();
    const user = await openOverlay('product');
    await user.click(bar().getByRole('button', { name: 'How scanning works' }));
    const sheet = screen.getByRole('dialog', { name: 'Scanning your pantry' });
    expect(within(sheet).getByText('Product')).toBeInTheDocument();
    expect(within(sheet).getByText('Barcode')).toBeInTheDocument();
    expect(within(sheet).queryByText('Receipt')).toBeNull();
    expect(within(sheet).queryByText('Plate')).toBeNull();
    expect(sheet).not.toHaveTextContent(/stack/);
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('dialog', { name: 'Scanning your pantry' }),
    ).toBeNull();
    expect(overlay()).toBeInTheDocument();
  });

  it('closes on a Product Scan', async () => {
    stubPantry();
    await openOverlay('product');
    fireEvent.click(screen.getByRole('button', { name: 'Take photo' }));
    await waitFor(() => expect(overlay()).toBeNull());
  });

  it('closes on a decoded barcode', async () => {
    stubPantry();
    await openOverlay('barcode');
    await waitFor(() => expect(fakeCamera.emit).not.toBeNull());
    act(() => emitBarcode('3017620422003'));
    await waitFor(() => expect(overlay()).toBeNull());
  });
});

describe('The add-Batch camera zoom pill', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('is hidden when the camera cannot zoom', async () => {
    stubPantry();
    await openOverlay('product');
    expect(screen.queryByRole('group', { name: 'Zoom' })).toBeNull();
  });

  it('switches between 1× and 2 with aria-pressed when it can', async () => {
    fakeCamera.zoomSupported = true;
    stubPantry();
    const user = await openOverlay('product');
    const pill = within(screen.getByRole('group', { name: 'Zoom' }));
    const one = pill.getByRole('button', { name: 'Zoom 1×' });
    const two = pill.getByRole('button', { name: 'Zoom 2×' });
    expect(one).toHaveAttribute('aria-pressed', 'true');
    expect(two).toHaveAttribute('aria-pressed', 'false');
    await user.click(two);
    expect(fakeCamera.zooms).toEqual([2]);
    expect(two).toHaveAttribute('aria-pressed', 'true');
    expect(one).toHaveAttribute('aria-pressed', 'false');
    await user.click(one);
    expect(fakeCamera.zooms).toEqual([2, 1]);
    expect(one).toHaveAttribute('aria-pressed', 'true');
  });
});
