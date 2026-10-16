import { Injectable } from '@nestjs/common';
import type { CatalogScope } from '../catalog/catalog-scope';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import type {
  CatalogLocale,
  CatalogSearchResult,
} from '../catalog/catalog.schemas';
import type { ExpiryOverride } from '../catalog/catalog-defaults';

/**
 * The Receipt Scan's Catalog-matching pipeline, shared by every caller that
 * reads items out of an image or audio (Receipt Scans, Voice Notes). It knows
 * nothing about receipts: an item is a spoken or printed name, an Ingredient
 * id the model proposed, and a confidence.
 *
 * 1. Give the model the Catalog text (`catalogPrompt`, byte-identical for all
 *    callers so provider prompt caching is shared).
 * 2. Check a proposed id against the Catalog the Family sees
 *    (`validateCatalogMatch`).
 * 3. `CatalogMatchService.resolve`: the validated proposed Ingredient, else an
 *    exact name or Synonym hit (Family Synonyms included, scoped to the
 *    scanning Family only).
 * 4. `confidentMatch`: a Match below the confidence threshold is dropped and
 *    the item is Unmatched.
 */
export {
  catalogPrompt,
  validateCatalogMatch,
} from '../ingredients/ingredient-catalog';

/** One thing read from the input. */
export type MatchItem = {
  /** Candidate names for an exact lookup, best first (e.g. generic name, then the printed text). */
  names: readonly (string | null | undefined)[];
  /** The Ingredient id the model proposed, if any. */
  proposedIngredientId: string | null;
};

/** The Catalog Ingredient for an item; `exact` when found by exact name lookup rather than proposed by the model. */
export type ResolvedMatch = { match: CatalogSearchResult; exact: boolean };

/**
 * The Match to keep: one whose confidence falls below `threshold` is dropped
 * (the item is Unmatched), as is a missing one.
 */
export function confidentMatch(
  match: CatalogSearchResult | null,
  matchConfidence: number,
  threshold: number,
): CatalogSearchResult | null {
  return match !== null && matchConfidence >= threshold ? match : null;
}

@Injectable()
export class CatalogMatchService {
  constructor(private readonly catalogSearch: CatalogSearchService) {}

  /**
   * One Catalog query per kind for all `items`; returns a result per item, in
   * order. A proposed id that is in the Catalog wins. An item without one (or
   * whose id is unknown) is tried by exact normalised name or Synonym in any
   * locale; only an item that was given no id falls back to names, and an
   * ambiguous name stays Unmatched (null).
   */
  async resolve(
    items: readonly MatchItem[],
    scope: CatalogScope,
    locale: CatalogLocale,
    overrides: readonly ExpiryOverride[] = [],
  ): Promise<(ResolvedMatch | null)[]> {
    const ids = [
      ...new Set(
        items.flatMap((item) =>
          item.proposedIngredientId ? [item.proposedIngredientId] : [],
        ),
      ),
    ];
    const byId = new Map<string, CatalogSearchResult>(
      (await this.catalogSearch.findByIds(scope, ids, locale, overrides)).map(
        (match) => [match.id, match],
      ),
    );
    const names = [
      ...new Set(
        items.flatMap((item) =>
          item.proposedIngredientId
            ? []
            : item.names.filter((name): name is string => !!name),
        ),
      ),
    ];
    const byExactName = await this.catalogSearch.findExact(
      scope,
      names,
      locale,
      overrides,
    );
    return items.map((item) => {
      const named = item.proposedIngredientId
        ? byId.get(item.proposedIngredientId)
        : undefined;
      if (named) return { match: named, exact: false };
      for (const name of item.names) {
        const hit = name ? byExactName.get(name) : undefined;
        if (hit) return { match: hit, exact: true };
      }
      return null;
    });
  }
}
