import { describe, expect, it } from 'vitest';
import { SCAN_MODES } from './scan';
import { GUIDE_CENTER_Y, SCAN_GUIDES, guideRect } from './scanGuides';

describe('SCAN_GUIDES', () => {
  it('sizes each Scan Mode guide as a fraction of the screen (Decisions table)', () => {
    expect(SCAN_GUIDES).toEqual({
      receipt: { width: 0.52, height: 0.64 },
      product: { width: 0.6, height: 0.48 },
      ingredients: { width: 0.88, height: 0.42 },
      plate: { width: 0.8, height: 0.5 },
    });
    expect(Object.keys(SCAN_GUIDES).sort()).toEqual([...SCAN_MODES].sort());
  });

  it('centres the guides at 46% of the screen height', () => {
    expect(GUIDE_CENTER_Y).toBe(0.46);
  });
});

describe('guideRect', () => {
  const phone = { width: 390, height: 844 };

  it.each(SCAN_MODES)(
    'places the %s guide centred horizontally at 46% of the height',
    (mode) => {
      const { x, y, width, height } = guideRect(mode, phone);
      expect(width).toBeCloseTo(phone.width * SCAN_GUIDES[mode].width);
      expect(height).toBeCloseTo(phone.height * SCAN_GUIDES[mode].height);
      expect(x + width / 2).toBeCloseTo(phone.width / 2);
      expect(y + height / 2).toBeCloseTo(phone.height * 0.46);
    },
  );
});
