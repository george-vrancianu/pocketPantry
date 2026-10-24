# Add Recipe — v2 amendments to the 13 Oct handoff

Status: design update, 2026-10-24. Applies on top of `handoff.md` (Variant B, tabs). Everything there still holds unless changed below.
Reference prototype: `add-recipe-v2-prototype.html` (live: https://claude.ai/artifact/6imLKTpUWWVhckemQVYR1x). Entry switch above the editor: New Recipe · From a link · Plate Scan · Make a Variant · Edit Recipe. The second phone is the From a link step.

Checked against `main` @ `8c18169` (24 Oct). The tabbed editor itself is **not built yet**: `FamilyRecipeForm` is still the stacked `EditorForm`. What changed around it:

| Change in main | Tickets | Effect on the design |
|---|---|---|
| Recipes "+" is an `ActionMenu`: New Recipe, From a link | #511 | New entry point; editor opens from it filled in |
| `/recipes/from-link`: link or pasted text, language choice, Already in your Recipes, Link Cap | #511–#515 | New step screen, restyled (§4) |
| `NewRecipePage` takes route state: draft, `closestBases`, `hiddenByAllergiesCount`, `sourceLink`, `sourceLanguage` | #509, #516 | Base Recipe card on Details (§2) |
| `RemovableSourceLink` on New and Edit; Edit clears it on save with `sourceLink: null` | #511, #515, #517 | Source row on Details (§1) |
| Shared `CatalogSearch`: aisle icon rows, Browse by aisle, Use as typed, Add to your catalog, Family tag | #264, #266, #267, #270 | Replaces the "Add “x” by name" option (§3) |
| `ScreenHeader` ends with the Settings gear on every screen but Settings | #531 | Header: Back · title · Save · gear (§5) |

## 1. Source Link row (Details tab, first block)

Shown when the draft has a Source Link (New from a link; Edit of a Recipe that has one). One line, 13.5 px: link icon `--muted`, "From {host} ↗" (`--accent`, 700, opens in a new tab), then " · Translated from {language}" 12.5 `--muted` when `sourceLanguage` is set; right-aligned ghost "Remove link" (30 pt).
Remove → the row becomes a `role="status"` line "Link removed. It goes when you save." with **Undo** (new; today the removal has no undo). Focus moves to Undo, not the heading. Save sends `sourceLink: null` on Edit, or leaves it out on New, as today. The link can never be edited.

## 2. Base Recipe card (Details tab, under the title, only when the route state brought `closestBases` or a hidden count)

Card with heading "Base Recipe" 15/600 and subline "Pick the Catalog Recipe this one is a Variant of, or keep it standalone." (new string). Then:
- Hidden-by-Allergies note when `hiddenByAllergiesCount > 0`: warning icon, "{n} Recipe(s) hidden by your Allergies", ghost **Show** (existing `recipes:hiddenByAllergies.*`). Show reveals the extra rows; the current pick is kept (today's logic).
- Radio rows (46 pt, `--divider` between): 20 pt radio, title 14.5/600, the first one with a "closest match" pill (`--accent-tint`), and the `AllergenIndicator` as a pill (`--soon-*` for soft/others, `--urgent-*` for the Member's own). Then "Standalone Recipe (no base)" in `--muted` 500.
- Search row inside the card: search icon + "Find another Base Recipe" (maxlength 100). Matches append as rows; a picked one stays listed after the search clears (`another`).
- Under the card, 12.5 `--muted`: "Saves as a Variant of **{title}**." or "Saves as its own Base Recipe." (new strings). Save toast follows it.
Default pick, `onChange` effect and the Show re-ranking stay exactly as `BaseRecipePicker` does them; only the presentation changes. Move the copy from `review:plateRecipe.*` to `recipes:` keys or keep sharing it, implementer's call.

## 3. Ingredients: the shared search replaces "Add by name"

The add row keeps its place at the bottom of the card, but the popover now renders the shared `CatalogSearch` rows (no `variant="row"` needed beyond the inline field):
- Results: 38 pt icon tile in the aisle tint, name with match highlight (+ **Family** pill for family ingredients), "{Leaf} · {Aisle}" 13 `--muted`, unit chip (↵ hint when keyboard-active).
- No match: **"Add “x” to your catalog"** first (book-plus tile, `--accent-tint`; opens the existing Add to your catalog popover/sheet; on "Add & pick" the line is added with the Family tag), and **"Use “x” as typed"** last (dashed rule, plus tile; adds a free-text line). "Use as typed" also ends a list whose results don't include the exact name.
- Focused and empty: **Browse by aisle** tiles (`BrowseByAisle` as passed today); an aisle lists its ingredients with a "‹ Aisles" back link.
- Free-text lines keep the subline "Not in the Catalog". Family lines show the Family pill after the name.
- **Proposal (not in main):** a free-text line's ⌄ strip gets "Add “{name}” to your catalog", opening the same sheet prefilled; on add, the line becomes that Family ingredient. Drafts read from links and Plate Scans produce several free-text lines, and this is the only way to match them without deleting and re-adding.

## 4. From a link step (`/recipes/from-link`)

Same logic and copy as `RecipeFromLinkPage`; restyled with the editor's parts: header Back · "From a link" · gear; hint 14 `--muted`; 44 pt field with caps label ("Link to the recipe" / "Recipe text", 150 pt textarea); ghost "Paste text instead" / "Use a link instead"; "Language of the recipe" as a bordered two-row radio group ("In {catalog language}" / "Keep the page’s language" or "Keep the text’s language"); full-width primary "Read the recipe". Reading: spinner + "Reading the recipe…" status and a secondary Cancel (focus moves to it). Errors as an `--urgent-*` alert above the field, with ghost "Paste the recipe text instead" for unreadable/no-recipe links. Duplicate: a card "Already in your Recipes" with Open (primary) and Read again (secondary), heading focused.
On success the editor opens on **Details** so the Source row and Base Recipe card are seen first. Title hint for supplied drafts: "Read from the page. Check it before you save." / "Read from your Plate Scan. Check it before you save." (new strings). The guidance disclosure's subline on a link draft reads "Optional · never read from the page" (ADR 0024).

## 5. Header

Back (40 pt) · title (24 display, ellipsis) · **Save** pill · **Settings gear** (40 pt, rightmost per #531). At 390 pt "Make a Variant" still fits; longer locales ellipsize the title, never the buttons.

## 6. Validation note

Servings is required by `problemsOf` (supplied drafts may have `servings: null`). The Details tab badge shows "!" for a blank title *or* blank Serves, and an "Enter how many it serves." line sits under the facts strip. Plate Scan drafts arrive this way, so the first thing the Member sees is what is missing.

## Open questions (new)

- The gear on an editor leaves the page and drops the draft with no prompt. Hide the gear on the three editor routes, or add the unsaved-changes prompt that was already an open question?
- Base Recipe card on Details vs. its own step before the form: kept on Details so the whole draft is one screen set; revisit if testers miss it.
- Should a Variant made from Make a Variant also show the Base as a read-only row in the same place, so the two entries look alike?
- The "Add to your catalog" proposal in §3 needs a small API check: today a line's `ingredientId` is set only from the search pick.
