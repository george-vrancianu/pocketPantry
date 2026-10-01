import type {
  SeedAisle,
  SeedIngredient,
  SeedLeaf,
  SeedParent,
} from './seed-types';
import { assertCatalogSeedValid, findSeedProblems } from './validate-seed';

const aisles: SeedAisle[] = [
  { slug: 'a', en: 'Aisle', ro: 'Culoar', sortOrder: 1 },
];
const parents: SeedParent[] = [
  {
    slug: 'p',
    en: 'Parent',
    ro: 'Părinte',
    aisle: 'a',
    defaultExpiryDays: 7,
    defaultLocation: 'fridge',
  },
];
const leaves: SeedLeaf[] = [
  { slug: 'l', parent: 'p', en: 'Leaf', ro: 'Frunză' },
];
const ingredient = (
  slug: string,
  en: string,
  ro: string,
  synonyms?: SeedIngredient['synonyms'],
): SeedIngredient => ({ slug, leaf: 'l', en, ro, unit: 'g', synonyms });

const problems = (ingredients: SeedIngredient[]) =>
  findSeedProblems({ aisles, parents, leaves, ingredients });

describe('Catalog seed validation', () => {
  it('accepts a consistent seed', () => {
    expect(
      problems([
        ingredient('a', 'Apple', 'Măr'),
        ingredient('b', 'Pear', 'Pară'),
      ]),
    ).toEqual([]);
  });

  it('flags two Ingredients whose English names normalise the same', () => {
    expect(
      problems([
        ingredient('a', 'Brânză', 'Unu'),
        ingredient('b', 'branza!', 'Doi'),
      ]),
    ).toEqual([expect.stringContaining('"branza"')]);
  });

  it('flags two Ingredients whose Romanian names normalise the same', () => {
    expect(
      problems([ingredient('a', 'One', 'Ouă'), ingredient('b', 'Two', 'oua')]),
    ).toEqual([expect.stringContaining('"oua"')]);
  });

  it('flags a Synonym that is also another Ingredient’s name, in any locale', () => {
    expect(
      problems([
        ingredient('a', 'Apple', 'Măr'),
        ingredient('b', 'Pear', 'Pară', { en: ['apple'] }),
      ]),
    ).toEqual([expect.stringMatching(/"apple".*\ba\b.*\bb\b/)]);
    expect(
      problems([
        ingredient('a', 'Apple', 'Măr'),
        ingredient('b', 'Pear', 'Pară', { ro: ['mar'] }),
      ]),
    ).toHaveLength(1);
  });

  it('flags duplicate slugs and dangling references', () => {
    expect(
      problems([
        ingredient('a', 'Apple', 'Măr'),
        ingredient('a', 'Pear', 'Pară'),
      ]),
    ).toEqual([expect.stringContaining('duplicate slug "a"')]);
    expect(
      findSeedProblems({
        aisles,
        parents,
        leaves: [{ slug: 'l', parent: 'missing', en: 'Leaf', ro: 'Frunză' }],
        ingredients: [{ ...ingredient('a', 'Apple', 'Măr'), leaf: 'nope' }],
      }),
    ).toEqual([
      expect.stringContaining('unknown Parent "missing"'),
      expect.stringContaining('unknown Leaf "nope"'),
    ]);
  });

  it('flags a Synonym that repeats the Ingredient’s own name or is listed twice', () => {
    expect(
      problems([
        ingredient('a', 'Apple', 'Măr', { en: ['APPLE'], ro: ['mar'] }),
      ]),
    ).toEqual([
      expect.stringContaining('"APPLE" repeats its own name'),
      expect.stringContaining('"mar" repeats its own name'),
    ]);
    expect(
      problems([
        ingredient('a', 'Apple', 'Măr', { en: ['pomme'], ro: ['Pomme!'] }),
      ]),
    ).toEqual([expect.stringContaining('"Pomme!" is listed twice')]);
  });

  it('throws one error listing every problem', () => {
    expect(() =>
      assertCatalogSeedValid({
        aisles,
        parents,
        leaves,
        ingredients: [
          ingredient('a', 'Apple', 'Măr'),
          ingredient('b', 'apple', 'Pară'),
        ],
      }),
    ).toThrow(/Catalog seed is invalid[\s\S]*"apple"/);
  });
});
