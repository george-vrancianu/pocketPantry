import { describe, expect, it } from 'vitest';
import { CAMERA_MODES } from './cameraMode';
import {
  FOOTER_HEIGHT,
  FOOTER_MIN_BOTTOM,
  GUIDE_LIFT,
  MODE_SLIDER_HEIGHT,
  SCAN_GUIDES,
  SHUTTER_ROW_HEIGHT,
  TOP_BAR_HEIGHT,
  clearArea,
  guideRect,
} from './scanGuides';

describe('bar heights', () => {
  it('follow the handoff: a 52 pt top bar, a 104 + 40 pt footer and at least 20 pt under it', () => {
    expect(TOP_BAR_HEIGHT).toBe(52);
    expect(SHUTTER_ROW_HEIGHT).toBe(104);
    expect(MODE_SLIDER_HEIGHT).toBe(40);
    expect(FOOTER_HEIGHT).toBe(144);
    expect(FOOTER_MIN_BOTTOM).toBe(20);
    expect(GUIDE_LIFT).toBe(14);
  });
});

describe('SCAN_GUIDES', () => {
  it('sizes each camera mode as a fraction of screen width x clear-area height', () => {
    expect(SCAN_GUIDES).toEqual({
      receipt: { width: 0.56, height: 0.78 },
      product: { width: 0.62, height: 0.56 },
      ingredients: { width: 0.88, height: 0.5 },
      plate: { width: 0.8, height: 0.6 },
      barcode: { width: 0.8, height: 0.3 },
    });
    expect(Object.keys(SCAN_GUIDES).sort()).toEqual([...CAMERA_MODES].sort());
  });
});

describe('clearArea', () => {
  it('runs from under the top bar to above the footer, safe areas included', () => {
    // 390 x 844 phone: 47 pt status bar, 34 pt home indicator.
    const clear = clearArea({
      width: 390,
      height: 844,
      insets: { top: 47, bottom: 34 },
    });
    expect(clear.top).toBe(47 + 52);
    expect(clear.top + clear.height).toBe(844 - (34 + 144));
  });

  it('treats missing insets as zero, keeping the least room under the footer', () => {
    expect(clearArea({ width: 390, height: 844 })).toEqual({
      top: 52,
      height: 844 - (20 + 144) - 52,
    });
  });

  it('keeps the least room under the footer when the bottom inset is smaller', () => {
    const clear = clearArea({
      width: 390,
      height: 844,
      insets: { top: 0, bottom: 8 },
    });
    expect(clear.top + clear.height).toBe(844 - (20 + 144));
  });
});

describe('guideRect', () => {
  const phone = { width: 390, height: 844, insets: { top: 47, bottom: 34 } };
  const clear = clearArea(phone);

  it.each(CAMERA_MODES)(
    'sizes and centres the %s guide in the clear area, 14 pt above its middle',
    (mode) => {
      const { x, y, width, height } = guideRect(mode, phone);
      expect(width).toBeCloseTo(phone.width * SCAN_GUIDES[mode].width);
      expect(height).toBeCloseTo(clear.height * SCAN_GUIDES[mode].height);
      expect(x + width / 2).toBeCloseTo(phone.width / 2);
      expect(y + height / 2).toBeCloseTo(clear.top + clear.height / 2 - 14);
    },
  );

  it('gives the Receipt guide on a 390 x 844 phone its handoff numbers', () => {
    const rect = guideRect('receipt', phone);
    expect(rect.width).toBeCloseTo(218.4);
    expect(rect.height).toBeCloseTo(0.78 * clear.height);
    expect(rect.x).toBeCloseTo((390 - 218.4) / 2);
  });

  it('stays inside the clear area for every mode', () => {
    for (const mode of CAMERA_MODES) {
      const { y, height } = guideRect(mode, phone);
      expect(y).toBeGreaterThanOrEqual(clear.top);
      expect(y + height).toBeLessThanOrEqual(clear.top + clear.height);
    }
  });

  it('moves down with the top safe area and up with the bottom one', () => {
    const plain = guideRect('product', { width: 390, height: 844 });
    const notched = guideRect('product', {
      width: 390,
      height: 844,
      insets: { top: 47, bottom: 34 },
    });
    // Centre shifts by half the difference of the insets, the bottom one floored at 20: (47 - (34 - 20)) / 2.
    expect(notched.y + notched.height / 2).toBeCloseTo(
      plain.y + plain.height / 2 + (47 - (34 - 20)) / 2,
      0,
    );
  });
});
