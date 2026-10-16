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
 * 4. `keepConfident` / `confidentMatch`: a Match below the confidence threshold is dropped and
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
  /**
   * Opt in to preferring an exact name or Synonym hit over a proposed
   * Ingredient the model was not confident in (`confidence` below
   * `threshold`). Without it a proposed Ingredient in the Catalog always wins
   * (Receipt Scans); Voice Notes set it.
   */
  floor?: { confidence: number; threshold: number };
};

const doubted = (item: MatchItem) =>
  item.proposedIngredientId !== null &&
  item.floor !== undefined &&
  item.floor.confidence < item.floor.threshold;

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

/**
 * The confident Match for a resolved item. An exact name or Synonym hit is not
 * scored by the model, so it always passes; a proposed Ingredient must reach
 * `threshold` or the item is Unmatched.
 */
export function keepConfident(
  resolved: ResolvedMatch | null,
  matchConfidence: number,
  threshold: number,
): CatalogSearchResult | null {
  if (!resolved) return null;
  return resolved.exact
    ? resolved.match
    : confidentMatch(resolved.match, matchConfidence, threshold);
}

@Injectable()
export class CatalogMatchService {
  constructor(private readonly catalogSearch: CatalogSearchService) {}

  /**
   * One Catalog query per kind for all `items`; returns a result per item, in
   * order. A proposed id that is in the Catalog wins, unless the item carries a
   * `floor` and the proposal is below it (doubted): then an exact hit wins and
   * the proposal is only the fallback. An item without an id (or whose id is
   * unknown) is tried by exact normalised name or Synonym in any locale. Names
   * are queried for items given no id and for doubted ones, so an item with an
   * unknown id matches by name only if another item in the batch queried the
   * same name. An ambiguous name stays Unmatched (null).
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
          item.proposedIngredientId && !doubted(item)
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
      if (named && !doubted(item)) return { match: named, exact: false };
      for (const name of item.names) {
        const hit = name ? byExactName.get(name) : undefined;
        if (hit) return { match: hit, exact: true };
      }
      // Doubted and nothing exact: still the proposal, which keepConfident drops.
      return named ? { match: named, exact: false } : null;
    });
  }
}
