import { describe, expect, it } from 'vitest';
import { catalogRecipeHref } from './catalogRecipeHref';

describe('catalogRecipeHref', () => {
  it("opens the Family's live copy of a Catalog Recipe", () => {
    expect(
      catalogRecipeHref({
        id: 'cat-1',
        owner: 'catalog',
        familyCopyId: 'copy-1',
      }),
    ).toBe('/recipes/copy-1');
  });

  it('opens the Explore preview of a Catalog Recipe without a copy', () => {
    expect(
      catalogRecipeHref({ id: 'cat-1', owner: 'catalog', familyCopyId: null }),
    ).toBe('/recipes/explore/cat-1');
    expect(catalogRecipeHref({ id: 'cat-1', owner: 'catalog' })).toBe(
      '/recipes/explore/cat-1',
    );
  });

  it('opens a Family Recipe as itself', () => {
    expect(catalogRecipeHref({ id: 'fam-1', owner: 'family' })).toBe(
      '/recipes/fam-1',
    );
  });
});
