import { ApiException } from '../common/api-exception';

/**
 * Coded errors of Recipe Drafts (ADR 0028). The web app owns the copy for each
 * code (`errors:<code>`).
 *
 * - `recipe_drafts.not_found` (404): no Recipe Draft with that id for this Member. Unknown, another
 *   Member's (same Family or not) and expired ones look the same.
 * - `recipe_drafts.limit_reached` (409, `{ max }`): the Member already holds the most Recipe Drafts allowed.
 * - `recipe_drafts.version_conflict` (409): the client's version is not the stored one, so the
 *   Recipe Draft changed on another device; the content was left as it was.
 */
export const recipeDraftNotFound = () =>
  new ApiException(404, 'recipe_drafts.not_found');

export const recipeDraftLimitReached = (max: number) =>
  new ApiException(409, 'recipe_drafts.limit_reached', { max });

export const recipeDraftVersionConflict = () =>
  new ApiException(409, 'recipe_drafts.version_conflict');
