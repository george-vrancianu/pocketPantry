import { resolveCatalogDefaults } from './catalog-defaults';

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
