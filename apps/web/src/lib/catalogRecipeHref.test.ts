import { describe, expect, it } from 'vitest';
import { catalogRecipeHref } from './catalogRecipeHref';

describe('catalogRecipeHref', () => {
  it("opens the Family's live copy when there is one", () => {
    expect(catalogRecipeHref('cat-1', 'copy-1')).toBe('/recipes/copy-1');
  });

  it('opens the Explore preview without a copy', () => {
    expect(catalogRecipeHref('cat-1', null)).toBe('/recipes/explore/cat-1');
    expect(catalogRecipeHref('cat-1', undefined)).toBe(
      '/recipes/explore/cat-1',
    );
  });
});
