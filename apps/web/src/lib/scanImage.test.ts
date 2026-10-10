import { describe, expect, it } from 'vitest';
import { IMAGE_PREPARATION } from './scanImage';

describe('scan image preparation', () => {
  it('rejects a gallery receipt by design: it is cropped in Review first', async () => {
    await expect(
      IMAGE_PREPARATION.receipt(new Blob(['x']), 'gallery'),
    ).rejects.toThrow('crop step');
  });
});
