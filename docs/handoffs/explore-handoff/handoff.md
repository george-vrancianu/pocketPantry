# Explore Recipes — design handoff

Status: chosen design (variant A), reviewed in a grilling session on 2026-10-24. The model decisions are in ADR 0029 (Catalog Recipes are templates a Family adds) and the ADR 0027 amendment (Explore pill); §11 lists them. Where the prototype or PNGs differ from this text (gears, "In your Recipes" copy), this text wins.
Source of truth: `prototype.html` in this package. It is self-contained and opens in a browser. A live copy is at https://claude.ai/artifact/UQ2wHMkYBfYHeCTNC3vNEN, which still has variants B and C for context. The numbers below are copied from the prototype.

| File | What's in it |
|---|---|
| `handoff.md` | This spec |
| `prototype.html` | The handoff scope only, with scenario switch (family with Recipes / new family), theme switch (Warm / Minimal / Dark) and every flow below clickable |
| `png/` | 20 screens at 2× (390 × 844 pt phone), listed in §9 |
| `gator/gator-chef.svg` | The chef Gator art used on the empty family page (static; the animated variants live in `docs/gator-motion`) |

Theme: built on the theme tokens (`docs/themes/themes.ts`); the token names below work in all three themes. Builds on: `docs/recipes/handoff.md` (list rows and Part 2 detail page), the Recipes list v2 rows (icon cluster, time column, status pills), `docs/gator-motion` (chef Gator) and `docs/recipes/add-recipe-v2-amendments.md` (the editor that Make a Variant opens).

---

## 1. Scope

**In this handoff:**

1. The **Explore** entry points on `/recipes`: a header pill, and a new item in the "+" menu.
2. The **Explore** page (`/recipes/explore`): search, chips, two groups, and a one-tap **Add to family** on every row.
3. The **quick view** sheet that opens from an Explore row.
4. The **full Recipe preview** (`/recipes/explore/:id`), reached from the quick view.
5. The **empty family** state of `/recipes`, with chef Gator.

**Not in this handoff** (shown in the prototype only for context):

- The family-first Recipes list itself (groups, hearts, Favorites). Hearts and Favorites don't exist in the code yet.
- The search fall-through card "“x” in Explore".
- The Make a Variant editor (add-recipe v2).

**Behaviour change this depends on:** `/recipes` lists **family Recipes only**. Catalog Recipes are reached through Explore.

## 2. Entry points

### 2.1 Header pill (`/recipes`)

The header reads: title "Recipes" (display 30), then **Explore pill**, then "+" (44 pt, `--primary`). The items have an 8 pt gap. There is no Settings gear (ADR 0027); the pill is the one allowed second header button (ADR 0027 amendment).

- **Pill:** 40 pt tall, padding 0 13 0 10, radius 999, `--card-bg`, 1 pt `--line`. It holds a compass icon (18 px, `--accent`) and "Explore" (13.5/700, `--ink`). Hover/pressed: `--subtle`.
- **Tap:** pushes `/recipes/explore`. The new page slides in from the right (translateX 100% → 0, 320 ms, `cubic-bezier(.2,.8,.2,1)`). The family page moves to −28% at opacity .6. Back reverses this. There is no motion under reduced motion.

### 2.2 "+" menu

