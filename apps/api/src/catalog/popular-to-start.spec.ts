import { CATALOG_LOCALES } from './catalog.schemas';
import { popularToStartIds } from './popular-to-start';
import { SEED_INGREDIENTS } from './seed/catalog-seed-data';
import { seedId } from './seed/seed-ids';

describe('Popular to start', () => {
  const catalogIds = new Set(
    SEED_INGREDIENTS.map((i) => seedId.ingredient(i.slug)),
  );

  it.each(CATALOG_LOCALES)(
    'has up to 8 distinct Catalog Ingredients for %s',
    (locale) => {
      const ids = popularToStartIds(locale);
      expect(ids.length).toBeGreaterThan(0);
      expect(ids.length).toBeLessThanOrEqual(8);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(catalogIds.has(id)).toBe(true);
    },
  );
});
