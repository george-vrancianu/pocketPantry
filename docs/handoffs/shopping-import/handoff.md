# Shopping: Add items / Import split — design handoff

> Superseded in part by ADR 0027: the Import pill now sits in the summary card and the `+` (Add items) in the header.

Status: approved design (variant B), ready for implementation. Date: 2026-10-14. Amended 2026-10-15 after a grilling session (§12); where this file and the prototype disagree, this file wins.

Domain language: in `GLOSSARY.md` terms, the Import sheet **applies** Shopping Templates. "Import" is only the UI label (like "Move N to Pantry" for Finish Shopping). Name code after the domain (`applyTemplates`, …).
Reference prototype: `prototype.html` (self-contained, open in a browser; also live at https://claude.ai/artifact/Arbzh3njqLAuuVsddeF7w8). It opens on **Variant B "Import in header"**, the approved design. A and C are kept for context only. The prototype is the source of truth for look, spacing and interaction.

This **amends `docs/shopping/handoff.md`** (variant C, 2026-10-13). Everything there stays unless this file says otherwise. Main changes: the Add sheet loses its tabs; templates move to a new Import sheet opened from the header; Save as template gets its own small sheet.

Tokens: the app theme tokens from `docs/themes/themes.ts` (`--primary`, `--card-bg`, `--r-card`, `--r-ctl`, `--r-fab`, `--shadow-card`, …). The prototype has a Warm / Minimal / Dark toggle. Aisle tile colours follow the shopping handoff with dark-theme pairs added (§7).

Code touched: `apps/web/src/pages/Shopping/*` (`ShoppingPage.tsx`, the Add sheet, `templates/*`), `apps/web/src/i18n/locales/{en,da,ro}/{shopping,templates}.json`. No API change required.

Template-line logic (default selection, tags, request body, repeat counting) lives in **one shared module** used by both the Import sheet and `ApplyTemplatePicker` on the template editor, which keeps its single-template Apply.

---

## 1. Summary of the change

| Before (shopping handoff C) | After |
|---|---|
| "+" in the summary card opens one sheet with **Ingredients / Templates** tabs | "+" opens **Add items**: ingredient search only, no tabs |
| Template chips under the staples ("Or start from a template") | Removed |
| Templates tab: Save this list + Add from a template (one template at a time) | **Import** sheet, opened from a header button: pick one or several templates, whole or line by line, import in one go |
| Save view inside the Templates tab | **Save as template** short sheet, opened from the dashed row at the end of the list |
| Header has no trailing action | Header has an **"Import"** pill |

## 2. Shopping screen

| Region | Notes |
|---|---|
| Header | `AppScreenHeader` "Shopping" + trailing **Import pill** (§2.1). |
| Summary card | Unchanged: count, progress bar, 52 pt "+" (`--primary`, radius `--r-fab`, `--shadow-btn`), "Move N to Pantry" row when something is ticked. |
| List | Unchanged. |
| Save row | Unchanged look (dashed `--line-strong`, butter tile, "Save this list as a template" / "Reuse these {n} items next time"). Now opens the Save sheet (§5). Shown only when the list has items. |
| Empty list | Replaced, see §2.2. |

### 2.1 Import pill

40 pt tall, radius 999, `--surface` fill, 1 pt `--line` border, padding 0 14 / 0 11, gap 7. Import icon (tray with down arrow, 18 px, `--accent`) + "Import" 14/700 `--ink`. Opens the Import sheet (§4). Always visible, also on an empty list.

### 2.2 Empty list

The summary card reads "Nothing to buy" / "Your list is empty" (no progress bar) and keeps its "+". Under it:

- Centred heading "Start your list" (display 19) + "Search for what you need, or start from one of your templates." (13 `--muted`). (A Shopping Template is not a list, so the copy avoids calling it one.)
- Two full-width tiles, 12 pt apart (card style: `--card-bg`, `--card-line`, `--r-card`, `--shadow-card`, padding 14 × 16, 14 pt gap, chevron right):
  - **Add items**: 42 pt tile `--accent-tint` / search icon `--accent-on-tint`; meta "Search ingredients, staples you're out of". Opens Add items.
  - **Import a template**: 42 pt tile `--butter` / import icon `--butter-ink`; meta "{n} templates". Opens Import. Hide this tile when the Family has no templates.

## 3. Add items sheet

Same sheet as the shopping handoff §4, with these changes:

- Title **"Add items"** (was "Add to list"). Done button with the added count stays.
- **No tab control.** The search field is the first thing in the body, focused after the slide-in.
- Empty search shows **Missing staples** and **Recently used up** only. The "Or start from a template" block is removed.
- Results, amount field, free-text row, toasts: unchanged.

## 4. Import sheet

Bottom sheet, 90 % height, `--bg`, radius 28 top. Header: grab handle, title **"Import"** (display 22), **"Close"** pill on the right (`--ink` fill, `--bg` text, 36 pt). Escape / scrim tap closes without importing. Closing resets the sheet: the next open starts with nothing included and every row collapsed.

Body (padding 4 / 20 / 24, 18 pt gaps):

1. Hint, 13 `--muted`: "Tick whole templates, or open one to choose lines. You can mix several."
2. Section label **"Your templates · {n}"** with **"Manage"** link → `/shopping/templates`.
3. One card, one **template row** per template (`useTemplates`, Family order).

No templates: the card shows "No templates yet. Save your list as one from the end of the list." (13.5 `--muted`, padding 16), footer button disabled.

### 4.1 Template row

Two hit areas in one row, `--divider` between rows:

- **Tick** (left, padding 12 / 4 / 12 / 14): 24 pt box, radius `--r-box`, 2 pt `--box` border. `role="checkbox"`, accessible name "Import {name}".
  - Not included: empty box, `aria-checked="false"`.
  - Included, all lines ticked: `--accent` fill, check icon `--accent-ink`, `aria-checked="true"`.
  - Included, some lines unticked: `--accent-tint` fill, `--accent` border, minus icon `--accent`, `aria-checked="mixed"`.
  - Tapping an unticked box includes the template with its **default selection** (lines in the Pantry or in the trolley unticked, everything else ticked; see §4.2). Tapping a ticked or mixed box removes the whole template from the import (a hand-picked selection is not remembered).
- **Open** (rest of the row, padding 10 / 8 / 10 / 6, 12 pt gap): 36 pt butter tile with the template icon, name 15/600, line 12.5 `--muted` ellipsis, chevron 18 px that rotates 90° when open. `aria-expanded`.
  - Line text: not included → "{lineCount} items · first 3 names"; included → "{ticked} of {lineCount} selected".

### 4.2 Expanded lines

Shown under the row on `--subtle`, top border `--divider`, in template order (not regrouped by aisle, so the row stays compact). Several templates can be open at once.

Line row = the apply-view line from the shopping handoff §5.2 (checkbox button, min 50 pt, name 15/600, amount 13 `--muted`), left padding 28 so it reads as nested. Tags on the right:

- **"In Pantry"** (`--ok-fg` on `--ok-bg`) when `inPantry` (the Ingredient has at least one unexpired Batch; quantity is ignored, Unmatched lines never are).
- else **"In trolley"** (`--ok-fg` on `--ok-bg`) when a **checked** Shopping Item has the same Ingredient (same normalised name for Unmatched lines). The merge rule unchecks an item it adds to, so importing this line would take it out of the trolley; that's why it starts unticked.
- else **"On list · adds up"** (`--soon-fg` on `--soon-bg`) when an unchecked list item has the same Ingredient (same name for Unmatched lines). Replaces "On list" so it's clear nothing is duplicated.

Behaviour:
- **Default selection**: In Pantry and In trolley lines unticked, everything else ticked.
- While the template is not included, all its lines show unticked. Ticking any line **includes the template** with its default selection; if the tapped line is one that defaults to unticked, it is ticked too.
- Unticking the last ticked line removes the template from the import.

### 4.3 Footer

Sticky, padding 12 / 20 / 20, `--line` top border, 8 pt gap.

- Meta line (12.5 `--muted`, centred, single-line ellipsis), shown when at least one template is included: "From {name}, {name}" and, when the same item is ticked in more than one template, " · {k} repeat(s) combined".
- Primary 48 pt, radius `--r-ctl`, `--primary`, import icon: **"Import {n} item(s)"**, where n counts distinct Ingredients (or Unmatched names, normalised) across all included templates, **ignoring units** (200 g and 1 kg of flour count as one). With nothing selected: disabled, label **"Pick a template"**. While pending: "Importing".
- **Cap**: bulk-add takes at most 100 items. When the ticked lines (after combining same Ingredient + same unit) exceed 100, the button is disabled and the meta line reads "Up to 100 items at a time". No chunking, so the import stays all or none.

### 4.4 Import

- Collect the ticked lines of every included template and send them **as they are** in one call to the existing **bulk-add** endpoint (`POST /shopping-list/items/bulk`, all or none). The server merges repeats inside the request and with the list using the usual rule (same Ingredient or normalised Unmatched name, same unit → quantities add up; different unit → separate item). Client-side combining is only for the footer count and the cap.
- Success: **close the sheet**, toast "Imported {n} items from {template}" or "… from {k} templates". **No Undo in v1**: the bulk response doesn't say what was created vs merged, so Undo needs an API change. It is a follow-up.
- Error: `Alert` at the top of the sheet body; the sheet stays open with the selection intact.

### 4.5 Data

Collapsed rows use `TemplateSummary.previewNames` (already up to 4 names), so they need no detail fetch. The sheet needs each template's lines and `inPantry` flags, which `TemplateSummary` doesn't have. Fetch the template detail (the same data `ApplyTemplatePicker` uses) **when a row is expanded or ticked**, and show the row's tick as a small spinner until it arrives. Prefetching all details on open is fine while the Family has a few templates (max 50).

## 5. Save as template sheet

Short sheet (height fits content, max 90 %). Title "Save as template", **"Cancel"** pill on the right. Body: the save view from the shopping handoff §5.3 (name field focused, quick-name chips optional, "Saves all {n} items, ticked ones too" preview). Footer: "Save template" primary.

On success: **close the sheet**, toast "Saved “{name}”" with **Edit** → `/shopping/templates/{id}`. (Was: stay in the sheet and go back to the Templates list.)

## 6. Toasts

As in the shopping handoff §7, using `--toast-bg` / `--toast-ink` / `--toast-action`, 3 s. New: "Imported {n} items from {template}", "Imported {n} items from {k} templates" (no Undo, §4.4). If Undo is added later, that toast lasts 5 s to match the Undo window.

## 7. Aisle tile colours in Dark

Light pairs are unchanged from the shopping handoff §4.3. Dark (bg / text): Produce `#1F3A2A`/`#9FE0B4`, Bakery `#3A3118`/`#F2CF72`, Dairy & eggs `#1D2C38`/`#9CC3E3`, Meat & fish `#3F241B`/`#FFA27E`, Pantry `#26312A`/`#B9C7BC`, Frozen `#232842`/`#AEB9EA`, Drinks `#33243A`/`#D7B3DF`.

## 8. API

None. (The optional `TemplateSummary` names already exist as `previewNames`.)

## 9. Strings

New keys (en shown; add da and ro):

`shopping.json`
- `addSheet.title` "Add items" (replaces `sheet.title` "Add to list")
- `import.button` "Import", `import.title` "Import", `import.close` "Close"
- `import.hint` "Tick whole templates, or open one to choose lines. You can mix several."
- `import.section` "Your templates · {{count}}", `import.manage` "Manage"
- `import.tickLabel` "Import {{name}}"
- `import.selected` "{{ticked}} of {{total}} selected"
- `import.onListAddsUp` "On list · adds up", `import.inTrolley` "In trolley" (da "I kurven", ro "În coș")
- `import.tooMany` "Up to 100 items at a time"
- `import.from` "From {{names}}", `import.repeats_one/other` "{{count}} repeat(s) combined"
- `import.confirm_one/other` "Import {{count}} item(s)", `import.pending` "Importing", `import.pickOne` "Pick a template"
- `import.done` "Imported {{count}} items from {{name}}", `import.doneMany` "Imported {{count}} items from {{templates}} templates"
- `import.none` "No templates yet. Save your list as one from the end of the list."
- `empty.title` "Start your list", `empty.hint` "Search for what you need, or start from one of your templates."
- `empty.addTitle` "Add items", `empty.addMeta` "Search ingredients, staples you're out of"
- `empty.importTitle` "Import a template", `empty.importMeta_one/other` "{{count}} template(s)"
- `save.cancel` "Cancel"

Remove: `sheet.tabs.ingredients`, `sheet.tabs.templates`, `templatesFromSearch`, `seeAll`.

## 10. Accessibility

- Import pill and Add "+" have accessible names "Import from a template" / "Add items".
- Template row: the tick is a `role="checkbox"` with tri-state `aria-checked`; the open button has `aria-expanded` and `aria-controls` pointing at the lines list.
- After import, focus returns to the Import pill; announce the toast (polite).

## 11. Resolved questions

- Does bulk-add accept two lines for the same Ingredient? **Yes**: it merges them in the request, inside one transaction. Client-side combining is only for the footer (§4.3).
- Undo after import in v1? **No**, follow-up (§4.4).
- Past trips as a second source (variant C) stays parked until archived lists can be read.

## 12. Decisions from the 2026-10-15 grilling

| # | Decision |
|---|---|
| 1 | Domain verb stays **apply**; "Import" is the UI label (glossary updated). |
| 2 | Toasts stay 3 s; any future Undo toast is 5 s (Undo window). |
| 3 | Tapping a mixed tick removes the whole template. |
| 4 | Closing the sheet resets selection and expanded rows; an error keeps them. |
| 5 | Empty-state copy says "template", not "list". |
| 6 | No client-side combining in the request; the server merges. Footer count ignores units. |
| 7 | Lines matching a checked Shopping Item get "In trolley" and default to unticked. |
| 8 | No Undo in v1. |
| 9 | Over 100 items: footer disabled with "Up to 100 items at a time"; no chunking. |
| 10 | Template editor keeps its Apply; line logic is shared with the Import sheet. |
