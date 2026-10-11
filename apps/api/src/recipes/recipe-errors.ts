import { ApiException } from '../common/api-exception';

/**
 * Coded errors of the Recipe module. The web app owns the copy for each code
 * (`errors:<code>`). Statuses: 404 for a missing thing, 409 for a rule about
 * the Recipe hierarchy or a stale view, 400 for an invalid request body.
 *
 * - `recipes.not_found` (404): no Catalog Recipe with that id (Admin), or, for a Member, no Recipe
 *   with that id that is the Catalog's or their own Family's (unknown or another Family's).
 * - `recipes.parent_not_found` (404): the Variant's base is not a Catalog Recipe (Admin), or not a Recipe
 *   the Member's Family can see (Member).
 * - `recipes.variant_of_variant` (409): the base is itself a Variant.
 * - `recipes.parent_archived` (409): the base is archived; new Variants are refused.
 * - `recipes.quantity_unit_mismatch` (400, `{ line }`): quantity without unit or unit without quantity.
 * - `recipes.ingredient_required` (400, `{ line }`): a Catalog line without an Ingredient, or a Family line
 *   with neither an Ingredient nor a usable name.
 * - `recipes.line_name_conflict` (400, `{ line }`): a Family line with both an Ingredient and a raw name.
 * - `recipes.item_not_found` (400, `{ kind }`): a line, Step or Tip id that is not on this Recipe.
 * - `recipes.duplicate_item` (400, `{ kind }`): the same line or Step id twice in one document.
 * - `recipes.bad_step_anchor` (400): a Tip's step is not a Step of the same Recipe.
 * - `recipes.bad_hidden_tip` (400): hiding a Tip that is not a Recipe-level Tip of the Variant's base,
 *   or hiding on a Base Recipe.
 * - `recipes.tip_not_found` (404): no such Tip on this Recipe.
 * - `recipes.tip_order_stale` (409): the Tip order does not name every Tip of the Recipe.
 * - `recipes.source_locale` (400): translating into the source language.
 * - `catalog.not_found` (404, `{ entity }`): unknown Ingredient, Cuisine or Method.
 */
export const recipeNotFound = () => new ApiException(404, 'recipes.not_found');

export const itemNotFound = (kind: 'line' | 'step' | 'tip') =>
  new ApiException(400, 'recipes.item_not_found', { kind });
