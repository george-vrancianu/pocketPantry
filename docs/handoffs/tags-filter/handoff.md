# Recipe Tags filter (variant C) — design handoff

Status: chosen design (variant C), ready for implementation review. Date: 2026-10-28.
Issues: #706 (spec), #711 (Filter Recipes and Explore by Tags), #708 (Tags on rows). Post this handoff as the UI-prototype comment those tickets ask builders to check.
Source of truth: `prototype.html` in this package. It opens in a browser with no build step, but it loads React 18 and MUI 5 from public CDNs, so it needs a network connection. Live copy: https://claude.ai/artifact/6e8Jwcegdmz5wxU8KtWSSW (variants A and B were dropped and are no longer in it). The numbers below are copied from the prototype.

| File | What's in it |
|---|---|
| `handoff.md` | This spec |
| `prototype.html` | Recipes page with the Tags button, sheet and live list; scenario switch (no filter, 2 Tags, text + Tag, 4 Tags, no match) and theme switch (Warm / Minimal / Dark) |
| `TagFilter.reference.tsx` | The prototype's Autocomplete setup, ported to the MUI 9 API used by `@pocket-pantry/ui` (reference, not drop-in) |
| `icons-additions.ts` | The `tag` icon, in the `themes/` stroke style |

Theme: built on the theme tokens (`docs/themes/themes.ts`); every token name below works in all three themes. Builds on: the Recipes list v2 rows (`claude/recipes-list-v2-notes.md`), the family-first list (`docs/explore-recipes/`), and the sheet pattern from the Explore quick view.

No screenshots this time. The session that made this could not render the CDN-loaded page. Capture them from `prototype.html` if the ticket needs them.

---

## 1. Scope

**In this handoff:**

