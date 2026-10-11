# Recipe guidance is written by hand: Nutrition Notes over values, Eating Moments as tags marked Good for or Avoid

Each Recipe tells a Member what it pairs with and why, how nourishing it is, and when it is best (or worst) to eat. Agreed in a grilling session on 2026-10-11 (#136).

## Decision

- **Pairings** are an ordered list of at most 10 per Recipe. Each has a kind (food or drink), a translatable label, a translatable reason, an optional Pairing Principle from a fixed enum labelled in the web bundle, and an optional link to a Catalog Ingredient or a Recipe. A Catalog Recipe links only to Catalog content. A Family Recipe may also link to its own Family's Recipes. When a linked Recipe is archived, the label stays and the link is hidden.
- **The Nutrition Note is free text, not values.** It is one optional recommendation per Recipe, at most 500 characters, and always gives both the good and the bad. It is shown with a fixed disclaimer: general guidance, not medical or dietary advice.
- **Eating Moments are an Admin-curated, translated list**, managed like Aisles. A Recipe uses at most 10, each marked Good for or Avoid with an optional translatable reason. One Eating Moment can't be both on the same Recipe.
- **Variants copy, they don't inherit.** "Make a variant" copies Pairings, the Nutrition Note, and Eating Moments, which are independent afterwards, as ingredients and steps are (ADR 0006).
- Catalog guidance text is translated per locale. Family Recipes carry it untranslated.

## Alternatives rejected

- **Nutrition values typed in by hand** (kcal, protein, carbs, fat per serving). This gives false precision for a home kitchen, and the numbers go stale as soon as an Admin edits a line.
- **Nutrition values worked out from Ingredient Lines.** The Catalog has no nutrition data, and lines like "salt, to taste" or a quantity in `pcs` don't convert to grams.
- **Free-text "when to eat".** It can't be filtered later, and "good for" and "avoid" would blur together.
- **Separate lists for good and bad moments.** The same moment (Before bed) is good for one Recipe and bad for another, so a single list with a polarity on each use is enough.
- **Inheriting guidance from the Base Recipe live**, like Recipe-level Tips. Adding feta changes the Nutrition Note and often the Pairings, and live inheritance would need the same hide-list that Tips have.

## Consequences

- Nutrition can't be summed into meal plans or the Nutrition widget. That needs values, which would be a new decision.
- A correction to a base's guidance has to be repeated in each Variant that copied it.
