# Add Recipe — design handoff (family recipe editor)

Status: approved design (Variant B, tabs), updated 2026-10-24 against `main` @ `8c18169`, then amended by a grilling session the same day (`v3-amendments.md`). Not built yet: the editor in `main` is still the stacked `EditorForm`.

## Files, in reading order

| File | What it is |
|---|---|
| `handoff.md` | The 13 Oct spec: tabs, one-row lines and steps, timer chips, drag reorder, inline tips, entry points, strings. Still the base. |
| `v2-amendments.md` | 24 Oct changes on top of `handoff.md`: Source Link row, Base Recipe card, shared ingredient search rows, the From a link step, header gear, Serves validation, new open questions. Where the two disagree, this file wins. |
| `v3-amendments.md` | 24 Oct grilling decisions on top of v2: fits the editor to ADR 0026 (Suggest Guidance), ADR 0027 (header, no gear) and ADR 0028 (Recipe Drafts); dnd-kit drag; Undo; one Save on Edit; scope, order and proposed ticket slices. Where it disagrees with v2, this file wins. |
| `add-recipe-v2-prototype.html` | **Source of truth for look and interaction.** Variant B with an entry switch (New Recipe · From a link · Plate Scan · Make a Variant · Edit Recipe) and the From a link step beside it (outcome switch for the error, duplicate and Link Cap states). Theme switch at the top. Live: https://claude.ai/artifact/6imLKTpUWWVhckemQVYR1x |
| `add-recipe-prototypes.html` | The 13 Oct prototype with variants A, B and C, kept for context (the file name `handoff.md` refers to). Live: https://claude.ai/artifact/SEzH2LKdEstpjb4MReSAfe |
| `notes.md` | Decision log for both rounds and the open questions. |

Both prototypes are self-contained HTML: open them in a browser, no build step. They load their fonts from Google Fonts; offline they fall back to system faces.

## Depends on

`themes/` tokens (every colour, radius and shadow), `catalog-search/` and the shared `CatalogSearch` in `main` (#264–#270), `row-gestures/` (the 500 ms hold), `recipes/` (detail-page tabs and step-number glyph). Behaviour for Recipe from Link follows ADR 0024; Allergy indicators follow ADR 0014.

## Code touched

`apps/web/src/pages/Recipes/FamilyRecipePages.tsx`, `pages/Recipes/components/FamilyRecipeForm.tsx`, `pages/Recipes/RecipeFromLinkPage.tsx` (restyle only), `components/BaseRecipePicker.tsx` (presentation), `components/SourceLink.tsx` (Undo), `components/recipeEditor/*`, `components/EditorForm.tsx` (Recipes side only), `i18n/locales/*/recipes.json`. No API change, except the optional proposal in `v2-amendments.md` §3.
