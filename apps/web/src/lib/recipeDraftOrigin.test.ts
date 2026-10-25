import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { recipeDraftOriginLabel } from './recipeDraftOrigin';

const t = ((key: string) =>
  key === 'recipeDraft.originPlateScan'
    ? 'Plate scan'
    : key) as TFunction<'recipes'>;

describe('recipeDraftOriginLabel', () => {
  it("is the link's domain without www", () => {
    expect(
      recipeDraftOriginLabel({ type: 'link', domain: 'www.example.org' }, t),
    ).toBe('example.org');
    expect(
      recipeDraftOriginLabel({ type: 'link', domain: 'blog.example.org' }, t),
    ).toBe('blog.example.org');
  });
  it('is "Plate scan" for a Plate Scan', () => {
    expect(recipeDraftOriginLabel({ type: 'plate_scan' }, t)).toBe(
      'Plate scan',
    );
  });
  it('is nothing for a Recipe Draft started blank', () => {
    expect(recipeDraftOriginLabel(null, t)).toBeNull();
  });
});
