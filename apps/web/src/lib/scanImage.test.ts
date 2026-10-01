import { describe, expect, it } from 'vitest';
import { IMAGE_PREPARATION, needsCropStep } from './scanImage';

describe('scan image preparation', () => {
  it('rejects a gallery receipt by design: callers must go through needsCropStep', async () => {
    expect(needsCropStep('receipt', 'gallery')).toBe(true);
    await expect(
      IMAGE_PREPARATION.receipt(new Blob(['x']), 'gallery'),
    ).rejects.toThrow('crop step');
  });

  it('needs the crop step only for gallery receipts', () => {
    expect(needsCropStep('receipt', 'camera')).toBe(false);
    expect(needsCropStep('product', 'gallery')).toBe(false);
    expect(needsCropStep('plate', 'gallery')).toBe(false);
    expect(needsCropStep('ingredients', 'gallery')).toBe(false);
  });
});
