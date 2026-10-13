import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SEED_INGREDIENTS } from './catalog-seed-data';
import { seedId } from './seed-catalog';

// The mapping and icon set live in packages/ui, which is an ES module package
// the API can't import (and its tsconfig roots at apps/api), so read them as files.
// The icon keys are scraped from the source with a regex, so this relies on
// ingredientIcons.ts keeping its two-space-indented `key: {` entries.
const ICONS_DIR = join(
  __dirname,
  '../../../../../packages/ui/src/ingredientIcon',
);

const mapping: Record<string, string> = JSON.parse(
  readFileSync(join(ICONS_DIR, 'ingredientIconMap.json'), 'utf8'),
) as Record<string, string>;

/** Icon keys are the top-level keys of the INGREDIENT_ICONS object literal. */
const iconKeys = new Set(
  [
    ...readFileSync(join(ICONS_DIR, 'ingredientIcons.ts'), 'utf8').matchAll(
      /^ {2}(\w+): \{/gm,
    ),
  ].map((match) => match[1]),
);

describe('Ingredient icon mapping', () => {
  const seededIds = new Set(
    SEED_INGREDIENTS.map((ingredient) => seedId.ingredient(ingredient.slug)),
  );

  it('reads the icon set and the mapping', () => {
    expect(iconKeys.size).toBe(42);
    expect(iconKeys.has('tomato')).toBe(true);
    expect(Object.keys(mapping).length).toBeGreaterThan(0);
  });

  it('only names seeded Ingredients', () => {
    expect(Object.keys(mapping).filter((id) => !seededIds.has(id))).toEqual([]);
  });

  it('only uses icon keys that exist in the icon set', () => {
    expect(Object.values(mapping).filter((key) => !iconKeys.has(key))).toEqual(
      [],
    );
  });
});
