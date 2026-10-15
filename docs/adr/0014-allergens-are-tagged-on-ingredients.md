# Allergens are tagged on Ingredients and derived for Recipes

Members need an Allergy Warning on any Recipe that contains one of their Allergies, and the option to hide those Recipes. Admins tag Allergens on shared Ingredients, Members tag them on Family Ingredients, and a Recipe's Allergens are derived from its Ingredient Lines at read time, never stored or tagged on the Recipe. One tag on "Parmesan" then covers every Catalog Recipe, Family Recipe and Variant that uses it, and editing a Recipe can never leave its Allergens out of date. Can Make is derived the same way ([ADR 0007](0007-recipe-pantry-matching.md)).

## Decision

- Allergens are a fixed list that Admins curate and translate, seeded with the EU's 14 major allergens. Members pick their Allergies from that list only.
- A shared Ingredient with no Allergen tags contains none. A Family Ingredient with no tags is Unchecked until a Member tags it, and ticking "no Allergens" counts as tagging it. One exception: a shared Ingredient promoted from Family copies none of which a Member checked stays Unchecked until an Admin saves its Allergens, as "no tags" there means nobody has looked, not "contains none". An Unmatched Ingredient Line is always Unchecked. Unchecked lines give the softer Allergy Warning and never hide a Recipe.
- When a Family Ingredient is promoted or merged ([ADR 0011](0011-family-ingredients-are-owned-ingredients.md)), its tags carry over for the Admin to review.
- A line that is optional gives the softer Allergy Warning and never hides a Recipe.
- Hiding uses only the viewer's own Allergies and Family Allergies. It applies to browsing and matching: the Recipes list and search, the Can Make strip, the Cook Tonight Widget and Plate Scan matches. A Recipe's own page, the Variants list, Pairing links, Meal Plans and Admin pages never hide a Recipe. Each Variant is judged on its own Ingredient Lines. One exception: the title search when saving a Plate Scan as a Recipe always shows hidden Recipes, as a deliberate look-up.

## Considered Options

- **Tagging Allergens on each Recipe.** Every Family Recipe and Variant would need its own tags, which would drift as lines are edited, and a missed tag would read as safe.
- **Both: derived, plus manual extras on the Recipe.** This would give two sources that can disagree, with no clear owner of the result.

## Consequences

- Because "no tags" on a shared Ingredient means "contains none", the whole shared Catalog seed must be tagged before the feature ships. Otherwise every Recipe would look safe.
- The About tab says "No common allergens found", never "Allergen-free", and always carries a reminder to check product labels.
- Every shared seed Ingredient declares its Allergens (an empty list means none) and seed validation fails if one does not. The seed applies an Ingredient's tags once: the first seed run that finds it unflagged inserts its tags and sets `allergens_checked`. Later runs leave it alone, so a tag an Admin removes is never re-added, and a database seeded before the tags existed gains them on its next seed. The cost is that a later correction to a seed tag does not reach Ingredients already flagged; an Admin edits those in the Catalog.
