# Add Recipe (family recipe editor) — design handoff

Status: approved design, ready for implementation. Date: 2026-10-13.
Reference prototype: `add-recipe-prototypes.html` (self-contained HTML; live at https://claude.ai/artifact/SEzH2LKdEstpjb4MReSAfe). **Variant B "Tabs" is the chosen one**; A and C are kept for context. Use the "Entry point" switch above phone B to see the New Recipe, Make a Variant and Edit Recipe states, and the theme switch at the top to check the three skins. The prototype is the source of truth for look, spacing and interaction; the numbers below are copied from it.

The page renders through the theme tokens from `docs/themes/handoff.md` (`--bg`, `--card-bg`, `--r-ctl`, …); nothing new at token level.

Code touched: `apps/web/src/pages/Recipes/FamilyRecipePages.tsx` (`NewRecipePage`, `NewVariantPage`, `EditFamilyRecipePage`), `pages/Recipes/components/FamilyRecipeForm.tsx`, `components/recipeEditor/RecipeMetaFields.tsx`, `RecipeLinesSection.tsx`, `RecipeStepsSection.tsx`, `RecipeTips.tsx`, `components/EditorForm.tsx` (Recipes side only; Admin keeps its editor), `components/CatalogSearch.tsx` (one new prop), `i18n/locales/*/recipes.json`. No API change. `lib/recipeDraft.ts` (draft shape, `problemsOf`, `documentOf`) is unchanged and remains the validation source.

---

## 1. Summary of the change

One form serves all three entry points (`/recipes/new`, `/recipes/:id/variant/new`, `/recipes/:id/edit`). Instead of one tall stack it gets the same sticky three-tab layout as the recipe detail page: **Details** (title, facts, Cuisine/Method, guidance), **Ingredients** and **Steps**. Each ingredient line and each step is one row; the rare fields (note, optional, reorder) open on demand. Catalog search and free-text add merge into one search row. Timers become a chip. Rows reorder by holding and dragging (grip or 500 ms hold). Steps can be added at the start as well as the end. Save moves to the header. Edit opens on the Steps tab and edits step tips inline, replacing the separate `TipsEditor` and `FamilyGuidance` blocks below the form.

Compared with today, six ingredients and four steps go from ≈3,000 pt of form to one screen per tab.

## 2. Layout (portrait, 390 pt reference, 18 pt page gutter)

| Region | Notes |
|---|---|
| Header | Back (left, 40 pt circle, chevron-left) → `/recipes` for New, `/recipes/:id` for Variant and Edit. Title: "New Recipe" / "Make a Variant" / "Edit Recipe" (display face 24/600, one line, ellipsis). Right: **Save** pill button (primary, `size="sm"`, `shape="pill"`, 36 pt), disabled while `hasProblems(problemsOf(draft))` or guidance has problems or a save is pending; label "Saving…" while pending. |
| Tabs | `SegmentedControl`, sticky at the top of the scroll view with the page background behind it. Three equal buttons 38 pt, 14/600; selected `--seg-on` / `--seg-on-ink`, 700, `--shadow-seg`. Ingredients and Steps carry a **count badge** (11/700, `--accent-tint`/`--accent-on-tint`; inverted on the selected tab). Details carries a red "!" badge (`--urgent-bg`/`--urgent-fg`) while the title is blank and has been touched. `role="tablist"` / `tab` / `tabpanel`; ←/→ move between tabs. Switching tabs scrolls to the top. |
| Panels | 14 pt gap between blocks, padded ≈ 110 pt at the bottom. No dock on the editor (it was never a tab destination; Back and Save are the only exits). |

Default tab: Details for New and Variant, **Steps for Edit** (the most common edit after a cook).

## 3. Details tab

1. **Title**: a borderless display-size input (28/600, bottom hairline `--line`, `--accent` when focused), placeholder "Recipe title", `required`. Under it a 12.5 `--muted` hint: New "Saved as one of your family's Recipes."; Variant "Copied from {base title} ({Catalog | Your family's}). Nothing is saved until you save it."; Edit "Your family's Recipe. Tips save as you change them." When the title is blank after blur, the hint is replaced by "Enter a title." in `--urgent-fg` (same `titleTouched` logic as today).
2. **Facts strip**: grid of 4 cells, 8 pt gap. Cell: `--field-bg`, `--bw-field` `--line` border, radius `--r-ctl`, padding 8 × 6, centred; label 10.5/700 caps `--muted`; value display 19/600 tabular; focus = `--accent` border + 3 pt `--accent-tint` ring. Cells: **Serves** (`inputmode="numeric"`, placeholder 4), **Prep** and **Cook** (numeric, placeholder "–", unit "min" 10.5 under the value), **Level** — a button that cycles Not set → Easy → Medium → Hard (`aria-label="Level: {value}. Tap to change"`); "Not set" rendered in `--muted` at 60 %. Validation messages from `recipeDraft.ts` (`admin:recipe.invalid.*`) show as a 12.5 `--urgent-fg` line under the strip, one at a time, with the offending cell's border in `--urgent-fg`.
3. **Cuisine / Method**: two pickers side by side (8 pt gap), 44 pt, same field styling, caps label on the left, native `<select>` with the chevron-down icon on the right; "None" rendered in `--muted`. Options from `useRecipeFilters(locale)` as today.
4. **Guidance** (Pairings, Nutrition note, Eating moments): one card with a **disclosure row** (title "Pairings, nutrition & moments" 15/600, subline "{n} set · optional" or "Optional", chevron rotates). Collapsed by default. Open: section labels (12/700 caps `--muted`); Pairings as rows (label 15/600, "{kind} · {reason}" 12.5 `--muted`, × to remove) + ghost "Add a pairing" button that opens the existing pairing fields (kind, label, principle, reason, recipe/ingredient link); **Good for** as a chip row of the live Eating Moments — tap once = Good for (`--accent-tint`, check icon), twice = Avoid (`--soon-bg`/`--soon-fg`, × icon), a third time clears; reason field appears under a chosen chip (not in the prototype; reuse today's field); Nutrition note as a 60 pt textarea. Data and validation stay `GuidanceDraft` / `guidanceProblems`.
5. Footer: right-aligned ghost link "Ingredients ›" that switches tab.

## 4. Ingredients tab

One card (`--card-bg`, `--card-line`, radius `--r-card`, `--shadow-card`, padding 2 × 10) with one **row per line**, separated by 1 pt `--divider`, min-height 50, padding 5 × 2, 8 pt gap:

- Grip glyph (6 dots, `--muted` 55 %): dragging from it reorders at once; holding anywhere else on the row reorders too (§5.2).
- Name 15/600, one line, ellipsis. Subline 12 `--muted` joining what exists: "optional" · note · "not in the Catalog" (free-text lines, `ingredientId === ''`). Optional lines render the name in `--muted` 500.
- **Quantity cell**: 36 pt, `--field-bg`, `--bw-field` border, radius `--r-ctl` − 2; number input 46 pt wide right-aligned 14/700 tabular (`inputmode="decimal"`, placeholder "–", blank allowed) + unit `<select>` styled as a 28 pt `--chip` tag (g · kg · ml · l · pcs). Invalid quantity: cell border `--urgent-fg` and the message under the row.
- **⌄ button** (32 pt, `aria-expanded`) opens the **detail strip** below the row (`--subtle` background bleeding to the card edges, padding 6 × 10 × 10 × 36): note input (36 pt, placeholder "Note, e.g. finely chopped"), **Optional** toggle (40 × 24 switch), then right-aligned Move up / Move down / Remove icon buttons (32 pt; Remove in `--urgent-fg`; first/last disable the arrows). Only one strip open at a time. Accessible names keep today's strings (`admin:recipe.lines.*`).
- Removing a line shows the toast "Removed {name}" with **Undo** (existing snackbar) instead of a confirm.

**Add row** at the bottom of the card (50 pt): search icon `--accent`, input "Add an ingredient" (`CatalogSearch` with a new `variant="row"` prop that drops the floating label and status line and renders results in a popover), × to clear. Results popover: card, `--shadow-float`, up to 5 Catalog matches (name 14.5/600, category 12 `--muted` right), and **always last** when the typed text is not an exact match: a tinted option "+ Add “{text}” by name · not in the Catalog" (`--accent-tint`/`--accent-on-tint`). This replaces the separate free-text field and "Add name" button. Enter picks the first option. After adding, the query clears and focus moves to the new row's quantity input.

Empty state inside the card: "No ingredients yet. Search the Catalog below, or type a name." (13.5 `--muted`). Under the card: hint "Leave the quantity blank for a line like “salt, to taste”." then a right-aligned ghost link "Steps ›".

## 5. Steps tab

One card with one block per step (padding 10 × 2 × 8, `--divider` separators):

- Number: 26 pt `--ink` circle with the step number (display 13/600) — the same glyph as the detail page.
- Text: auto-growing `<textarea rows=1>` 15/500 line-height 1.4, no border, placeholder "What to do in step {n}". Blank text after touch: message "Enter the Step text." under the block (today's `touchedSteps` rule).
- **Tool row** (6 pt gap, wraps): **Timer chip** — 28 pt pill, `--line` border; tap → becomes the "on" chip (`--accent-tint`/`--accent-on-tint`) with a 34 pt decimal input + "min" + × (default 5 when first added; blank/invalid → `admin:recipe.invalid.timer`). Then the tip affordance (§5.1). Right-aligned: Move up / Move down / Remove (28 pt icon buttons, Remove `--urgent-fg`).
- Removing a saved step that has tips keeps today's two-step confirm, rendered inline as a `--soon-bg` callout: "Removing step {n} deletes its {count} tip(s) when you save." with "Remove step and tips" / "Keep".
- **Add-step rows** before the first and after the last step, drawn like a step so the list reads as one column: a 26 pt circle in the number column with a 1.5 pt dashed `--accent` border and a 14 px "+" (`--accent`), then the label 14.5/700 `--accent`; row 48 pt, padding 9 × 2, radius `--r-ctl` − 2, `--subtle` on hover; on hover/focus the circle fills `--accent-tint` with a solid border. Labels: top "Add a step at the start" (inserts at index 0, so a forgotten first step is one tap away), bottom "Add a step" ("Add the first step" when the list is empty, and then only the bottom row is shown). Focus moves to the new step's textarea. `--divider` lines separate them from the steps.

### 5.2 Reorder by drag (ingredients and steps)

Same gesture on both lists; the strip's Move up / Move down buttons stay as the no-gesture path.

- **Start**: press and hold a row for **500 ms** without moving more than 8 pt (same hold time as the row-gestures handoff so the two feel like one family), or drag from the grip with no hold. The press must not start on an input, select, textarea or button: those keep their own behaviour (text selection, chips). While holding, the row's background eases to `--accent-tint` over the 500 ms, so the hold is visible before it fires; moving, or the scroll view taking the pointer, cancels it and the tint fades. An open detail strip closes when a hold starts.
- **Lift** (hold complete, or grip grabbed): haptic 18 ms; the row gets `--card-bg`, `--shadow-float`, radius `--r-ctl` − 2, scale 1.02, 8 pt extra side padding, z-index above its siblings, cursor grabbing; the grip turns `--accent`. Pointer capture on the row; `touch-action: pan-y` on the card plus `preventDefault` on `touchmove` while lifted, so the page does not scroll (auto-scroll near the card edges is not prototyped; add if the list can exceed the screen).
- **Move**: the row follows the finger vertically (`translateY`). When its midpoint passes the midpoint of the next or previous row, the two swap: the passed row slides into its new place over 200 ms `cubic-bezier(.2,.8,.2,1)` (FLIP), haptic 8 ms. Rows have different heights (notes, tips, warnings), so the swap test uses midpoints and the dragged row's offset is corrected by the passed row's height.
- **Drop**: release → the row settles into the gap (transform cleared, 200 ms), the draft order is updated (`moved`-style, keys unchanged) and the numbers / disabled arrows re-render. Dropping outside the list or `pointercancel` = drop in the current slot.
- Reduce-motion: no slide animation on the passed rows; the lift keeps its shadow so the state is still visible.
- Accessibility: the gesture has no keyboard equivalent, which is why the arrows stay. Rows are `group`s with the description "Hold to move"; `contextmenu` is prevented on rows (`-webkit-touch-callout: none`).

### 5.1 Tips

- **New Recipe**: no tip affordance; hint under the card "Add tips to steps after saving the Recipe." (existing `newRecipeHint`).
- **Make a Variant**: copied step tips show as a count "💡 {n} tip(s)" in the tool row (they are sent with the document on create, as today); hint "Copied tips stay with their steps; add your own after saving the Variant."
- **Edit Recipe**: a **Tip chip** in every step's tool row adds a tip; each tip is a dashed `--subtle` row under the tool row (bulb icon, 13 px input, × to delete). Tips write immediately through `useFamilyTipWrites` (add on blur of a non-empty new tip, update on blur when changed, remove on ×, with "Tip deleted" + Undo toast); they are keyed by step id so they survive reordering as today. Hint: "Tips save as soon as you change them; the rest saves with the Recipe."
- Recipe-level tips and, on a Variant, the "Tips from the Base Recipe" show/hide toggles are **not in the prototype**: render them as a second card under the steps card titled "Recipe tips" using the same tip rows, and the inherited list as checkbox rows, both Edit-only. Same immediate writes as today.

## 6. Entry points and saving

| Route | Initial draft | Save → |
|---|---|---|
| `/recipes/new` | `emptyDraft()` (servings 4) | `useCreateFamilyRecipe` with `parentId: null`, guidance from the Details tab → navigate to `/recipes/{id}` |
| `/recipes/:id/variant/new` | `draftOfVariantDraft(useVariantDraft)` with copied tips and named guidance | create with `parentId` → `/recipes/{id}` |
| `/recipes/:id/edit` | `draftOfEdit(useFamilyRecipeEdit)` | `useUpdateFamilyRecipe` for the document **and** `useSetFamilyGuidance` for guidance in the same Save (today guidance has its own button; fold it in so there is one Save). On success: toast "Recipe saved." and stay on the page with the draft reseeded (today's `saves` key bump). Back returns to the detail page. |

Save is always in the header; Cancel is the Back button (no separate Cancel button). Leaving with unsaved changes: not prototyped; keep today's behaviour (no prompt) unless cheap to add.

Loading / error / archived states on Variant and Edit are unchanged (`Spinner`, `Alert`, "This Recipe cannot be edited.").

## 7. Accessibility and edge cases

- Tabs: `role="tablist"`, arrow keys, `aria-selected`; count badges are part of the tab's accessible name ("Ingredients, 6").
- Every icon button has today's specific label (`Move {name} up`, `Remove Step {n}`, …). The detail-strip ⌄ is `aria-expanded` with label "More for {name}".
- The Level cell is a button with its value in the label; Cuisine/Method stay native selects (keyboard and screen-reader friendly; the chevron is decorative).
- The results popover is a `listbox` with `aria-activedescendant` as in `CatalogSearch` today; Escape closes it.
- Reduce-motion: no chevron rotation or chip transitions.
- Long titles: one line in the header (ellipsis), full text in the title field.
- Keyboard on phones: because each section is its own tab, the sticky tabs stay visible and the keyboard never covers another section's fields.

## 8. Strings to add (`recipes.json`, `family.*` unless noted)

`tabs.details` "Details", `tabs.ingredients` "Ingredients", `tabs.steps` "Steps", `save` reuse, `saveShort` "Save", `newHint` (reuse `newRecipeHint`), `variantHint` "Copied from {{base}} ({{owner}}). Nothing is saved until you save it.", `editHint` "Your family's Recipe. Tips save as you change them.", `titlePlaceholder` "Recipe title", `facts.serves` / `facts.prep` / `facts.cook` / `facts.level` (reuse detail page keys), `levelCycle` "Level: {{value}}. Tap to change", `addIngredient` "Add an ingredient", `addByName` "Add “{{name}}” by name", `notInCatalog` (reuse `freeTextNote`), `linesEmpty` "No ingredients yet. Search the Catalog below, or type a name.", `noteplaceholder` "Note, e.g. finely chopped", `optional` "Optional", `removedLine` "Removed {{name}}", `timer` "Timer", `tip` "Tip", `tipCount_one/other` "{{count}} tip(s)", `tipPlaceholder` "A tip for this step", `tipDeleted` "Tip deleted", `addStep` "Add a step", `addStepStart` "Add a step at the start", `addFirstStep` "Add the first step", `holdToMove` "Hold to move", `stepPlaceholder` "What to do in step {{number}}", `guidance.title` "Pairings, nutrition & moments", `guidance.optional` "Optional", `guidance.setCount` "{{count}} set · optional", `guidance.goodFor` "Good for", `guidance.momentHint` "Tap once for Good for, twice for Avoid.", `next.ingredients` "Ingredients", `next.steps` "Steps", `recipeTips` "Recipe tips". Drop `freeTextLabel`, `freeTextAdd`, `viewRecipe` once the page ships. Danish and Romanian follow.

## 9. Open questions for the implementer to flag

- Drag-to-reorder: auto-scroll while dragging near the top/bottom of the screen is not prototyped; needed once a recipe has more steps than fit.
- Should the hold also lift when it starts on the quantity cell or the step text (today's rule excludes inputs so typing and text selection keep working)?
- The Eating Moment "reason" field and the pairing editor fields are reused from today's `GuidanceFields`, not redrawn; style them like the note input.
- Whether Edit should warn before Back with unsaved document changes (tips are already saved, the rest is not).
- `CatalogSearch` gets a `variant="row"` presentation; the Pantry add flow keeps the current one.
