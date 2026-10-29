# A Plate Scan writes a Recipe Draft, with no Review and a second Credit for the Recipe

Until now a Plate Scan's picked dish became Ingredient Lines for one serving in a Review card. The card's main save added them to the Shopping List, and a secondary panel saved them as a Family Recipe with no Steps, straight past New Recipe. Members use a Plate Scan to get a dish they can cook, so we make the result a Recipe: picking a dish writes a whole Recipe in the background, kept as a Recipe Draft that opens on New Recipe. This amends ADR 0024 (what an AI read may make up), ADR 0031 (the background holder) and ADR 0032 (the Plate Scan's price).

## Decision

- **No Plate Review.** The Plate card stays in the Scan Session showing only its dish guesses. Picking one moves it out of the Scan Session into the holder link reads use (now recipe reads: links and plates), whose strip row opens New Recipe on the Recipe Draft. The server creates the Recipe Draft inside the request, checking the 20-draft limit and the Credit Balance before the AI call, as from-link does. A refused pick does not spend the Plate token, and the card keeps its guesses.
- **The Recipe is written, not read.** One call returns Ingredient Lines (with preparation notes and optional flags), Steps with optional timers, and Recipe and Step Tips, for the Servings the dish usually makes, in the Catalog Language. Unlike Recipe from Link (ADR 0024), there is no source to stay faithful to, and the Member edits everything on New Recipe before saving. Guidance is still never made up while reading; the Member can Suggest Guidance on the page (ADR 0026).
- **Plate matches move to New Recipe.** The closest Catalog Base Recipes are offered by the Base Recipe picker there, with Standalone picked by default.
- **Two Credits, charged in two steps.** Reading the photo costs the ordinary Scan price. Writing the picked dish costs its own price, set in the environment like the others and starting at 1. Each is charged only if it succeeds. The Scan mode slider shows the Scan price, and each dish guess shows the writing price. Only the photo counts against the Scan Cap.
- **A pick lasts as long as its connection**, as a link read does (ADR 0031): discarding it or closing the tab creates no Recipe Draft and hands the token back.

## Considered options

- **Keep Review, with "Open as New Recipe" in place of the save panel.** Rejected: it adds a screen between the pick and the Recipe, and the Ingredient Lines would be edited twice.
- **Keep "Add to Shopping List" from a Plate Scan.** Rejected: a Member can shop for a saved Recipe's missing Ingredients, and the Plate-only path had its own rules for Unmatched names and the bulk limit.
- **Lines now, and a separate "Suggest Steps" later.** Rejected: two waits and two prices for what Members see as one result.
- **One Credit for the whole Plate Scan** (ADR 0032's rule). Rejected now that the second call writes a whole Recipe: it costs about what a page read does, and a Member who dislikes the guesses should pay only for the photo. We will watch Usage Records and adjust the writing price.
- **Charging both Credits when the photo is read.** Rejected: it charges for a Recipe that is never written.
- **A blocking wait on the card.** Rejected: writing Steps makes the wait longer, and the Scan Session exists so the Member keeps scanning (ADR 0004).

## Consequences

- `/recipes/from-plate`, `PlateRecipeSave`, the Plate Shopping List save and `source: 'plate'` Shopping Items go away.
- The Plate token is now spent by the writing call, which creates the Recipe Draft; a token that expires before the pick still means reading the photo again.
