# Add Recipe (family recipe editor) — prototype notes

## Round 3 (2026-10-24): grilling against main, no new prototype
Decisions in `v3-amendments.md`. The handoff is fitted to ADR 0026 (Suggest Guidance), ADR 0027 (header holds one button, no gear) and ADR 0028 (Recipe Drafts): header Back · title · Save with a draft-status subline; Discard prompt on leaving Edit via a data router; Suggest on the Guidance disclosure row; read-only "Variant of" row for Make a Variant; dnd-kit drag; Undo on line, step and Tip removal; one Save on Edit for document then Guidance; Admin gets the rows but not the tabs. All round 1 and round 2 open questions are closed. Proposed ticket slices A–K are in v3 §10; posting them is left to George.

## Round 2 (2026-10-24): v2 brought up to date with main @ 8c18169
Prototype artifact (Variant B only, plus the From a link step): https://claude.ai/artifact/6imLKTpUWWVhckemQVYR1x
Project files: `docs/recipes/add-recipe-v2-prototype.html`, `docs/recipes/add-recipe-v2-amendments.md` (read together with the 13 Oct handoff). v1 artifact left untouched.

Since round 1, main gained: the Recipes "+" menu with From a link (#511–#515), New Recipe opening from a supplied draft with closest Base Recipes and the hidden-by-Allergies Show (#509, #516), the removable Source Link (#517), the shared ingredient search with Browse by aisle, Use as typed, Add to your catalog and the Family tag (#264–#270), and the header gear (#531). The tabbed editor itself is still not built.

v2 decisions: Source row first on Details (Remove link gets Undo); Base Recipe card under the title with a "Saves as a Variant of …" line; the shared search rows replace "Add by name" (Add to your catalog first on no match, Use as typed last); a proposal to add a free-text line to the family catalog from its ⌄ strip; header = Back · title · Save · gear; Details badge also flags blank Serves (supplied drafts can arrive without it).

Open: hide the gear on editor routes or add an unsaved-changes prompt; Base pick on Details vs its own step; API check for the free-text → Family ingredient proposal.

## Round 1 (2026-10-13) — decision: Variant B (Tabs); Edit shares the same form; no dock on the editor
Prototype artifact (3 variants, theme switcher Warm/Minimal/Dark, B has a New / Variant / Edit mode switch): https://claude.ai/artifact/SEzH2LKdEstpjb4MReSAfe
Handoff: `docs/recipes/add-recipe-handoff.md` + `docs/recipes/add-recipe-prototype.html` in the project. Repo copies at `docs/handoffs/recipes/add-recipe-handoff.md` and `add-recipe-prototypes.html`, committed on branch `design/add-recipe-handoff` in the session clone (push refused: the repo is not attached to the session); files also delivered in chat.

### Round 1b feedback applied (same day)
- **Hold-to-drag reorder** on ingredient and step rows: 500 ms hold (row tints `--accent-tint` while holding) or an immediate drag from the grip lifts the row (`--shadow-float`, scale 1.02); siblings swap on midpoint crossing with a 200 ms slide; release drops. Move up/down stay in the strip as the no-gesture path. Holds that start on inputs/buttons are ignored.
- **Add-step rows at both ends** of the Steps card, drawn like a step: a dashed `--accent` 26 pt "+" circle in the number column + label. Top "Add a step at the start" inserts at index 0; bottom "Add a step" / "Add the first step".

### What the page was on 13 Oct
`apps/web/src/pages/Recipes/FamilyRecipePages.tsx` (NewRecipePage / NewVariantPage / EditFamilyRecipePage) → `components/FamilyRecipeForm.tsx` → shared `EditorForm` + `recipeEditor/RecipeMetaFields` + `RecipeLinesSection` + `RecipeStepsSection` + guidance (`FamilyGuidanceFields`). Edit additionally renders `TipsEditor` and `FamilyGuidance` under the form. Draft model and validation: `lib/recipeDraft.ts`.

### Variants shown
- A · One scroll, dense rows.
- **B · Tabs (chosen)** — Details / Ingredients / Steps sticky tabs with counts, Save pill in the header, Edit opens on Steps and edits step tips inline, Variant shows copied tips as a count.
- C · Overview + sheets.

### Shared decisions
- Ingredient row: grip, name + subline, quantity + unit chip, ⌄ → strip with note, Optional toggle, move/remove. Remove → toast with Undo.
- Catalog search and free-text add merged (v2: now via the shared search's Use as typed / Add to your catalog).
- Timer is a chip. Level cycles on tap. Cuisine/Method stay native selects, styled.
- Guidance optional, collapsed; Eating moments as tap-cycling chips.
- Edit saves guidance with the document in one Save; recipe-level and inherited tips go in a second "Recipe tips" card (not prototyped).

## Open questions (round 1, still open)
- Auto-scroll while dragging near the screen edges.
- Should a hold on the quantity cell / step text also lift the row?
- Warn before Back with unsaved changes on Edit? (now also the gear)
