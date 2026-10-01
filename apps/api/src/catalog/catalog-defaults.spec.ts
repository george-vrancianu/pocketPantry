import { resolveCatalogDefaults, resolveExpiryDays } from './catalog-defaults';

describe('resolveExpiryDays', () => {
  const leaf = { id: 'leaf', defaultExpiryDays: 30 };
  const parent = { id: 'parent', defaultExpiryDays: 10 };

  it('uses the Catalog default when the Family has no override', () => {
    expect(resolveExpiryDays(leaf, parent, [])).toBe(30);
    expect(
      resolveExpiryDays({ id: 'leaf', defaultExpiryDays: null }, parent, []),
    ).toBe(10);
  });

  it('a Leaf override beats a Parent override and both Catalog defaults', () => {
    const overrides = [
      { entityType: 'parent_category' as const, entityId: 'parent', days: 4 },
      { entityType: 'leaf_category' as const, entityId: 'leaf', days: 2 },
    ];
    expect(resolveExpiryDays(leaf, parent, overrides)).toBe(2);
  });

  it('a Parent override beats the Leaf and Parent Catalog defaults', () => {
    const overrides = [
      { entityType: 'parent_category' as const, entityId: 'parent', days: 4 },
    ];
    expect(resolveExpiryDays(leaf, parent, overrides)).toBe(4);
  });

  it('ignores overrides for other Categories', () => {
    const overrides = [
      { entityType: 'leaf_category' as const, entityId: 'elsewhere', days: 1 },
    ];
    expect(resolveExpiryDays(leaf, parent, overrides)).toBe(30);
  });
});

describe('resolveCatalogDefaults', () => {
  it('uses the Leaf Category defaults when set', () => {
    expect(
      resolveCatalogDefaults(
        { defaultExpiryDays: 30, defaultLocation: 'freezer' },
        { defaultExpiryDays: 10, defaultLocation: 'fridge' },
      ),
    ).toEqual({ expiryDays: 30, location: 'freezer' });
  });

  it('falls back to the Parent Category per field', () => {
    expect(
      resolveCatalogDefaults(
        { defaultExpiryDays: null, defaultLocation: 'freezer' },
        { defaultExpiryDays: 10, defaultLocation: 'fridge' },
      ),
    ).toEqual({ expiryDays: 10, location: 'freezer' });
    expect(
      resolveCatalogDefaults(
        { defaultExpiryDays: 5, defaultLocation: null },
        { defaultExpiryDays: 10, defaultLocation: 'fridge' },
      ),
    ).toEqual({ expiryDays: 5, location: 'fridge' });
  });

  it('returns nulls when neither level has a default', () => {
    expect(
      resolveCatalogDefaults(
        { defaultExpiryDays: null, defaultLocation: null },
        { defaultExpiryDays: null, defaultLocation: null },
      ),
    ).toEqual({ expiryDays: null, location: null });
  });
});
