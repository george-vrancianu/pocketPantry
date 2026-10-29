/** A Tag on a Recipe, named in the viewer's language (mirror of the API's `RecipeTag`). */
export type RecipeTag = {
  id: string;
  name: string;
  kind: 'catalog' | 'family';
  /** Null on a Family Tag, which belongs to no Tag Group. */
  groupId: string | null;
  groupName: string | null;
  groupOrder: number | null;
  /** True on a Family Tag whose name claims an Allergen is absent ("Gluten-free"): the editor warns. */
  claimsAllergenFree?: true;
};

/** How many Tag chips a row shows before "+N". */
export const ROW_TAG_LIMIT = 2;

/**
 * The order Tags are shown in on a row: Tags in `matchedIds` first (in the order given, which is the
 * order the Member picked them), then Family Tags, then Catalog Tags by Tag Group order (Meal, Diet,
 * Cuisine, Method). Ties keep the order they arrived in. Pure: the Tag filter passes the Tags it matched.
 */
export function orderRowTags(
  tags: readonly RecipeTag[],
  matchedIds: readonly string[] = [],
): RecipeTag[] {
  const rank = (tag: RecipeTag) => {
    const matched = matchedIds.indexOf(tag.id);
    if (matched !== -1) return [0, matched, 0] as const;
    if (tag.kind === 'family') return [1, 0, 0] as const;
    return [2, tag.groupOrder ?? Number.MAX_SAFE_INTEGER, 0] as const;
  };
  return tags
    .map((tag, index) => ({ tag, index, key: rank(tag) }))
    .sort(
      (a, b) => a.key[0] - b.key[0] || a.key[1] - b.key[1] || a.index - b.index,
    )
    .map(({ tag }) => tag);
}

/** The chips a row draws and how many Tags are left over for "+N". */
export function splitRowTags(
  tags: readonly RecipeTag[],
  matchedIds: readonly string[] = [],
  limit = ROW_TAG_LIMIT,
): { shown: RecipeTag[]; more: number } {
  const ordered = orderRowTags(tags, matchedIds);
  return {
    shown: ordered.slice(0, limit),
    more: Math.max(0, ordered.length - limit),
  };
}

/** Every Tag name in row order, "Dinner, Vegan": what a row's accessible name lists. */
export function rowTagNames(
  tags: readonly RecipeTag[],
  matchedIds: readonly string[] = [],
): string {
  return orderRowTags(tags, matchedIds)
    .map((tag) => tag.name)
    .join(', ');
}
