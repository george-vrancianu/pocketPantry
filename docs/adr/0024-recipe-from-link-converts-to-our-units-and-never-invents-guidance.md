# Recipe from Link converts to our units and never invents guidance

Members want to save a recipe they found online without typing it in. Recipe from Link reads a web page (or pasted text) into the New Family Recipe page, and nothing is saved until the Member saves it. Agreed in a grilling session on 2026-10-24.

## Decision

- **Structured data first, AI always.** The API fetches the page and uses its schema.org `Recipe` JSON-LD when present, falling back to the page text. Either way an AI call turns it into our format: Ingredient Lines matched to Ingredients (Unmatched names otherwise), Steps rewritten in our words with timers pulled out, Cuisine and Method only when the page clearly states them.
- **Amounts are converted to our units, never the reverse.** Ingredient Lines keep only g, kg, ml, l and pcs. A cup of flour becomes about 120 g, a tablespoon of oil 15 ml, two cloves of garlic 2 pcs, and the original amount ("1 cup") goes into the line's preparation note. "A pinch" or "to taste" has no quantity.
- **Only what the source states.** Pairings, the Nutrition Note, Eating Moments and Tips are left empty, and missing Servings stay empty for the Member to fill in, never guessed.
- **The language defaults to the Member's Catalog Language**, with the choice to keep the page's own. Once saved it is an ordinary Family Recipe in that one language. The Source Link is kept and shown, with the source language when it was translated.
- Reads count against a separate Link Cap, and only reads that reach the AI count.

## Considered Options

- **Adding cup, tbsp and tsp to the unit list.** This is faithful to the source, but Pantry matching, the Plan Forecast and Shopping amounts all compare in g, ml and pcs, and none of them could judge a cup of flour against a 1 kg Batch.
- **Letting the AI write the guidance too.** Cheap to add, but it would sit beside the source's text as if the source said it, and ADR 0008 keeps guidance hand-written. Generating it can be a separate, explicit action later.
- **Keeping the page's language by default.** Most Members paste a link to cook from it in their own language.
- **Structured data only, with no AI.** Sites fill JSON-LD inconsistently, and it still leaves units, matching and timers to do.

## Consequences

- A converted amount is an approximation. The note keeps the original so the Member can check it.
- Recipes read before any later change of approach keep their converted amounts. Reverting means reading them again.
