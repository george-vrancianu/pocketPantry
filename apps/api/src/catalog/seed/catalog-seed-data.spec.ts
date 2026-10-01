import { normalizeName } from '../normalize';
import {
  SEED_AISLES,
  SEED_INGREDIENTS,
  SEED_LEAVES,
  SEED_PARENTS,
} from './catalog-seed-data';
import { seedId, stableId } from './seed-catalog';

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

  it('has roughly 50 Ingredients with English and Romanian names', () => {
    expect(SEED_INGREDIENTS.length).toBeGreaterThanOrEqual(50);
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

  it('derives stable, valid UUIDs', () => {
    expect(seedId.ingredient('parmesan')).toBe(seedId.ingredient('parmesan'));
    expect(seedId.ingredient('parmesan')).not.toBe(seedId.leaf('parmesan'));
    expect(stableId('x')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
