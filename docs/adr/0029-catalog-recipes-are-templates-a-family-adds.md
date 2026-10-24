# Catalog Recipes are templates a Family adds before cooking or planning

Until now the Recipes list, Cook Tonight, Meal Plans and Pairings mixed Catalog Recipes and Family Recipes, so a Family's own Recipes were lost among everything the Admins curate. We split them. `/recipes` lists Family Recipes only. Catalog Recipes are browsed in **Explore**, and a Family cooks or plans one only after it **Adds it to Family**, which makes a Family Recipe that remembers the Catalog Recipe it was Copied From. Agreed in a grilling session on 2026-10-24 over the Explore handoff (`docs/handoffs/explore-handoff/`).

## Decision

- **Add to Family copies.** The copy is an ordinary Family Recipe with a `copied_from_id` to its source. It is written in the adding Member's Catalog Language, and it takes the lines, Steps, Tips, Hidden Tips, Guidance (Pairings included) and Eating Moments, but no Source Link. A copied Catalog Base becomes a Family Base with the Base's own Tips. A copied Catalog Variant becomes a Family Variant of the same Catalog Base, so it keeps inheriting that Base's Tips.
- **Copies are frozen.** Admin edits to the Catalog Recipe never reach them, as with Variants (ADR 0006).
- **At most one live copy per Family and Catalog Recipe.** The copy route is idempotent. An archived copy frees the slot. A Variant made from a Catalog Recipe is not a copy.
- **Undo archives the copy.** Recipes are archived, never deleted, so Undo uses the existing archive route rather than a new delete or a deferred `POST`.
- **Variants still hang off Catalog Bases only.** Make a Variant on a copy branches from the Catalog Base it was Copied From, prefilled from the copy. It is hidden when that Base is archived. In the family list a Family Variant is grouped under the Family's live copy of its Base when there is one, and is otherwise its own row.
- **Scope everywhere:**
  - Cook Tonight is Family Recipes only. Explore runs the same matching over Catalog Recipes.
  - The Meal Plan picker lists Family Recipes first, then an Explore section where a pick Adds to Family and plans in one step. Plan fill uses Family Recipes only.
  - Plate Scan still ranks Catalog Bases, and opens the Explore preview.
  - A Catalog Recipe's preview still allows add-missing and per-line add to the Shopping List, so Source Recipes can still point at Catalog Recipes.
- **Links to a Catalog Recipe** open the Family's live copy if there is one, otherwise `/recipes/explore/:id`. `/recipes/:catalogId` redirects the same way.
- **Existing Meal Plan slots** that point at Catalog Recipes are migrated: each Family gets a copy of every Catalog Recipe its plans use, and the slots are repointed.

## Considered options

- **Hide Catalog Recipes from the list only, and keep them cookable and plannable everywhere.** Rejected: a Recipe that can sit in the Meal Plan but not in the list is confusing, and the preview's "add it to change, plan or cook it" would mean nothing.
- **Copies follow Admin edits ("Review changes").** Rejected for now: it needs a diff and merge with the Family's own edits. `copied_from_id` leaves room to add it.
- **Copying a Catalog Variant also copies its Base**, so Family Variants hang off Family Bases. Rejected: it would add two Recipes for one tap, and it breaks the rule that Variants branch from Catalog Bases.
- **Let Family Bases have Variants.** Rejected for this change. It is cleaner for a family-first list, but it reopens ADR 0006 for more than this feature needs.
- **Hard-delete an undone copy.** Rejected: it would add the only Recipe delete path, for a row nothing references yet.

## Consequences

- Every Undo leaves an archived Recipe behind.
- A new Family's Recipes list, Cook Tonight and Meal Plan are empty until it adds something, so the empty states point to Explore.
- A fix an Admin makes to a Catalog Recipe has to be made again in each Family's copy, by that Family.