1. The **filter block** on `/recipes`: search field + **Tags** button, plus a row of selected Tag chips.
2. The **Tags sheet**: the shared Tag field (MUI Autocomplete) with its list always open, plus Clear and "Show n Recipes".
3. The **Matches** list while filtering, and the **no-match** state.
4. **Tags on rows**: up to 2 Tags + "+N" where Cuisine · Method used to be (#708 AC 7).

**Same component, not drawn here:**

- **Explore** (`/recipes/explore`) uses the same filter block and sheet. Its options are Catalog Tags used by at least one Catalog Recipe, so there is no "Your Tags" group (#711 AC 4).
- The **Recipe editor** (#709/#710) uses the same Tag field inline, with no sheet. It adds `Create "…"` and the 10-Tag cap. The filter version has **no create option**.

**Removed:** the Cuisine and Method chip rows, their divider and their **Clear** chip (#711 AC 1).

## 2. Filter block (sticky, top of `/recipes` under the header)

The block is sticky at top 0, `--bg` fill, padding 8 20 10, spanning the 20 pt gutter.

### 2.1 Row

The search field and the Tags button sit on one line with a gap of 8.

- **Search:** unchanged (48 pt, `--field-bg`, `--bw-field` `--line`, radius `--r-ctl`). It flexes to fill the row. Placeholder: "Search your family's Recipes".
- **Tags button:**
  - Size and shape: 48 pt tall, padding 0 14 0 12, radius `--r-ctl`, `--field-bg`, `--bw-field` solid `--line`.
  - Content: tag icon (18 px, `--accent`), "Tags" (14/700 `--ink`), gap 7.
  - **Active (≥ 1 Tag):** border `--accent`, fill `--accent-tint`, text `--accent-on-tint`, followed by a count badge. The badge is 20 pt, radius 999, padding 0 6, `--accent` / `--accent-ink`, 11.5/700, tabular numbers.
  - Accessible name: "Filter by Tags" or "Filter by Tags, {n} selected". It has `aria-haspopup="dialog"`.

### 2.2 Selected chips

This row shows only while ≥ 1 Tag is picked.

- **Layout:** one line, 8 pt under the row. It scrolls sideways (no scrollbar) and bleeds to the screen edges with 20 pt padding.
- **Order:** the order the Tags were picked.
- **Chip:** 30 pt tall, radius `--r-chip`, padding 0 9 0 11, gap 6, 12.5/700, with a 10 px × at 75 % opacity.
  - Catalog Tag: `--accent-tint` / `--accent-on-tint`.
  - Family Tag: `--butter` / `--butter-ink`.
- **Tap:** removes that Tag. Accessible name: "Remove Tag {name}".
- There is **no Clear chip**. Clearing everything happens in the sheet.

## 3. Tags sheet

- **Sheet and scrim:** scrim rgba(10,12,8,.38). The sheet is `--surface`, top radius 26, height 88 % of the screen, padding 8 20 0, `--shadow-float`.
- **Motion:** slides up 300 ms `cubic-bezier(.2,.8,.2,1)`. No motion under reduced motion.
- **Semantics:** `role="dialog"` with `aria-modal="true"`, labelled by the title. Escape (from the field), a scrim tap or the × close it.

Top to bottom:

1. **Grab handle:** 40 × 5, `--line-strong`.
2. **Head:** "Filter by Tags" (display 23) with a 40 pt ghost × on the right.
3. **Hint:** "Recipes must have **every** Tag you pick." (13.5 `--muted`, "every" in `--ink`). This states the AND rule.
4. **Tag field (§4):**
   - It sticks to the top of the scroll area.
   - It shows **all** picked Tags (`limitTags={-1}`), wrapping onto more lines here.
   - Placeholder when empty: "Type to find a Tag".
5. **Option list:**
   - Rendered in place, not in a popper. It is always open while the sheet is.
   - It scrolls with the sheet, and the group headers stick.
   - Option rows are 44 pt and run edge to edge (padding 0 20).
6. **Footer:**
   - Pinned to the bottom, `--surface`, 1 pt `--line` top border, padding 12 20 26 (plus the safe area).
   - Columns 1fr 2fr, gap 10, 48 pt buttons.
   - **Clear** (secondary): disabled when no Tags are picked.
   - **"Show {n} Recipes"** (primary): closes the sheet. With 0 results it reads "No Recipes match".

**Live apply:** each pick filters the list behind the sheet right away. Closing the sheet does not undo anything. The count in the primary button and in the status line (§7) update with each pick.

## 4. The Tag field (shared `TagField`, MUI Autocomplete)

The same component is used by the Recipes filter, the Explore filter and the editor. Put it in `packages/ui` (the web app must not import `@mui/*`). `TagFilter.reference.tsx` has the MUI 9 version.

### 4.1 Props used

| Prop | Value | Why |
|---|---|---|
| `multiple` | true | Several Tags |
| `options` | Tags in scope (§5), sorted by group, then within group | Required by `groupBy` |
| `groupBy` | `t => t.groupName` | Group headers |
| `getOptionLabel` / `isOptionEqualToValue` | name / id | |
| `getOptionDisabled` | not selected **and** count would be 0 | §4.3 |
| `limitTags` / `getLimitTagsText` | −1 in the sheet; 2 in the editor (one line at rest) | "+N" chip |
| `disableCloseOnSelect` | true | Pick several in a row |
| `autoHighlight` | true | Enter picks the first match |
| `forcePopupIcon` | false | No chevron |
| `open` | true (sheet only) | List always shown |
| `slots.popper` | in-place renderer (sheet only) | List inside the sheet, not floating |
| `onClose` | close the sheet on `reason === 'escape'` | |
| `noOptionsText` | "No Tag by that name on your Recipes" | |
| create option | **none** in filters; `Create "…"` only in the editor (#710) | #711 AC 1 |

Matching while typing ignores case and accents (MUI's default `createFilterOptions`). Keep it, so "romana" finds "Română" in ro.

### 4.2 Field

- **Input root:**
  - min-height 48, radius `--r-ctl`, `--field-bg`, `--bw-field` solid `--line`, padding 7 6 7 12, gap 5.
  - Focused: border `--accent` plus a 3 pt `--accent-tint` ring.
  - Leading tag icon: 18 px, `--accent`.
- **Chips:**
  - 28 pt, radius `--r-chip`, 12.5/700, label padding 0 4 0 10, max-width 132 (ellipsis).
  - Delete icon: 18 pt round, × 11 px, 70 % opacity.
  - Catalog: `--accent-tint` / `--accent-on-tint`. Family: `--butter` / `--butter-ink`.
- **"+N"** (editor at rest): 26 pt pill, `--subtle`, 1 pt `--line`, 12.5/700 `--accent-on-tint`. Accessible name: "and {n} more Tags".
- **Clear indicator (×):** always visible when there is a value (touch has no hover), 32 pt, `--muted`. Accessible name: "Clear Tags".

### 4.3 Options

- **Group header:**
  - Sticky, `--surface`, padding 12 16 4 (20 in the sheet), 11.5/700 caps, letter-spacing .07em, `--muted`.
  - **Your Tags** comes first. It has a people icon (13 px, `--butter-ink`; `--star` in Dark) and, on the right, "only your family sees these" (11.5/500, no caps).
  - The remaining groups follow in Admin order (Meal, Diet, Cuisine, Method, …).
- **Option row:** 44 pt, padding 0 16 (20 in the sheet), gap 12, 15/600 `--ink`.
  - **Check box:** 20 pt, radius 6, 1.5 pt `--line-strong`. Selected: `--accent` fill with a white check of 13 px (`--accent-ink`).
  - **Name**.
  - **Count** on the right (13/600 `--muted`, tabular): how many Recipes you'd see if you **added** this Tag (text search plus the current Tags plus this one). Selected rows show no count. Accessible name: "{n} Recipes".
  - Highlighted / hover: `--subtle`. A selected row has no fill (the box carries the state).
  - **Disabled:** a Tag that would leave 0 Recipes is shown at 42 % opacity and can't be picked. AND can never empty the list from the dropdown. Picked Tags stay enabled so they can be removed.

## 5. Which Tags are offered

- **Recipes:** Tags used by at least one of the family's visible Recipes (Bases and Variants). Family Tags go under **Your Tags**, followed by Catalog Tags by group. A Tag on no Recipe never shows (in the prototype, "Party" and "Indian").
- **Explore:** Catalog Tags used by at least one Catalog Recipe. No Family Tags.
- Catalog Tags show in the viewer's language. Family Tags show as written.
- Counts are client-side over the browse result in the prototype. In the app, either compute them from the loaded list or add `tagCounts` to the browse response (open question 2).

## 6. List while filtering

- **Matches:** any Tag or search text folds the groups (You can make this / Favorites / Your family's) into one **Matches** list.
  - Header: label 12/700 caps, with the count on the right.
  - Sorted A–Z. It **includes Variants** as their own rows, each matched on its own Tags, with the "Variant of …" line (#711 AC 3).
  - It uses `LIMIT = 4` plus "Show n more", as in list v2.
- **AND, with search:** a Recipe shows when its title matches the search **and** it has every picked Tag.
- **No match** (centred, padding 30 4 10):
  - Title (display 18): "No Recipes have all {n} Tags", or "…that Tag" for one. When there is text, it adds "and match “{q}”". With text only: "No Recipes match “{q}”".
  - "Try without one of them:" (14 `--muted`).
  - Relax buttons, which wrap and are centred: one per picked Tag, "Without {Tag} **{n}**", and "Without “{q}” **{n}**" when there is text.
    - Button: 36 pt, radius `--r-chip`, 1 pt `--line-strong`, `--card-bg`, 13/600.
    - The count is a 20 pt `--accent-tint` badge.
    - Tapping it removes that Tag or clears the text. A button whose count is 0 is disabled.
  - Reachable only through text search, or by removing a Tag in a way that makes another pick impossible; §4.3 stops it from the dropdown.

## 7. Tags on rows (#708 AC 7)

This replaces the "Cuisine · Method · Level" meta line on Recipe rows. Apply the same rule to Explore rows, Cook Tonight and the Dashboard widget.

- **Line:** one line, gap 5, 5 pt under the title (or under "Variant of …"). It shows **up to 2 Tag chips**, then **"+N"**, then "· {Level}".
- **Chip:** 21 pt, radius `--r-chip`, padding 0 8, 11.5/600, ellipsis when long.
  - Catalog: `--chip` / `--ink`.
  - Family: `--butter` / `--butter-ink`.
  - **Matched filter Tag:** `--accent-tint` / `--accent-on-tint`, 700, inset 1 pt `--accent` ring.
- **"+N":** 12/700 `--muted`, tabular.
- **Which two:** Tags matching the active filter first (in pick order), then Family Tags, then Catalog Tags in group order (Meal, Diet, Cuisine, Method).
- **Screen readers:** the line is one labelled element, "Tags: Dinner, Vegan, High-protein, …" (every Tag). The visual chips and "+N" are `aria-hidden`, so the overflow is announced by name, not only as a number.

## 8. Accessibility

- **Status line:** a polite `role="status"` line, visually hidden, reads e.g. "Dinner, Vegetarian selected. 2 Recipes match." It updates on every pick and every search change. Use the same line on Explore.
- **Sheet focus:** focus moves into the sheet when it opens and returns to the Tags button when it closes. Escape closes it.
- **Field:** the Tag field's input is labelled "Filter by Tags". MUI gives the chips their delete semantics (Backspace removes the last one). The "+N" and clear indicator are labelled (§4.2).
- **Colour is never the only cue:** selected options have a check, matched row Tags have a ring as well as the fill, and Family Tags are grouped under "Your Tags".
- **Reduced motion:** the sheet and scrim do not animate.

## 9. Strings (en; `recipes.json`, new unless noted)

| Key | en |
|---|---|
| `tags.button` | Tags |
| `tags.buttonLabel` | Filter by Tags |
| `tags.buttonLabelCount` | Filter by Tags, {{count}} selected |
| `tags.sheetTitle` | Filter by Tags |
| `tags.sheetHint` | Recipes must have <b>every</b> Tag you pick. |
| `tags.fieldPlaceholder` | Type to find a Tag |
| `tags.fieldLabel` | Filter by Tags |
| `tags.yourTags` | Your Tags |
| `tags.yourTagsNote` | only your family sees these |
| `tags.noOptions` | No Tag by that name on your Recipes |
| `tags.clearAll` | Clear Tags (field ×) |
| `tags.clear` | Clear (sheet button) |
| `tags.show` | Show {{count}} Recipe / Recipes |
| `tags.showNone` | No Recipes match |
| `tags.more` | and {{count}} more Tag / Tags |
| `tags.remove` | Remove Tag {{name}} |
| `tags.optionCount` | {{count}} Recipe / Recipes |
| `tags.status` | {{names}} selected. {{count}} Recipe matches / Recipes match. |
| `tags.rowLabel` | Tags: {{names}} |
| `tags.noMatch` | No Recipes have all {{count}} Tags / No Recipes have that Tag |
| `tags.noMatchQuery` | … and match “{{q}}” |
| `tags.tryWithout` | Try without one of them: |
| `tags.without` | Without {{name}} |

ro and da need all of these, with `few` plurals where there are counts. Remove the Cuisine/Method chip strings in the contract ticket (#715).

## 10. Data / API

- **Browse:** `GET /recipes?tagIds=a,b,c` (AND), together with `q`. `cuisine` / `method` keep working until #715 (#711 AC 5). Active filters return Variants as their own items, as today.
- **List items:** each item carries `tags: { id, name, kind: 'catalog' | 'family', groupId, groupName, groupOrder }[]` in the viewer's language (#708 AC 4). The rows and the options need nothing else.
- **Options source:** the distinct Tags in the family's browse scope. Either derive them client-side from the unfiltered list, or add `GET /recipes/tags?scope=family|catalog`, which returns Tags in use with their groups, ordered.
- **Counts (§4.3):** client-side over the loaded scope is enough at family sizes. For Explore, prefer a `counts` map from the server (open question 2).
- **Query keys:** add `tagIds` to the browse key. Keep `keepPreviousData` and the 300 ms search debounce. Tag picks apply immediately, with no debounce.

**Code touched (proposed):**

- `packages/ui`: `TagField` molecule (Autocomplete wrapper) and `TagChip` atom, plus the `tag` icon.
- `apps/web/src/pages/Recipes/components/RecipeFilters.tsx`: the chip rows are replaced by search + `TagsButton` + `SelectedTags`.
- New `TagsSheet.tsx` and `RowTags.tsx`. The row's meta line is used by `RecipeRow`, `ExploreRow`, Cook Tonight and the Dashboard widget.
- `lib/recipes.ts`: `tagIds` param.
- `i18n/locales/{en,ro,da}/recipes.json`.
- Tests: Recipes and Explore page tests (sheet opens, AND, Your Tags first, disabled zero options, 2 + "+N" on rows, status text), with the DOM-contract comments updated (#711 AC 6).

## 11. Open questions

1. Should the Tags button show the first picked Tag's name instead of only a count (e.g. "Vegan +2")? The chip row already shows the names, so the prototype keeps the button short.
2. Should option counts come from the server for Explore (large catalog), or be computed from the loaded page?
3. Should dimmed zero-count options be hidden instead? The spec only says "Tags used on at least one visible Recipe". Dimming keeps the list stable while picking.
4. Should the sheet also offer the text search, so one place holds every filter? The prototype keeps search outside.
5. Should Explore remember the family page's Tags when you jump there (like the search fall-through card), or start clean?
