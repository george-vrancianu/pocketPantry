# Recipe Variants are full Recipes, two levels deep, with Cuisine and Method as tags

Recipes are grouped so a Member can branch from a plain Base Recipe (Omelette) into Variants from different Cuisines (Mediterranean) or with a different Method (frittata). Agreed in a grilling session on 2026-10-10.

## Decision

- **A Variant is a full Recipe** with its own ingredients and steps and a link to its Base Recipe. It is not stored as a set of changes to the base. Creating a Variant copies the Base Recipe's ingredients and steps as a starting point. From then on the two are independent, so editing the base never changes its Variants.
- **The hierarchy is exactly two levels.** A Base Recipe has no parent and a Variant has exactly one. Variants have no Variants. The Base Recipe can be cooked on its own.
- **Cuisine and Method are tags, not levels.** Each Recipe has at most one of each. Both are optional, and both come from a list Admins curate and translate. A Mediterranean frittata is a Variant written by hand with both tags, not an automatic combination of two other Variants.
- "What's different from the base" is worked out on display, as an ingredient diff only.
- Tips that aren't anchored to a step are inherited by every Variant, which can hide them. Tips anchored to a step stay on the Recipe they were written for.
- Base Recipes are archived, never hard-deleted, so Variants, Source Recipe references, and favourites keep working.

## Alternatives rejected

- **Variants as changes to the base** (add feta, swap butter for olive oil, replace step 3). This shows the diff for free, but every edit to a base silently changes every Variant. Pantry matching, cook deduction, and the Shopping List would also all have to work on a recipe assembled at read time.
- **Arbitrarily deep trees** (Omelette → Mediterranean → Greek). These make browsing and the grouping in Cook Tonight harder for little gain.
- **Cuisine as a tree level.** Cuisine cuts across Base Recipes ("everything Mediterranean"), so it has to be filterable on its own.

## Consequences

- Shared content is duplicated across Variants. A fix to the base's steps has to be made again in each Variant that copied them.
- Inherited Tips can't follow steps, because a Variant's steps aren't linked to the base's steps.
