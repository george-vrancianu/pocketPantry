import type { CatalogSearchService } from '../catalog/catalog-search.service';
import type { CatalogScope } from '../catalog/catalog-scope';
import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import {
  catalogPrompt,
  CatalogMatchService,
  confidentMatch,
  validateCatalogMatch,
} from './catalog-matching';

const ingredient = (id: string, name: string) =>
  ({ id, name }) as CatalogSearchResult;
const milk = ingredient('milk-id', 'Milk');
const lapte = ingredient('lapte-id', 'Lapte');
const scope = {} as CatalogScope;

function service(exact: Record<string, CatalogSearchResult> = {}) {
  const findByIds = jest.fn((_s, ids: string[]) =>
    Promise.resolve([milk].filter((m) => ids.includes(m.id))),
  );
  const findExact = jest.fn((_s, names: string[]) =>
    Promise.resolve(
      new Map(names.flatMap((n) => (exact[n] ? [[n, exact[n]] as const] : []))),
    ),
  );
  return {
    findExact,
    matcher: new CatalogMatchService({
      findByIds,
      findExact,
    } as unknown as CatalogSearchService),
  };
}

describe('CatalogMatchService.resolve', () => {
  it('uses the proposed Ingredient when it is in the Catalog', async () => {
    const { matcher } = service();
    const [result] = await matcher.resolve(
      [{ names: ['whole milk'], proposedIngredientId: 'milk-id' }],
      scope,
      'en',
    );
    expect(result).toEqual({ match: milk, exact: false });
  });

  it('finds an exact name or Synonym hit when nothing was proposed, trying names in order', async () => {
    const { matcher } = service({ 'lapte 1l': lapte });
    const [result] = await matcher.resolve(
      [{ names: [null, 'nope', 'lapte 1l'], proposedIngredientId: null }],
      scope,
      'ro',
    );
    expect(result).toEqual({ match: lapte, exact: true });
  });

  it('leaves an item Unmatched when the proposed id is unknown, without looking up names', async () => {
    const { matcher, findExact } = service({ x: lapte });
    const [result] = await matcher.resolve(
      [{ names: ['x'], proposedIngredientId: 'invented' }],
      scope,
      'en',
    );
    expect(result).toBeNull();
    expect(findExact).toHaveBeenCalledWith(scope, [], 'en', []);
  });

  it('returns one result per item in order', async () => {
    const { matcher } = service({ lapte: lapte });
    const results = await matcher.resolve(
      [
        { names: ['lapte'], proposedIngredientId: null },
        { names: ['?'], proposedIngredientId: null },
        { names: [], proposedIngredientId: 'milk-id' },
      ],
      scope,
      'en',
    );
    expect(results.map((r) => r?.match.id ?? null)).toEqual([
      'lapte-id',
      null,
      'milk-id',
    ]);
  });
});

describe('confidentMatch', () => {
  it('keeps a Match at or above the threshold and drops one below it', () => {
    expect(confidentMatch(milk, 0.6, 0.6)).toBe(milk);
    expect(confidentMatch(milk, 0.59, 0.6)).toBeNull();
    expect(confidentMatch(null, 1, 0.6)).toBeNull();
  });
});

describe('Catalog text and id validation', () => {
  const catalog = {
    categories: ['Dairy'],
    ingredients: [
      { id: 'milk-id', name: 'Milk', defaultUnit: 'ml', category: 'Dairy' },
    ],
  };

  it('renders the Catalog as compact tuples', () => {
    expect(catalogPrompt(catalog)).toBe(
      '{"categories":["Dairy"],"ingredients":[["milk-id","Milk","Dairy"]]}',
    );
  });

  it('rejects a proposed id that is not in the Catalog', () => {
    expect(
      validateCatalogMatch(catalog, {
        matchedIngredientId: 'invented',
        matchedCategory: null,
        matchConfidence: 0.9,
      }),
    ).toMatchObject({ matchedIngredientId: null, matchConfidence: 0 });
  });
});
