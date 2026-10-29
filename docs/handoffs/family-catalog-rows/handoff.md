# Family catalog as list rows — design handoff

Status: decided (grilled 2026-10-29). Checked against `main` @ `4716cf0`.
Reference prototype: `prototype.html` (self-contained; live at https://claude.ai/artifact/Jk9Zj7GKYECsnKn7uVEvtB). Theme switch and an Empty catalog toggle at the top; the event log in the right panel shows which API calls a Save or delete would make. The prototype is the source of truth for look and spacing, **except where this document differs** (marked **Decided** below): the prototype still groups by Aisle, shows Synonyms of Family Ingredients as rows, removes name chips at once and says "hold to edit".

Depends on: `row-gestures/` (SwipeRow, three zones, hold to edit, ADR 0009 deferred delete + Undo), `settings/` (Family tab, section label + scope caption), `ingredient-icons/` (Default Icon + Aisle tint), `catalog-search/` (Family Ingredients, Family Synonyms), ADR 0011 (Family catalog) and ADR 0014 (allergen tags).

Built in two steps:

1. **Shared category picker** (refactor, no visible change to Default Expiry): pull `PickList` out of `DefaultExpirySheet.tsx` (§6).
2. **Section rewrite** on top of it (§§2–5, 7–9).

Code touched: `apps/web/src/pages/Settings/components/FamilyCatalogSection.tsx` (rewritten as rows), new `pages/Settings/components/FamilyIngredientSheet.tsx` and `FamilySynonymSheet.tsx`, the extracted picker (§6), `lib/useRowHint.ts` (`RowList` gains `'familyCatalog'`), `i18n/locales/{en,ro,da}/settings.json`, tests `FamilyCatalogSection.test.tsx` and `FamilyCatalogAllergens.test.tsx`. **No API change.** Use the existing `useCreateFamilySynonym` (`lib/catalog.ts`), which already refreshes the family catalog.

---

## 1. Summary

Today the section is a stack of text blocks with three ghost buttons per ingredient (Edit, Allergens, Delete), inline forms, and an "Other names" list of `X → Y` lines with Delete buttons.

It becomes the same kind of list as Pantry, Shopping and Staples:

- Family Ingredients in **one card list sorted by name**, one `SwipeRow` + `ListRow` each, no buttons on the row.
- **Swipe left to delete** (ignore · ask · delete), **tap or hold to edit**, keyboard Enter / Delete, first-use peek + hint pill.
- **One edit sheet** per ingredient: name, category, allergens, other names, usage note, Save / Cancel, "Delete from family catalog" link. Nothing is sent until Save. It replaces the inline editor, the inline allergen tagger and `ConfirmAction`.
- Family Synonyms of a Family Ingredient live **only in that ingredient's sheet**. Family Synonyms of a **shared Catalog** Ingredient (which has no sheet) get their own "Other names" card of rows with the same gestures and a small read-only sheet.

## 2. Section layout

Order inside the section (FamilyTab position unchanged, last):

| Part | Spec |
|---|---|
| Label | `SectionHeading` "Family catalog" + scope caption `users` "Whole family" (as Settings §2). |
| Help | 12.5 `--muted`: "What your family added to the catalog. Anyone in the family can fix it." |
| Hint pill | `RowHintNote` with `useRowHint('familyCatalog', rows > 0)`; text `familyCatalog.hint` "Swipe left to delete · tap to edit" (**Decided**: tap is the gesture to teach; hold still works). First Family Ingredient row peeks. |
| Allergen check line | Only when `uncheckedCount > 0`. Full width, `--soon-bg` / `--soon-fg`, radius `--r-ctl`, padding 10 12, alert icon 18, 13/600: "{n} ingredient(s) is/are not checked for allergens. Tap one to tag it." `role="status"`. Replaces `uncheckedSummary`. |
| Ingredients | **Decided: one `Card variant="list"` `<ul>`, sorted by name** (the order the API returns), no Aisle groups. A Family has few entries, and the payload has no Aisle sort order. Wrapped in `data-row-scope`. Hidden when there are no Family Ingredients. |
| Other names | Only the Family Synonyms whose target is **not** a Family Ingredient (target id not in `data.ingredients`). Group label "Other names · {count}", then a 12.5 `--muted` line "Names your family uses for an ingredient, in search, scans and receipts.", then a card of rows (§4), in its own `data-row-scope`. Hidden when there are none. |
| Empty | Only when there are no ingredients **and** no synonyms (as today). Card, centred, padding 22 18: "Nothing added yet" 15/700 `--ink`, then 13.5 `--muted` "When a search finds nothing, “Add to your catalog” puts the name here for the whole family." |
| Loading / error | `Spinner` and `Alert` as today, above the lists. |

## 3. Family Ingredient row

`SwipeRow` → `ListRow`:

| Slot | Content |
|---|---|
| leading | `IngredientIconSlot ingredientId={id} aisleId={parentCategory.aisle.id}` (Family Ingredients are not in the icon map, so this is the Default Icon in the Aisle tint). |
| title | `name` |
| meta | **Decided:** "{leaf} · {aisle} · {unit}" (`familyCatalog.rowMeta`), since there are no Aisle groups. |
| tags | One tag at most. **Unchecked** (`allergensChecked` false) → `--soon-bg` / `--soon-fg` pill with a 12 px alert icon, "Check allergens". **Contains** → `--chip` / `--ink` pill: first allergen name, plus " +{n}" for the rest (`title` / accessible text lists all: "Contains Milk, Soy"). **None** (checked, no allergens) → no tag (**Decided**: the amber tag is the signal). Pill 11/700, radius 999, padding 3 8. |

Gestures (all from `SwipeRow`, no new code there):

- **Decided:** `onTap` (tap, Space) and `onEdit` (hold, Enter, hidden Edit action) both open the sheet.
- `onRemove` → `useDeferredRemoval(familyCatalogQueryKey, deleteIngredient.mutateAsync)`; filter `hiddenIds` out of the list; toast via `remove(id, name, t('familyCatalog.deleted', { name }))` "Deleted {name}" with Undo for 5 s (**Decided**: "Deleted", not "Removed": this deletes the Ingredient for the whole Family).
- Labels: build them in the section rather than with `useSwipeRowLabels`, because the second line is per row:
  - `question` "Delete {name}?" (`familyCatalog.deleteQuestion`)
  - `context`: **Decided:** a total of the five usage counts (`batches + shoppingItems + templateLines + recipeLines + staples`): "Used in {n} place(s)" (`familyCatalog.usageTotal_one/_other`), or "Nothing uses it" when it is 0. The breakdown is in the sheet (§5.5).
  - `remove` "Delete", `keep` / `releaseToDelete` / `hint` / `editAction` / `removeAction` from `common:row.*`.
- Deleting still makes everything that used it Unmatched under its name and deletes its Staples and Synonyms (server behaviour unchanged). Its Synonyms are never rows (§2), so nothing else hides with it.

## 4. Other name (Family Synonym) row

Only Synonyms of shared Catalog Ingredients (§2).

| Slot | Content |
|---|---|
| leading | `IngredientIconSlot ingredientId={synonym.ingredient.id}` with no `aisleId` (the payload has none: neutral tint). |
| title | `name` |
| meta | "Another name for {ingredient}" |

- Swipe: `question` "Remove “{name}”?", `context` "It stops meaning {ingredient}", `remove` "Remove". Deferred delete via a second `useDeferredRemoval(familyCatalogQueryKey, deleteSynonym.mutateAsync)`, toast "Removed “{name}”" + Undo.
- Tap / hold / Enter → **Synonym sheet** (read-only): title "“{name}”", context "Another name for {ingredient}"; a tinted row with the target's icon, name and "In the Catalog"; an info box "Your family sees {name} in search, scans and receipts, and it means {ingredient}. To point it somewhere else, remove it and add it again from search."; primary **Done**; link "Remove this name" (closes, then `askToRemove()` on the row).

## 5. Ingredient edit sheet

`Sheet size="content"`, header like `AmountSheet` (title 20/700 = name, context 13 `--muted` "In your family’s catalog"), close × top right. Body padding 6 24 24, 16 pt between fields. Field labels 13/700 `--ink`, hints 12.5 `--muted`.

**Decided: the sheet is a draft.** Every field, the other names included, is local state until **Save**. Cancel, ×, Escape and the Delete link throw the draft away without asking.

1. **Name** — `TextField`, maxLength 100, starts with the name, trimmed. Errors under the field in `--urgent-fg` 12.5/600: empty → "Give it a name."; `catalog.family_ingredient_exists` → "“{{name}}” is already in the catalog. Pick another name." with `name` = `params.existing.name` (`params.existing` is the whole clashing Ingredient). Focus returns to the field.
2. **Category** — a button styled as a field (min height 52, field background and border): leading Default Icon in the Aisle tint, leaf name 15/600, "{aisle} · {unit}" 13 `--muted`, trailing "Change ›" in `--accent` 13.5/700. Shows the current leaf before the options load. Opens a **picker step inside the same sheet**: back chevron, title "Pick a category", context "For {name}. It sets the Aisle and where its batches go." (**Decided**: a leaf change moves existing Batches too, server-side), the shared picker (§6) with leaves only, icons and the current leaf in `--accent` with a check. Picking returns to the form.
3. **Contains** — `AllergenContainsRow` as today (None + the Allergen chips, retired tags kept via `known`). Hint changes with state: "Not checked yet. Pick what it contains, or None." / "Saved as checked for allergens." **Decided:** a checked ingredient can't go back to Unchecked; the draft is never blank for it.
4. **Other names** — the Synonyms whose target is this ingredient, as chips (`--chip`, 34 pt, × button 28 pt "Remove the name {name}"). × takes the chip out of the draft (**Decided**: no immediate delete). Then a dashed "+ Add a name" chip that turns into a small field + "Add" (Enter adds a chip to the draft). **Decided:** a name that matches the family's own names (this ingredient's name or draft name, its other chips, another Family Ingredient's name or Synonym; case- and accent-insensitive, like the server's `normalizeName`) is refused under the field with `catalog:addToCatalog.aliasExists`. Shared Catalog names are allowed (the Family's choice wins). The server stays the authority at Save.
5. **Usage note** — `--subtle` box, info icon: "**Used by 3 Batches, 2 Shopping Items and 1 Staple.**" listing every non-zero kind of the five (`usage.*` plurals, as `USAGE_KINDS` today), then "Deleting keeps them as unmatched items under this name."; or "**Nothing uses it yet.**"
6. **Delete link** — `RemoveLink` "Delete from family catalog": closes the sheet (dropping the draft), then `askToRemove()` on the row (the same `onExited` pattern as `AmountSheet`).
7. **Actions** — Save (primary) + Cancel (ghost), **sticky at the bottom** of the sheet with a 1 px `--divider` top border, because the allergen chips push them below the fold on a phone. **Decided:** Save is disabled until the draft differs from the saved ingredient, and while the name is blank or a request is running.

**Save**, compared against the latest saved data, in this order, stopping at the first failure:

1. `PATCH /catalog/family-ingredients/:id` with only the changed fields (`name`, `leafCategoryId`). First, so a Synonym equal to the old name is allowed afterwards.
2. `PUT …/allergens` when the selection changed.
3. `DELETE` each removed Synonym. Before the adds, so removing and re-adding a name works.
4. `POST /catalog/family-synonyms {name, ingredientId}` (`useCreateFamilySynonym`) for each added name.

All succeed → close and toast `common:row.updated`. A failure keeps the sheet open with the draft as typed, an `Alert` naming what didn't save, and refetches the catalog, so the next Save sends only what still differs. The name 409 shows under the Name field (5.1); a Synonym 409 (`catalog.family_synonym_exists`) shows on that chip with `catalog:addToCatalog.aliasExists`. Unit is shown, not editable: the PATCH has no `defaultUnit` (out of scope).

## 6. Shared category picker (step 1)

`PickList` is private to `DefaultExpirySheet.tsx` and tied to Default Expiry (override days, catalog-day text; `groupCategories` always adds the "All {parent}" row). Extract the list into a shared component under `pages/Settings/components/` that both sheets use:

- Same data (`useCategoryOptions`) and search.
- Options: leaves only (no "All {parent}" rows); a leading Aisle-tinted Default Icon per row; the current leaf marked (`--accent` + check, `aria-current` or `aria-selected`); a per-row trailing slot that Default Expiry fills with its day text.
- Default Expiry looks and behaves exactly as before; its tests pass unchanged.

## 7. Accessibility

As `row-gestures/` §6 (handled by `SwipeRow`): each row is one tab stop, Enter edits, Space taps (opens the sheet here), Delete/Backspace asks, Escape keeps, hidden Edit / Remove actions. In the sheet, Escape on the picker step goes back to the form, Escape on the form closes. Focus returns to the row when the sheet closes, and to the neighbouring row after a delete; when the last row of a list goes, to the section heading (as today's `headingRef`). Ingredient and Other names rows block a second delete while one is pending, as today.

## 8. Strings

`settings.json` → `familyCatalog`: add `hint` "Swipe left to delete · tap to edit", `rowMeta` "{{category}} · {{aisle}} · {{unit}}", `checkTag` "Check allergens", `containsTag` "{{first}} +{{count}}", `containsA11y` "Contains {{names}}", `checkLine_one/_other` "{{count}} ingredient is not checked for allergens. Tap one to tag it." / "{{count}} ingredients are not checked…", `deleteQuestion` "Delete {{name}}?", `usageTotal_one/_other` "Used in {{count}} place" / "Used in {{count}} places", `unused` "Nothing uses it", `deleted` "Deleted {{name}}", `sheetContext` "In your family’s catalog", `categoryChange` "Change", `pickTitle` "Pick a category", `pickHint` "For {{name}}. It sets the Aisle and where its batches go.", `allergensHintUnchecked`, `allergensHintChecked`, `otherNamesHint` "Your family can also find it as these.", `addName` "Add a name", `addNamePlaceholder` "Another name", `removeName` "Remove the name {{name}}", `usageNote` / `usageNoteUnused`, `deleteLink` "Delete from family catalog", `nameRequired` "Give it a name.", `nameTaken` "“{{name}}” is already in the catalog. Pick another name.", `saveFailed` (names what didn't save), `emptyTitle`, `empty` (new text), `synonymsHint`, `synonymMeta` "Another name for {{ingredient}}", `synonymQuestion` "Remove “{{name}}”?", `synonymContext` "It stops meaning {{ingredient}}", `synonymRemoved`, `synonymInfo`, `synonymRemoveLink` "Remove this name", `inCatalog` "In the Catalog".
Remove once tests are updated: `edit`, `editLabel`, `tagAllergens`, `tagLabel`, `saveAllergens`, `delete`, `deleteLabel`, `deleteConfirm*`, `synonymRow`, `uncheckedSummary*`, `meta`.
All three locales (en, ro, da). No `common.json` change.

## 9. Tests

Rewrite `FamilyCatalogSection.test.tsx` / `FamilyCatalogAllergens.test.tsx` on the keyboard path:

- Focus a row → Enter → sheet; Space also opens it.
- Rename + Save sends PATCH with only `name`; category change sends `leafCategoryId`; allergen pick sends PUT; Save is disabled with no change and with a blank name.
- Taken name shows the error with `existing.name`, sheet stays open.
- Add a name and remove a chip send nothing until Save; Save sends PATCH → PUT → DELETE → POST in that order; Cancel sends nothing.
- A name clashing with the family's own names is refused on the device; a Synonym 409 at Save shows on its chip and the sheet stays open; a second Save resends only what failed.
- Delete key → confirmation shows the usage total → Delete → row gone, toast "Deleted {name}" with Undo, DELETE sent only after the toast closes (fake timers per CODING_STANDARDS); Undo sends nothing.
- Other names lists only Synonyms of shared Ingredients; Synonyms of a Family Ingredient show only as chips in its sheet.
- Synonym row Delete key → Remove → deferred DELETE.
- Empty card only with no ingredients and no synonyms.

## 10. Decisions (2026-10-29)

- Tap opens the sheet as well as hold; the hint teaches tap.
- One flat list sorted by name; Aisle in the row meta.
- Synonyms of Family Ingredients only in the sheet; the Other names card only for Synonyms of shared Ingredients.
- The sheet is a draft: one Save, one Cancel, ordered requests, stop at the first failure.
- Allergens never go back to Unchecked. None has no tag.
- "Deleted", not "Removed", for Family Ingredients.
- Swipe confirmation gives a usage total; the sheet gives the breakdown.
- Default unit stays read-only (needs `defaultUnit` on the PATCH and a rule for existing Batches; separate work).
- The category picker is extracted and shared with Default Expiry, as its own change first.
