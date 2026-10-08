import type {
  SeedAisle,
  SeedIngredient,
  SeedLeaf,
  SeedParent,
} from './seed-types';
import { assertCatalogSeedValid, findSeedProblems } from './validate-seed';

const aisles: SeedAisle[] = [
  { slug: 'a', en: 'Aisle', ro: 'Culoar', da: 'Gang', sortOrder: 1 },
];
const parents: SeedParent[] = [
  {
    slug: 'p',
    en: 'Parent',
    ro: 'Părinte',
    da: 'Forælder',
    aisle: 'a',
    defaultExpiryDays: 7,
    defaultLocation: 'fridge',
  },
];
const leaves: SeedLeaf[] = [
  {
    slug: 'l',
    parent: 'p',
    en: 'Leaf',
    ro: 'Frunză',
    da: 'Blad',
    isOther: true,
  },
];
const ingredient = (
  slug: string,
  en: string,
  ro: string,
  synonyms?: SeedIngredient['synonyms'],
  da = `da-${slug}`,
): SeedIngredient => ({ slug, leaf: 'l', en, ro, da, unit: 'g', synonyms });

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

  it('flags a Parent without exactly one is_other Leaf', () => {
    const find = (extra: SeedLeaf[]) =>
      findSeedProblems({
        aisles,
        parents,
        leaves: extra,
        ingredients: [],
      });
    expect(
      find([{ slug: 'l', parent: 'p', en: 'Leaf', ro: 'Frunză', da: 'Blad' }]),
    ).toEqual([expect.stringContaining('found 0')]);
    expect(
      find([
        {
          slug: 'l',
          parent: 'p',
          en: 'Leaf',
          ro: 'Frunză',
          da: 'Blad',
          isOther: true,
        },
        {
          slug: 'm',
          parent: 'p',
          en: 'Mother',
          ro: 'Mamă',
          da: 'Moder',
          isOther: true,
        },
      ]),
    ).toEqual([expect.stringContaining('found 2')]);
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

  it('flags two Ingredients whose Danish names normalise the same', () => {
    expect(
      problems([
        ingredient('a', 'One', 'Unu', undefined, 'Æg'),
        ingredient('b', 'Two', 'Doi', undefined, 'æg!'),
      ]),
    ).toEqual([expect.stringMatching(/"æg".*\ba\b.*\bb\b/)]);
    expect(
      findSeedProblems({
        aisles,
        parents,
        leaves: [
          {
            slug: 'l',
            parent: 'p',
            en: 'Leaf',
            ro: 'Frunză',
            da: 'Blad',
            isOther: true,
          },
          { slug: 'm', parent: 'p', en: 'Mat', ro: 'Mată', da: 'blad' },
        ],
        ingredients: [],
      }),
    ).toEqual([expect.stringContaining('share the da name "blad"')]);
  });

  it('flags any entity without a Danish name', () => {
    expect(
      findSeedProblems({
        aisles: [{ ...aisles[0], da: '' }],
        parents: [{ ...parents[0], da: ' ' }],
        leaves: [{ ...leaves[0], da: '' }],
        ingredients: [ingredient('a', 'Apple', 'Măr', undefined, '')],
      }),
    ).toEqual([
      expect.stringContaining('aisle "a": missing Danish name'),
      expect.stringContaining('parent "p": missing Danish name'),
      expect.stringContaining('leaf "l": missing Danish name'),
      expect.stringContaining('ingredient "a": missing Danish name'),
    ]);
  });

  it('flags a Danish Synonym that is another Ingredient’s name, or repeats its own', () => {
    expect(
      problems([
        ingredient('a', 'Apple', 'Măr', undefined, 'Æble'),
        ingredient('b', 'Pear', 'Pară', { da: ['æble'] }),
      ]),
    ).toEqual([expect.stringMatching(/"æble".*\ba\b.*\bb\b/)]);
    expect(
      problems([ingredient('a', 'Apple', 'Măr', { da: ['ÆBLE'] }, 'Æble')]),
    ).toEqual([expect.stringContaining('"ÆBLE" repeats its own name')]);
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
        leaves: [
          {
            slug: 'l',
            parent: 'missing',
            en: 'Leaf',
            ro: 'Frunză',
            da: 'Blad',
          },
        ],
        ingredients: [{ ...ingredient('a', 'Apple', 'Măr'), leaf: 'nope' }],
      }),
    ).toEqual([
      expect.stringContaining('unknown Parent "missing"'),
      expect.stringContaining('found 0'),
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
