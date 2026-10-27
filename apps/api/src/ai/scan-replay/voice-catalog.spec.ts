import { SEED_INGREDIENTS } from '../../catalog/seed/catalog-seed-data';
import { seedId } from '../../catalog/seed/seed-ids';
import {
  catalogIn,
  catalogTextFor,
  exactIngredient,
  seedVoiceCatalog,
} from './voice-catalog';

const catalog = seedVoiceCatalog();

describe('seedVoiceCatalog', () => {
  it('holds every seeded Ingredient under its seed id', () => {
    expect(catalog.ingredients).toHaveLength(SEED_INGREDIENTS.length);
    const milk = catalog.ingredients.find((i) => i.names.en === 'Milk');
    expect(milk).toMatchObject({
      id: seedId.ingredient('milk'),
      names: { ro: 'Lapte', da: 'Mælk' },
    });
  });

  it('orders Ingredients by Leaf Category, then English name, whatever the locale', () => {
    const en = catalogIn(catalog, 'en').ingredients;
    const ro = catalogIn(catalog, 'ro').ingredients;
    expect(ro.map((i) => i.id)).toEqual(en.map((i) => i.id));
    const keys = en.map((i) => [i.category, i.name]);
    expect(keys).toEqual(
      [...keys].sort(
        (a, b) =>
          new Intl.Collator('en').compare(a[0], b[0]) ||
          new Intl.Collator('en').compare(a[1], b[1]),
      ),
    );
  });

  it('sends the production Catalog text, with names in the locale and indices for ids', () => {
    const text = JSON.parse(catalogTextFor(catalog, 'da')) as {
      categories: string[];
      ingredients: [number, string, string][];
    };
    expect(text.ingredients).toHaveLength(SEED_INGREDIENTS.length);
    const milk = catalog.ingredients.findIndex(
      (i) => i.id === seedId.ingredient('milk'),
    );
    expect(text.ingredients[milk]).toEqual([milk, 'Mælk', expect.any(String)]);
    expect(text.categories).toContain('Onions and garlic');
  });
});

describe('exactIngredient', () => {
  const nameOf = (names: string[]) => exactIngredient(catalog, names)?.names.en;

  it('finds a name or Synonym in any locale, ignoring case and diacritics', () => {
    expect(nameOf(['LAPTE'])).toBe('Milk');
    expect(nameOf(['sødmælk'])).toBe('Milk');
    expect(nameOf(['pepper'])).toBe('Black pepper');
  });

  it('tries the next name when one is unknown, and gives up on none', () => {
    expect(nameOf(['no such thing', 'spaghete'])).toBe('Spaghetti');
    expect(nameOf(['no such thing'])).toBeUndefined();
  });
});
