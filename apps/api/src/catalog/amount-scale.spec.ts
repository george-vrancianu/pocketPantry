import {
  AMOUNT_SCALES,
  amountScaleForParent,
  readAmountScale,
} from './amount-scale';
import { seedId } from './seed/seed-ids';

describe('Amount Scale', () => {
  describe('amountScaleForParent', () => {
    it.each([
      ['spices', 'low'],
      ['bakery', 'medium'],
      ['dairy', 'medium'],
      ['eggs', 'medium'],
      ['grains', 'medium'],
      ['meat', 'medium'],
      ['pasta', 'medium'],
      ['oils', 'large'],
      ['produce', 'large'],
    ])('maps the %s Parent Category to %s', (slug, scale) => {
      expect(amountScaleForParent(seedId.parent(slug))).toBe(scale);
    });

    it.each(['other', 'herbs', 'seafood', 'frozen', 'canned-goods', 'unknown'])(
      'gives the unmapped %s Parent Category medium',
      (slug) => {
        expect(amountScaleForParent(seedId.parent(slug))).toBe('medium');
      },
    );

    it('gives the top-level Other Parent medium', () => {
      expect(amountScaleForParent(seedId.parent('other'))).toBe('medium');
    });

    it('only ever returns a scale from the three names', () => {
      for (const slug of ['spices', 'produce', 'other', 'herbs']) {
        expect(AMOUNT_SCALES).toContain(
          amountScaleForParent(seedId.parent(slug)),
        );
      }
    });
  });

  describe('readAmountScale', () => {
    it('reads a stored scale back unchanged', () => {
      expect(readAmountScale('low')).toBe('low');
      expect(readAmountScale('large')).toBe('large');
    });

    it('reads a missing scale back as medium', () => {
      expect(readAmountScale(null)).toBe('medium');
    });
  });
});
