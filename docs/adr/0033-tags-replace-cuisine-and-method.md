# Tags replace Cuisine and Method

Recipes had two single-choice, Admin-curated fields, Cuisine and Method, and the Recipes filter offered only those. They were too rigid: a Recipe is often several things at once (breakfast, keto, Mediterranean), and Families had no way to add their own words. We replaced both fields with Tags: any number per Recipe, either Catalog Tags (Admin-curated, translated, grouped under Tag Groups, with Cuisine and Method kept as two of the groups) or Family Tags (created by Members, private to the Family, untranslated). The existing Cuisines and Methods were migrated into Catalog Tags, and the old columns and tables were dropped in the same release instead of being kept as a fallback.

## Consequences

- Tags are for finding Recipes only. They do not replace Eating Moments (which carry Good for / Avoid and a reason) or Mealtimes (which lay out a Meal Plan), even when the words overlap, such as "breakfast".
- Diet Tags such as keto are unchecked claims. Allergen-free claims (gluten-free, dairy-free) are never Catalog Tags, because Allergens are derived from Ingredient Lines precisely so that nobody has to trust a claim.
- Catalog Recipes carry only Catalog Tags. A Family tags a Catalog Recipe only after Add to Family, which copies the Catalog Tags onto its copy.
- AI reads (Recipe from Link, Plate Scan) choose from existing Tags and never create one.
