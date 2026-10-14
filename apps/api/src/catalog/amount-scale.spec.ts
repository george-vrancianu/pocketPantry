import {
  AMOUNT_SCALES,
  amountScaleForParent,
  readAmountScale,
} from './amount-scale';

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
      expect(amountScaleForParent(slug)).toBe(scale);
    });

    it.each(['other', 'herbs', 'seafood', 'frozen', 'canned-goods', 'unknown'])(
      'gives the unmapped %s Parent Category medium',
      (slug) => {
        expect(amountScaleForParent(slug)).toBe('medium');
      },
    );

    it('only ever returns a scale from the three names', () => {
      for (const slug of ['spices', 'produce', 'other', 'herbs']) {
        expect(AMOUNT_SCALES).toContain(amountScaleForParent(slug));
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
