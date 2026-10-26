# Writer brief

You write one Base Recipe and its Variants as one data file. Follow [RULES.md](RULES.md).

Your brief names the base. Its entry in `plan.md` fixes the slugs, titles, Variants and cross-links; follow it exactly. If the plan looks wrong, say so in your hand-back instead of changing it.

## Read first

- `apps/api/src/catalog/seed/recipes/recipe-seed-types.ts`: the shape and the rules in its comments (Tips inheritance, `hideBaseTips`, at most 500 characters for the Nutrition Note, 1–10 Pairings and Eating Moments).
- `apps/api/src/catalog/seed/recipes/data/omelette.ts`: the reference file. Match its voice, its step granularity, and its en/ro pairing with `t(...)`.
- `docs/adr/0008-recipe-guidance.md`: what Pairings, the Nutrition Note and Eating Moments are for.

## The file

Write `apps/api/src/catalog/seed/recipes/data/<base-slug>.ts`, exporting `<exportName>: BaseRecipeSeed` with a short header comment like the omelette's. Leave `recipe-seed-data.ts` alone; the orchestrator wires it in.

Every recipe in the file, base and Variant alike, is a **full Recipe**: its own lines, steps, Nutrition Note, Pairings and Eating Moments. Write it as a cook who has made the dish many times:

- **Lines**: Catalog Ingredient slugs only, with quantities that fit `servings`. Leave out quantity and unit only for "to taste".
- **Steps**: one action per step, with visual cues for doneness ("until golden at the edges"). Give a `timerSeconds` only where the step really waits on a clock, and make it match the text.
- **Food safety**: poultry, minced meat and pork cooked through, with a clear doneness cue. Say so where raw or lightly cooked egg is involved.
- **Tips**: at least one Recipe-level Tip and one step Tip on the base. A Tip is advice someone would thank you for, not a restatement of a step. A Variant inherits the base's Recipe-level Tips; hide the ones that no longer apply with `hideBaseTips`.
- **Nutrition Note**: a direction, never numbers, always both the good and the bad, and no medical claims.
- **Pairings**: real pairings with a reason a cook would recognise. Link a Catalog Ingredient or a Recipe slug where one fits. Include your plan's cross-links.
- **History and origin**: state only what is widely known. Leave out dates, "traditional since" and regional claims you cannot stand behind.
- **Romanian**: natural home-cooking Romanian, as in the omelette file, not a word-for-word translation.

## Missing Ingredients

If you need an Ingredient that `dump-catalog.ts <api>` does not have (search names and Synonyms), stop. Hand back the list with proposed en/ro names, unit and what it is for. Never substitute a near match.

## Done

`npx tsx <skill>/scripts/check-recipe.ts <api> <your file>` reports nothing except `links unknown Recipe` for slugs that other writers in this batch own, and `npm run typecheck -w apps/api` and `npm run lint -w apps/api` are green. Leave the file uncommitted. Hand back the file path, the Variant slugs and anything you were unsure of.

On review findings, fix every `must-fix`, weigh each `consider`, re-run the checks, and hand back what you changed and which `consider` findings you declined, with why.