The existing `ActionMenu` (New Recipe, From a link; #511) gets a divider and a third item: **From Explore**. It has the compass icon and a small "new" pill (10.5/700, `--accent-tint` / `--accent-on-tint`; drop the pill after a release or two). It goes to `/recipes/explore`.

Menu box: min-width 214, radius 16, padding 6, `--card-bg`, `--shadow-float`. Items are 44 pt, 15/600, with an 18 px icon in `--muted`.

## 3. Explore page (`/recipes/explore`)

### 3.1 Layout (390 pt, 20 pt gutter)

| Region | Notes |
|---|---|
| Header | Back (40 pt ghost circle, chevron-left) · "Explore" (display 30). No gear. Back carries the **added badge** (§3.4). |
| Subline | "Add a Recipe to cook, plan and change it, or make a Variant of it." 13.5 `--muted`, line-height 1.4. |
| Search + chips | Same block as the Recipes list: 48 pt field, placeholder "Search all Recipes", chip row with Clear / Cuisines / divider / Methods. It is sticky at the top. Search uses a 300 ms debounce and `keepPreviousData`. |
| Groups | **You can make this** (Catalog Recipes from cook-tonight, most expiring first), then **All Recipes** (catalog Base Recipes, A–Z, minus the ones already in the first group). Section label 12/700 caps `--muted` with the count on the right. Each group shows `LIMIT = 4` rows, then a dashed "Show n more" row as in list v2. |
| Filtering | A search or chip folds the groups into one "Matches" list that **includes Variants** as their own rows, with the "Variant of …" line. |
| Empty | "No Recipes match." / "Try another word, or write your own with New Recipe." |
| Dock | Unchanged; pad content 120 pt at the bottom. |

### 3.2 Row

The row is the list v2 row (50 pt cluster tile, title 15.5/700, meta 13/500, cook-tonight pills, time column), with these differences:

- In **All Recipes**, the meta ends with "+n Variant(s)" when the Base has catalog Variants.
- Inside **You can make this**, the "Can make" pill is dropped (the label already says it). "n expiring" stays.
- When the Recipe is already in the family (§3.3): a butter pill **"In your Recipes"** (people icon 13 px, 11/700, `--butter` / `--butter-ink`, padding 2 × 8) sits inline after the title.
- The trailing slot holds the **add button** (§3.3).
- Tapping the row body opens the **quick view** (§4), not the detail page.

### 3.3 Add button (one tap)

- **Default:** 38 pt circle, 1.5 pt `--accent` border, `--card-bg` fill, plus icon 18 px `--accent`. Hover: `--accent-tint` fill. Accessible name: "Add {title} to your Recipes".
- **Tap:**
  1. Calls the copy endpoint (§8) optimistically.
  2. The button becomes **added**: `--accent-tint` fill, no border, check 18 px `--accent-on-tint`. The icon pops (scale 1 → 1.35 → 1, 360 ms).
  3. The row gains the "In your Recipes" pill.
  4. A toast appears: "Added {title} to your Recipes" with **Undo**.
  5. Back's badge counts up.
- **Undo:** archives the copy (`POST /recipes/:copyId/archive`; Recipes are never deleted, ADR 0029) and restores the default state. An archived copy frees the slot, so + adds a fresh copy next time. Toast: `--toast-bg`, radius `--r-ctl`, 4.5 s, 92 pt above the bottom (above the Dock).
- **Added state, tapped:** opens the family copy (`/recipes/{copyId}`). Accessible name: "{title} is in your Recipes. Open it".
- **Errors:** roll back to default and show the error toast ("Couldn't add {title}. Try again.").

### 3.4 Added badge on Back

A 20 pt pill on Back's top-right corner (−4 / −6 pt offset, `--accent` fill, `--accent-ink` text 11/700, 2 pt ring in `--bg`) shows "+{n}": the Recipes added during this visit to Explore. It counts net adds (an Undo counts it back down, and it hides at 0), bumps (scale 1.3, 400 ms) on each add, and resets when the page is left. Back's accessible name becomes "Back to your Recipes, {n} added".

## 4. Quick view sheet

A bottom sheet over Explore. Scrim rgba(10,12,8,.38). Sheet: `--surface`, top radius 26, padding 8 20 28, max-height 86 %, scrolls inside. It slides up 300 ms (none under reduced motion). The grab handle is 40 × 5. Escape, a scrim tap or the × close it. It is a `role="dialog"` with `aria-modal="true"`, labelled by the title.

Top to bottom:

1. **Head row:**
   - 58 pt cluster tile.
   - Eyebrow (11.5/700 caps `--accent`): "Catalog Recipe", or "⑂ Variant of {base}".
   - Title (display 23, line-height 1.15).
   - 40 pt ghost × button, right-aligned.
2. **Fact cells:** grid `1fr 1fr 1fr 1.5fr`, gap 8, margins 14 / 12. Cells are `--card-bg`, 1 pt `--card-line`, radius 12, padding 8 × 6. Label 10/700 caps `--muted`; value display 15. The cells are **Time**, **Serves**, **Level** and **Style** (cuisine, or the method when there is no cuisine).
3. **Cook-tonight pills:** Can make / Missing {x} / n expiring, as on the row.
4. **Ingredients:**
   - Label 12/700 caps, count on the right.
   - Wrapping chips, 30 pt, radius 999, `--card-bg`, 1 pt `--card-line`. Each chip has a 22 px ingredient icon and the name 12.5/600.
   - A **missing** ingredient's chip has a dashed `--soon-fg` border.
5. **Variants** (Base Recipes with catalog Variants only; the Family's own Variants never show in Explore):
   - Label and count, then a card (`--card-bg`, radius `--r-card`) of compact rows: 58 pt tall, 40 pt cluster, title 14.5/700, meta, time.
   - Each row has its own add button (§3.3). Tapping a row body opens that Variant's full preview.
6. **"See the whole Recipe ›":** full width, 46 pt, radius `--r-ctl`, `--card-bg`, 1 pt `--line`. It has a book icon (`--accent`), the text 14.5/700 `--ink` and a chevron. It pushes the full preview (§5) and closes the sheet.
7. **Actions:**
   - Primary **"+ Add to your Recipes"** (48 pt). When the Recipe is already added it becomes tinted **"✓ In your Recipes · Open"** (`--accent-tint` / `--accent-on-tint`), which opens the copy.
   - Secondary **"⑂ Make a Variant"** (48 pt, `--card-bg`, 1 pt `--line-strong`), 8 pt below the primary.
   - Explanation line (12.5 `--muted`, centred): "Adding makes a copy your family can change. Make a Variant opens the editor first." Once added: "Your copy is yours to change. This Catalog Recipe stays as it is."

Opening the sheet hides any toast that is showing.

## 5. Full Recipe preview (`/recipes/explore/:id`)

This is the detail page from `docs/recipes/handoff.md` Part 2 (hero, fact cells, sticky Ingredients / Steps / About tabs), in a **preview mode** for Catalog Recipes. Reuse `RecipeDetailPage` and its components (`RecipeHero`, `IngredientList`, `StepList`, `GuidanceSection`, `Servings`), driven by a `preview` flag. Changes from the family detail page:

### 5.1 Header and hero

- **Header:** Back · flexible space. No gear. There is no "+" or "…" action; the bottom bar holds the actions.
- **Eyebrow:**
  - On a Base: "Explore · Catalog Recipe", with a compass icon 13 px, in `--muted` (not a link).
  - On a catalog Variant: the link "⑂ Variant of {base}" (`--accent`), which pushes the Base's preview.
- **Title:** display 28. Once the Recipe is in the family, the "In your Recipes" butter pill follows the title.
- **Fact cells:** as Part 2 §2.2. Serves follows the stepper.

### 5.2 Tabs

The segmented control is the same as Part 2 §2.3: sticky, `--chip` track, 40 pt buttons, and a count badge on Ingredients (`--urgent-bg` / `--urgent-fg`) when lines are missing. Switching tabs scrolls back to the tabs if the page was scrolled past them.

- **Ingredients:**
  - Top row: "You can make this" or "Missing {n}" on the left; the **Servings stepper** on the right (40 pt pill, 34 pt round − / +, "{n} Serving(s)" 13.5/700, range 1–12). Quantities scale with it.
  - Ingredient table: rows of 48 pt with an icon (26 px), name 15/600, quantity tag and status pill ("In your Pantry" / "Short …" / "Missing" / "Pantry Basic").
  - When anything is missing, a secondary **"Add {n} missing to Shopping List"** (48 pt) sits under the table. It uses the existing add-missing mutation; Catalog Recipes already allow this today. After success it reads "✓ Added to your list" and is disabled. Each row's per-line add (Part 2 §2.4) stays too; both work on Catalog Recipes today.
- **Steps:** as Part 2 §2.5 (numbered 28 pt `--ink` circles, timer pills, dashed Step Tips).
- **About:**
  - Pairings, Nutrition and the disclaimer, as Part 2 §2.6.
  - Then **Variants**: the quick view's compact rows, each with its own add button. A row opens that Variant's preview.

### 5.3 Preview note

At the end of every tab sits a dashed note (`--subtle`, 1 pt dashed `--line-strong`, radius `--r-ctl`, padding 10 × 12, 12.5 `--muted`). It has an eye icon in `--accent` and reads: "You're previewing a Catalog Recipe. Add it to your Recipes to change it, plan it or cook it from your list."

### 5.4 Bottom action bar (replaces the Dock)

- **Bar:** fixed to the bottom, `--bg`, 1 pt `--line` top border, padding 12 16 26 (plus the safe area). It holds two equal columns, gap 10, of 48 pt buttons (14/700, no wrap):
  - **Left:** secondary **"⑂ Make a Variant"** → `/recipes/{id}/variant/new`. On a catalog Variant, the new Variant branches from that Variant's Base, prefilled from the Variant, since a Variant can't have Variants.
  - **Right:** primary **"+ Add to family"**. Once added, it becomes tinted **"✓ In your Recipes"**, which opens the copy.
- **Toasts** sit 100 pt from the bottom, above the bar.
- The Dock is hidden on this route. The Make a Variant editor also has no Dock, as today.

## 6. Empty family state (`/recipes` with no family Recipes)

It replaces the search, the chips and the groups. The header stays as in §2.1. Archived Recipes don't count, so a Family with only archived Recipes sees this state; a Family with only a Variant is not empty. If the Member has Recipe Drafts, the "Drafts (N)" entry (ADR 0028) sits above the Gator panel.

1. **Gator panel:** 206 pt tall, radius 24, `--accent-tint` fill (#1F3A2A in Dark, so the full-body Gator sits on the dark ground as the Gator handoffs ask), overflow hidden.
   - **Gator:** chef Gator (`gator/gator-chef.svg`, 280 × 252 viewBox) drawn at 206 × 186, anchored 24 pt past the left edge and 8 pt past the bottom, so the tail and pot bleed slightly.
   - **Motion:** the one-shot **entrance**, then the chef's looping **signature**: stirs, steam, whisk, bob, rack sway, tail wag, blink. Use `gator-chef-entrance.svg` → `gator-chef-signature.svg` from `docs/gator-motion`, switching after about 1.3 s.
   - **Tap:** the 0.9 s **tap** hop (`gator-chef-tap.svg`, or the inline rig).
   - Gator is a `<button>` named "Gator the chef, stirring an empty pot. Tap to say hi"; the art inside is `aria-hidden`.
   - **Speech bubble:** right 12, top 16, width 150; `--card-bg`, radius 18, padding 11 × 13, 13.5/600 `--ink`, `--shadow-card`. It has a 16 pt rotated-square pointer on its left edge, 58 pt from the top. Copy: "My pot's empty! Grab a few Recipes from **Explore**, or write down one of yours." ("Explore" in 700 `--accent-on-tint`.) It fades and rises in (6 pt, scale .94 → 1) over 400 ms with a 700 ms delay.
   - Reduced motion: Gator at rest, the bubble shown with no fade.
2. **Title:** "No family Recipes yet", display 22, centred, 16 pt under the panel.
3. **Body:** "Recipes you add can be changed however you like. Everyone in your family sees them." 14 `--muted`, max 31 ch, centred, 16 pt under the title.
4. **Buttons:** primary **"Explore Recipes"** (48 pt, compass icon) → `/recipes/explore`. Under it, secondary **"+ New Recipe"**, which opens the "+" menu (New Recipe / From a link / From Explore).
5. **"Start with these · you can make them":** a section label, then up to 3 Explore rows (§3.2 with the add button) for catalog Base Recipes in the cook-tonight result, most expiring first. Adding one makes the family non-empty, so the page switches to the normal list right away, with the toast and Undo. Undo brings the empty state back. If cook-tonight has nothing, hide this section.

## 7. Strings (en; new, `recipes.json` unless noted)

`explore.title` "Explore", `explore.pill` "Explore", `explore.menuItem` "From Explore", `explore.menuNew` "new", `explore.subline` "Add a Recipe to cook, plan and change it, or make a Variant of it.", `explore.search` "Search all Recipes", `explore.noMatches` "No Recipes match." / "Try another word, or write your own with New Recipe.", `explore.add` "Add {{title}} to your Recipes", `explore.added` "Added {{title}} to your Recipes", `explore.addFailed` "Couldn't add {{title}}. Try again.", `explore.inFamily` "In your Recipes", `explore.openCopy` "{{title}} is in your Recipes. Open it", `explore.backAdded` "Back to your Recipes, {{count}} added", `quickView.catalog` "Catalog Recipe", `quickView.seeWhole` "See the whole Recipe", `quickView.addPrimary` "Add to your Recipes", `quickView.inFamilyOpen` "In your Recipes · Open", `quickView.why` / `quickView.whyAdded` (§4.7), `preview.eyebrow` "Explore · Catalog Recipe", `preview.note` (§5.3), `preview.addShort` "Add to family", `empty.title` "No family Recipes yet", `empty.body` (§6.3), `empty.explore` "Explore Recipes", `empty.starters` "Start with these · you can make them". In `gator.json`: `chef.emptyFamily` "My pot's empty! Grab a few Recipes from <b>Explore</b>, or write down one of yours.", `chef.alt` (§6.1). Reuse `makeVariant`, `variantOf`, `newRecipe`, the cook-tonight pills, the tab labels, `pantry.*` and the Servings strings. All of these need ro and da, with `few` plurals where there are counts.

## 8. Data / API

- **`recipes.copied_from_id`**: a nullable FK to the source Catalog Recipe, set only on family copies.
- **`POST /recipes/:id/copy`** (catalog id): creates a Family Recipe owned by the caller's Family. It copies the title, tags, servings, times, difficulty, Ingredient Lines, Steps, Step Tips, recipe Tips and guidance.
  - A catalog Base becomes a family **Base**.
  - A catalog Variant becomes a family **Variant of the same catalog Base**.
  - Returns `{ id }`. It is idempotent per Family and source: a second call returns the existing copy's id (see open question 2).
  - Also copies Hidden Tips, Eating Moments and Pairings (with their Catalog Recipe links). A copied Base takes the Catalog Base's own Tips; a copied Variant keeps inheriting them from the Catalog Base. The text is in the adding Member's Catalog Language. No Source Link.
  - At most one **live** copy per Family and source (unique on family + `copied_from_id` where not archived), so two Members adding at once get the same copy.
- **Undo:** `POST /recipes/:copyId/archive`, the existing archive route. There is no Recipe delete.
- **Make a Variant on a copy:** branches from the Catalog Base it was Copied From (a copy of a Base: that Base; a copy of a Variant: its Base), prefilled from the copy. Hidden when that Base is archived. Family Bases still can't have Variants (`assertLiveCatalogBase`).
- **Family list grouping:** a Family Variant is grouped under the Family's live copy of its Catalog Base, matched through `copied_from_id`; otherwise it is its own row with "Variant of {base}".
- **Links to a Catalog Recipe** (Pairings, Dashboard, Plate Scan, Source Recipes, old `/recipes/:catalogId` bookmarks): open the Family's live copy if there is one, else `/recipes/explore/:id`.
- **Meal Plans:** the picker lists Family Recipes, then an Explore section where a pick Adds to Family and plans. Plan fill uses Family Recipes only. A one-off migration copies every Catalog Recipe an existing plan slot uses into that Family and repoints the slot.
- **Plate Scan:** still ranks Catalog Bases; a match opens the Explore preview.
- **Allergies:** Explore hides conflicting Recipes with the same "show hidden" as the list; the starters and "You can make this" never show hidden ones.
- **Explore list:** `GET /recipes?scope=catalog` (or a new `/recipes/explore`). It returns Base Recipes by default and Variants while filtering, as the browse endpoint does today. Every item gains `familyCopyId: string | null`, which drives ✓, the "In your Recipes" pill and opening the copy.
- **Family list:** `GET /recipes?scope=family` (the family-only default of `/recipes`), including family Variants.
- **Cook-tonight:** gets `scope=family|catalog`. Cook Tonight (Dashboard widget, Recipes strip) is `family`; when empty, the widget points to Explore. Explore's group uses the catalog cards; the empty state's starters use catalog Bases.
- **Preview route:** `GET /recipes/:id` and the Pantry match work for Catalog Recipes as they do today; nothing new is needed.
- **Query invalidation after add or undo:** the Explore list, the family list, cook-tonight, and `recipes/:id` for the source.

Code touched (proposed): `apps/web/src/pages/Recipes/RecipesPage.tsx` (pill, empty state), new `ExplorePage.tsx` + `components/ExploreRow.tsx`, `AddToFamilyButton.tsx`, `QuickViewSheet.tsx`, `PreviewActionBar.tsx`; `RecipeDetailPage.tsx` (`preview` mode), `components/RecipeHero.tsx` (eyebrow), `lib/recipes.ts` (`useCopyRecipe`, `familyCopyId`, scope param), `lib/cookTonight.ts`, router (`/recipes/explore`, `/recipes/explore/:id`), the AppDock hide rule, `packages/ui` Gator image atom (chef), `i18n/locales/{en,ro,da}/recipes.json` + `gator.json`. API: migration for `copied_from_id`, the copy route, the `scope` param.

## 9. Screens (`png/`)

| # | File | Shows |
|---|---|---|
| 01 | `01-recipes-explore-pill` | Recipes header with the Explore pill (context: family list) |
| 02 | `02-plus-menu-from-explore` | "+" menu with From Explore |
| 03 | `03-explore` | Explore: You can make this |
| 04 | `04-explore-all-recipes` | All Recipes with "+n Variants" and Show more |
| 05 | `05-explore-added-toast` | After + on Shakshuka: ✓, pill, toast with Undo, Back badge |
| 06 | `06-explore-search` | Search "chicken": Matches with Variants, one already in the family |
| 07 | `07-quick-view` | Quick view, can make, with a Variant row |
| 08 | `08-quick-view-missing` | Quick view with a missing ingredient (dashed chip, Missing pill) |
| 09 | `09-preview-ingredients-missing` | Full preview, Missing 1, Add missing to Shopping List |
| 10 | `10-preview-ingredients` | Full preview, Ingredients, can make |
| 11 | `11-preview-servings-2` | Servings stepper at 2, quantities scaled |
| 12 | `12-preview-steps` | Steps with a Tip and a timer |
| 13 | `13-preview-about` | About: Pairings, Nutrition, Variants |
| 14 | `14-preview-added` | After Add to family: tinted bar button, toast above the bar |
| 15 | `15-preview-variant` | Preview of a catalog Variant ("⑂ Variant of Omelette") |
| 16 | `16-explore-back-badge` | Back on Explore with the "+1" badge |
| 17 | `17-empty-family-gator` | Empty family page with chef Gator (Warm) |
| 18 | `18-empty-family-gator-dark` | Same, Dark |
| 19 | `19-explore-dark` | Explore, Dark |
| 20 | `20-preview-dark` | Full preview, Dark |

The screenshots are rendered with reduced motion, so Gator is at rest. They also use fallback fonts, because the capture environment couldn't load Google Fonts. Check type against `prototype.html`, which loads Fraunces / Instrument Sans (Warm), Schibsted Grotesk / Figtree (Minimal) and Sora / Albert Sans (Dark).

## 10. Accessibility

- The add button is a real `<button>` with a specific name per state (§3.3). Its state change is announced through the toast (`role="status"`).
- The quick view is a modal dialog: focus moves to the title, is trapped inside the sheet, and returns to the row when it closes. Escape closes it.
- The preview tabs follow Part 2 §2.7 (arrow keys, `aria-selected`, `tabpanel`).
- The bottom bar's buttons keep their text in both states; colour is never the only cue.
- Gator's tap target is a button with an accessible name; the decorative SVG is hidden. All Gator, sheet, slide and pop motion stops under `prefers-reduced-motion`.

## 11. Decisions (formerly open questions)

1. Copies are frozen: Admin edits never reach them. `copied_from_id` leaves room for a "Review changes" later (ADR 0029).
2. At most one live copy per Family and Catalog Recipe; the copy route is idempotent, and an archived copy frees the slot. A Variant made from a Catalog Recipe is not a copy.
3. Yes, the preview keeps both add-missing and the per-line add.
4. See §8: the Meal Plan picker is family first with Explore below, Plate Scan opens the preview, and all Catalog links follow the live-copy rule.
5. Ship the steaming pot; an "empty pot" pose is a follow-up.
6. Drop the "new" pill after two releases.
7. "In your family's" is reworded "In your Recipes" throughout (§7).
