import { normalizeName } from '../normalize';
import {
  SEED_AISLES,
  SEED_INGREDIENTS,
  SEED_LEAVES,
  SEED_PARENTS,
} from './catalog-seed-data';
import {
  DA_AISLES,
  DA_INGREDIENTS,
  DA_LEAVES,
  DA_PARENTS,
  DA_SYNONYMS,
} from './data/danish';
import { seedId, stableId } from './seed-catalog';
import { SEED_ALLERGENS } from './allergens';
import { SEED_INGREDIENT_ALLERGENS } from './data/ingredient-allergens';
import { findSeedProblems } from './validate-seed';

const duplicates = (values: string[]) =>
  values.filter((value, index) => values.indexOf(value) !== index);

describe('catalog seed data', () => {
  it('has retzetar’s 18 Parent Categories', () => {
    expect(SEED_PARENTS).toHaveLength(18);
  });

  it('has exactly one is_other Leaf under every Parent', () => {
    for (const parent of SEED_PARENTS) {
      expect(
        SEED_LEAVES.filter(
          (leaf) => leaf.parent === parent.slug && leaf.isOther,
        ),
      ).toHaveLength(1);
    }
  });

  it('puts every Parent in a known Aisle with a unique sort order', () => {
    const slugs = new Set(SEED_AISLES.map((a) => a.slug));
    expect(SEED_PARENTS.filter((p) => !slugs.has(p.aisle))).toEqual([]);
    expect(duplicates(SEED_AISLES.map((a) => String(a.sortOrder)))).toEqual([]);
    expect(SEED_AISLES.length).toBeLessThan(SEED_PARENTS.length);
  });

  it('hangs every Leaf off a Parent and every Ingredient off a Leaf', () => {
    const parents = new Set(SEED_PARENTS.map((p) => p.slug));
    const leaves = new Set(SEED_LEAVES.map((l) => l.slug));
    expect(SEED_LEAVES.filter((l) => !parents.has(l.parent))).toEqual([]);
    expect(SEED_INGREDIENTS.filter((i) => !leaves.has(i.leaf))).toEqual([]);
  });

  it('is free of duplicate names, ambiguous Synonyms, and dangling references', () => {
    expect(
      findSeedProblems({
        allergens: SEED_ALLERGENS,
        aisles: SEED_AISLES,
        parents: SEED_PARENTS,
        leaves: SEED_LEAVES,
        ingredients: SEED_INGREDIENTS,
      }),
    ).toEqual([]);
  });

  it('has hundreds of Ingredients with English, Romanian and Danish names', () => {
    expect(SEED_INGREDIENTS.length).toBeGreaterThanOrEqual(400);
    for (const item of SEED_INGREDIENTS) {
      expect(item.en).toBeTruthy();
      expect(item.ro).toBeTruthy();
      expect(item.da).toBeTruthy();
    }
  });

  it('gives every Aisle, Parent and Leaf a Danish name, with the Other Leaves named after their Parent', () => {
    for (const row of [...SEED_AISLES, ...SEED_PARENTS, ...SEED_LEAVES]) {
      expect([row.slug, row.da.trim() !== '']).toEqual([row.slug, true]);
    }
    expect(SEED_LEAVES.find((l) => l.slug === 'dairy-other')?.da).toBe(
      'Andet (mejeri)',
    );
    expect(SEED_LEAVES.find((l) => l.slug === 'other-other')?.da).toBe('Andet');
  });

  it('has no Danish entry for a slug that does not exist', () => {
    const known = (rows: { slug: string }[]) =>
      new Set(rows.map((r) => r.slug));
    const stray = (
      entries: Record<string, unknown>,
      rows: { slug: string }[],
    ) => Object.keys(entries).filter((slug) => !known(rows).has(slug));
    expect(stray(DA_AISLES, SEED_AISLES)).toEqual([]);
    expect(stray(DA_PARENTS, SEED_PARENTS)).toEqual([]);
    expect(stray(DA_LEAVES, SEED_LEAVES)).toEqual([]);
    expect(stray(DA_INGREDIENTS, SEED_INGREDIENTS)).toEqual([]);
    expect(stray(DA_SYNONYMS, SEED_INGREDIENTS)).toEqual([]);
  });

  it('carries a few Danish Synonyms next to the Danish names', () => {
    const milk = SEED_INGREDIENTS.find((i) => i.slug === 'milk');
    expect(milk?.da).toBe('Mælk');
    expect(milk?.synonyms?.da).toContain('minimælk');
    expect(milk?.synonyms?.en).toBeDefined();
  });

  it('has no slug or normalised-name collisions within an entity type', () => {
    for (const rows of [
      SEED_AISLES,
      SEED_PARENTS,
      SEED_LEAVES,
      SEED_INGREDIENTS,
    ]) {
      expect(duplicates(rows.map((r) => r.slug))).toEqual([]);
      expect(duplicates(rows.map((r) => normalizeName(r.en)))).toEqual([]);
      expect(duplicates(rows.map((r) => normalizeName(r.ro)))).toEqual([]);
      expect(duplicates(rows.map((r) => normalizeName(r.da)))).toEqual([]);
    }
  });

  const leafOf = (slug: string) =>
    SEED_INGREDIENTS.find((i) => i.slug === slug)?.leaf;

  it('keeps Parmesan and Cheddar, and chicken breast and chicken thighs, in different Leaf Categories', () => {
    expect(leafOf('parmesan')).toBeDefined();
    expect(leafOf('parmesan')).not.toBe(leafOf('cheddar'));
    expect(leafOf('chicken-breast')).toBeDefined();
    expect(leafOf('chicken-breast')).not.toBe(leafOf('chicken-thighs'));
  });

  it('gives every Parent except "Other" several real Leaf Categories, each holding Ingredients', () => {
    const used = new Set(SEED_INGREDIENTS.map((i) => i.leaf));
    for (const parent of SEED_PARENTS.filter((p) => p.slug !== 'other')) {
      const real = SEED_LEAVES.filter(
        (l) => l.parent === parent.slug && !l.slug.endsWith('-other'),
      );
      expect(real.length).toBeGreaterThanOrEqual(2);
      expect(real.filter((l) => !used.has(l.slug)).map((l) => l.slug)).toEqual(
        [],
      );
    }
  });

  it('gives every Ingredient a Default Expiry and Location through its Leaf or Parent', () => {
    const parents = new Map(SEED_PARENTS.map((p) => [p.slug, p]));
    const leaves = new Map(SEED_LEAVES.map((l) => [l.slug, l]));
    for (const item of SEED_INGREDIENTS) {
      const l = leaves.get(item.leaf)!;
      const p = parents.get(l.parent)!;
      const days = l.defaultExpiryDays ?? p.defaultExpiryDays;
      const location = l.defaultLocation ?? p.defaultLocation;
      expect([item.slug, days !== null, location !== null]).toEqual([
        item.slug,
        true,
        true,
      ]);
    }
  });

  it('sets Default Expiry explicitly on every real Leaf Category, and never a non-positive one', () => {
    for (const l of SEED_LEAVES.filter((x) => !x.slug.endsWith('-other'))) {
      expect(l.defaultExpiryDays).toBeGreaterThan(0);
      expect(l.defaultLocation).toBeDefined();
    }
  });

  it('gives most Ingredients a Romanian Synonym', () => {
    const withRo = SEED_INGREDIENTS.filter((i) => i.synonyms?.ro?.length);
    expect(withRo.length / SEED_INGREDIENTS.length).toBeGreaterThan(0.8);
  });

  it('lists the data sections in the same order as the Parent Categories', () => {
    const order = [...new Set(SEED_LEAVES.map((l) => l.parent))];
    expect(order).toEqual(
      SEED_PARENTS.map((p) => p.slug)
        .filter((s) => s !== 'other')
        .concat('other'),
    );
  });

  it('derives stable, valid UUIDs', () => {
    expect(seedId.ingredient('parmesan')).toBe(seedId.ingredient('parmesan'));
    expect(seedId.ingredient('parmesan')).not.toBe(seedId.leaf('parmesan'));
    expect(stableId('x')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  describe('Allergens', () => {
    it('is the EU 14, translated in en, ro and da', () => {
      expect(SEED_ALLERGENS.map((a) => a.slug)).toEqual([
        'gluten',
        'crustaceans',
        'eggs',
        'fish',
        'peanuts',
        'soy',
        'milk',
        'tree-nuts',
        'celery',
        'mustard',
        'sesame',
        'sulphites',
        'lupin',
        'molluscs',
      ]);
      for (const a of SEED_ALLERGENS) {
        expect([
          a.slug,
          [a.en, a.ro, a.da].every((n) => n.trim() !== ''),
        ]).toEqual([a.slug, true]);
      }
      expect(
        duplicates(SEED_ALLERGENS.map((a) => normalizeName(a.da))),
      ).toEqual([]);
    });

    it('tags only Ingredients that exist', () => {
      const known = new Set(SEED_INGREDIENTS.map((i) => i.slug));
      expect(
        Object.keys(SEED_INGREDIENT_ALLERGENS).filter((s) => !known.has(s)),
      ).toEqual([]);
    });

    it('declares Allergens for every shared Ingredient', () => {
      expect(
        SEED_INGREDIENTS.filter((i) => i.allergens === undefined).map(
          (i) => i.slug,
        ),
      ).toEqual([]);
      expect(
        SEED_INGREDIENTS.filter((i) => (i.allergens ?? []).length > 0).length,
      ).toBeGreaterThan(100);
    });

    it('tags composite and prepared Ingredients by what they are made of', () => {
      const tags = (slug: string) =>
        SEED_INGREDIENTS.find((i) => i.slug === slug)?.allergens;
      expect(tags('parmesan')).toEqual(['milk']);
      expect(tags('flour')).toEqual(['gluten']);
      expect(tags('peanuts')).toEqual(['peanuts']);
      expect(tags('bread')).toEqual(['gluten']);
      expect(tags('pesto')).toEqual(['milk', 'tree-nuts']);
      expect(tags('soy-sauce')).toEqual(['gluten', 'soy']);
      expect(tags('mayonnaise')).toEqual(['eggs', 'mustard']);
      expect(tags('worcestershire-sauce')).toEqual(['fish']);
      expect(tags('tahini')).toEqual(['sesame']);
      expect(tags('spaghetti')).toEqual(['gluten']);
      expect(tags('egg-noodles')).toEqual(['eggs', 'gluten']);
      expect(tags('apple')).toEqual([]);
      expect(tags('olive-oil')).toEqual([]);
    });
  });
});
