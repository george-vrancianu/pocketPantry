# Recipe Pantry matching is quantity-aware, gives the benefit of the doubt, and skips Pantry Basics

Cook Tonight, the Recipe detail page, and "add missing to Shopping List" all need to know how well a Recipe fits a Family's Pantry. Agreed in a grilling session on 2026-10-11 (#140).

## Decision

- **Each required Ingredient Line is covered, short, or missing**, worked out at read time and never stored. Quantities follow the Servings the Member picked, defaulting to the Recipe's own.
- **Quantities are summed over the Ingredient's unexpired Batches** in a comparable unit. Batches with no expiry date count; expired Batches don't. A total at or above the line is covered, below it is short, and no Batch at all is missing.
- **Units scale within one dimension only**: g↔kg and ml↔l. Mass, volume, and count never convert into each other, in line with the no-conversion rule.
- **Benefit of the doubt**: if a Batch exists but none can be compared (no quantity, or a unit in another dimension), the line is covered.
- **Lines with no quantity** ("salt, to taste") match on presence.
- **Pantry Basics** (an Admin flag on an Ingredient: water, salt, pepper) are always covered.
- **Optional lines** never count toward the score or Can Make.
- **Unmatched lines** on Family Recipes match Unmatched Batches with the same normalised name, and are otherwise missing.
- **The Shopping List doesn't count.** The detail page may show "on your list" beside a missing line, but the score ignores it.
- **Can Make** means no required line is short or missing.
- **Ranking**: fewest short or missing required lines, then most covered lines that use an Expiring Soon Batch, then coverage ratio. The same order picks the best Recipe in a Base Recipe group.
- **Cook Tonight** shows Recipes the Family Can Make plus those missing exactly one required line ("Missing: feta").
- **Add missing** adds the shortfall for a short line when units compare, the full quantity for a missing line, and a quantity-less item for a quantity-less line. Pantry Basics, optional lines, and covered lines are never added. Items carry the Recipe as a Source Recipe and merge by the usual Shopping List rule.

## Alternatives rejected

- **Presence only.** Simpler, but it claims a six-egg frittata is makeable with one egg left.
- **Strict quantities** (an uncomparable Batch doesn't cover). It punishes Families who don't record quantities, which the Pantry allows.
- **No Pantry Basics.** Almost every Recipe would be one line short for salt or water, and the near-miss list would be noise.
- **Counting the Shopping List as stock.** Items on the list aren't in the kitchen yet; Cook Tonight is about tonight.

## Consequences

- Matching can overstate what's possible when Batches lack quantities or use another dimension's unit. The detail page shows per-line status, so a Member can see why.
- Pantry Basics are global for now. A Family that tracks salt can't opt out until a Family override is added.
- Cook-time Pantry deduction (later) can reuse the same comparable-unit logic.
