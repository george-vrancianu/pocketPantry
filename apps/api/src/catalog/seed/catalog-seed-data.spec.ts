import { normalizeName } from '../normalize';
import {
  SEED_AISLES,
  SEED_INGREDIENTS,
  SEED_LEAVES,
  SEED_PARENTS,
} from './catalog-seed-data';
import { seedId, stableId } from './seed-catalog';
import { findSeedProblems } from './validate-seed';

const duplicates = (values: string[]) =>
  values.filter((value, index) => values.indexOf(value) !== index);

describe('catalog seed data', () => {
  it('has retzetar’s 18 Parent Categories', () => {
    expect(SEED_PARENTS).toHaveLength(18);
  });

  it('has an "Other" Leaf under every Parent', () => {
    for (const parent of SEED_PARENTS) {
      expect(
        SEED_LEAVES.some(
          (leaf) => leaf.parent === parent.slug && leaf.slug.endsWith('-other'),
        ),
      ).toBe(true);
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
        aisles: SEED_AISLES,
        parents: SEED_PARENTS,
        leaves: SEED_LEAVES,
        ingredients: SEED_INGREDIENTS,
      }),
    ).toEqual([]);
  });

  it('has hundreds of Ingredients with English and Romanian names', () => {
    expect(SEED_INGREDIENTS.length).toBeGreaterThanOrEqual(400);
    for (const item of SEED_INGREDIENTS) {
      expect(item.en).toBeTruthy();
      expect(item.ro).toBeTruthy();
    }
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

  it('derives stable, valid UUIDs', () => {
    expect(seedId.ingredient('parmesan')).toBe(seedId.ingredient('parmesan'));
    expect(seedId.ingredient('parmesan')).not.toBe(seedId.leaf('parmesan'));
    expect(stableId('x')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
