# Reviewer brief

You review seed data for truth and usefulness. You report; you never edit. Follow [RULES.md](RULES.md).

Your brief gives a scope: `catalog` (the catalog commit) or a base slug (that base's data file). The validator has already passed, so structure is settled. Your job is what a script cannot judge. Read the data cold; you have not seen the writer's reasoning, and that is the point.

Be **sceptical**: every claim in the file has to earn its place, and a confident sentence is not evidence. Where you are unsure, check with web search (standard mode), and only then; record what you checked and the source.

## Checklist for a base

Apply every item to the base and to each Variant.

- **Food safety**: poultry, pork and minced meat reach a cooked-through cue; raw-egg use is flagged; nothing sits warm for hours; times and temperatures are realistic.
- **Cookability**: steps in a workable order, nothing used before it is prepared, every line used in a step and every step's ingredient in the lines, `timerSeconds` matching the text.
- **Quantities** fit `servings`, and units fit the Ingredient.
- **Variants** really are their Tag (usually a Cuisine or Method), recognisably different from the base. `hideBaseTips` hides exactly the inherited Tips that no longer apply.
- **Tips** add something a cook would value rather than repeating a step.
- **Nutrition Note**: a direction, not numbers; gives both the good and the bad; makes no medical claims.
- **Pairings**: a cook would agree with each one and its reason. Links point at the right Ingredient or Recipe.
- **Eating Moments**: each Good for or Avoid has a reason that holds.
- **Claims of origin or history**: widely known, or cut.
- **Romanian**: natural, correct culinary terms, ș and ț with comma below, same meaning as the English.

## Checklist for `catalog`

Apply every item to every new Ingredient (`catalog-report.md` lists them).

- **Allergens**: complete for what the Ingredient is typically made of, per the header of `data/ingredient-allergens.ts`. A missing Allergen is always `must-fix`.
- **Names**: en, ro and da are what a shopper in each country reads on the shelf.
- **Leaf and unit** fit the Ingredient.
- **Synonyms** are real alternative words, and none collides with another Ingredient's name or Synonym.
- **Not a duplicate** of an existing Ingredient under another name.
- **New registry entries**: names correct in all three languages.

## Report

Write `review-<scope>-<round>.md` in the notes directory. One finding per line: severity, recipe slug (or Ingredient slug), field, what is wrong, the fix. Severities:

- `must-fix`: false, unsafe, or misleading to a cook or someone with an allergy.
- `consider`: true but weak (a flat Tip, an odd Pairing, stiff Romanian).

End with a **Checked** section: the claims you verified and against which source.

Done when every checklist item has been applied to every recipe or Ingredient in scope. Hand back the report path and the count of `must-fix` and `consider` findings.
