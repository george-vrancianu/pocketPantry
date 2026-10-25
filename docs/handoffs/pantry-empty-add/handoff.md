# Empty Pantry + Add to Pantry — design handoff

Status: chosen design (Empty Pantry **C · Shelves**, Add **A · Quick sheet**, with the round-2 change: Take a photo and Scan barcode instead of Scan a receipt). Ready for implementation review. Date: 2026-10-24.
Source of truth: `prototype.html` in this package. It is self-contained and opens in a browser. A live copy is at https://claude.ai/artifact/S9sR8PEvfjpJwBdK7FTRiX, which still has the variants that weren't picked. The numbers below are copied from the prototype.

| File | What's in it |
|---|---|
| `handoff.md` | This spec |
| `prototype.html` | The handoff scope only: theme switch (Warm / Minimal / Dark), scenario switches (ticked items on the Shopping List, empty the Pantry, open Add), every flow below clickable, including a stub of the camera |
| `png/` | 20 screens at 2× (390 × 844 pt phone), listed in §11 |
| `gator/gator-list-keeper.svg` | The list-keeper Gator used in the empty-Pantry banner (static; animated variants are in `docs/gator-motion`) |
| `icons-additions.ts` | Icons to merge into `packages/ui/src/atoms/icons.tsx` |
| `spec-amendments.md` | Bullets to change in `SPEC.md` (Pantry, Scanning) |

## Decisions (2026-10-25)

Agreed in review against the code, `GLOSSARY.md` and the ADRs. Where these contradict the sections below, these win.

1. **Barcode is already built** (ADR 0013, 0016). Barcode Lookup is not a Scan and not a Scan Mode. It resolves Known Barcodes, then the Open Food Facts cache, then Open Food Facts, through `GET /barcode-lookup/:barcode`. A Known Barcode is upserted with the Batch create. Drop §8's `GET/POST /catalog/barcodes`, the Admin curation queue and open question 1. Take only the camera UI from §6.3.
2. **Slider order stays** Receipt · Ingredients · Product · Barcode · Plate (Scan screen v3). Drop the reorder and the "new" superscript in §6.3.
3. **No header search button** (ADR 0027). The Pantry header holds only the "+". Search stays in the filters, which are hidden while the Pantry is empty.
4. **Empty Pantry** = no Batches at all; a Pantry holding only Expired Batches shows the list. Deleting the last Batch shows the empty state as soon as the row is gone, while its Undo toast is still up; Undo brings the list back.
5. **Default Expiry stays per Category** (open question 3). Choosing Freezer keeps the Category's usual. Per-Location expiry is a separate issue if wanted.
6. **The camera from the sheet is the existing in-page `CameraOverlay`** (Product and Barcode, single-shot), restyled to §6, not the Scan page. There is no `return=pantry-add` parameter. The sheet's state (Location preset, Added strip) survives because nothing navigates. The "Adds to your Pantry" pill gains **Scan several**, which closes the sheet and opens `/scan?mode=barcode` (or `product`) as a normal Scan Session. That answers open question 2: single-shot, with a visible way out.
7. **Barcode hit**: show the §6.3 result card (Scan again / Use this) before returning to the sheet. Show "Product data: Open Food Facts" on the card and in the sheet when the values came from there, and keep the allergen notes the form shows today.
8. **Barcode miss**: the "We don't know this barcode yet" card offers **Take a photo** (primary, switches the overlay to Product) and **Type it**. The code goes with the Batch on both paths, so it becomes a Known Barcode.
9. **Empty query panel**: show **Recently Stocked** (as the add-Batch form does today), and fall back to **Popular to start** when it is empty, then Browse by aisle. Do not use the Gone from your Pantry tiles here. Popular to start is a fixed list of 8 Ingredient ids per locale (open question 4).
10. **Note** stays folded for typed picks and open for camera picks (open question 5).
11. **Empty Location filter** in a non-empty Pantry shows one §2.5 shelf card for that Location, in place of "No batches match." It is in scope (open question 6).
12. **Undo on the "Added …" toast** deletes only that Batch and removes its chip from the Added strip. The chips themselves are not interactive.
13. **Ticked-items bar** shows only on the Empty Pantry. "Move them" goes to `/shopping?finish=1`, which opens Finish Shopping's Review on arrival and strips the parameter. After saving, the Member lands on the Shopping List as today.
14. **Amount presets** (`docs/amount-presets`) are built before the sheet, as their own piece of work. Until then the sheet uses today's `BatchAmountField`.
15. **Dock**: "Say it" needs a non-blocking teach state that lights the mic half and leaves the tabs usable. The Intro keeps today's blocking `teach`.
16. **Location fallback** stays Cupboard when the Ingredient has no default Location. Hide the usual dot and the "usual for …" hint in that case.
17. **Barcode camera keeps SPEC** (Scan screen v3): guide 0.80 × 0.30, no hint under the guide, and in Barcode the shutter is the ring that takes no input, both on the Scan page and in the sheet's camera. Of §6.3 only the **scan line** is added, in both places. Drop the 0.24 guide, the hint string `hint.barcode` and the forced-decode shutter.

Theme: built on the theme tokens (`docs/themes/themes.ts`); the token names below work in all three themes. Builds on: `docs/catalog-search` (search field, result rows, token, gone tiles, aisle chips), `docs/amount-presets` (amount field with preset chips), `docs/expiry` (ExpirySheet, tag ladder), `docs/pantry-batches` (the Pantry list once it has Batches), `docs/scan-screen-v3` (the camera), `docs/intro-gator` §4 (the lit capsule half and callout), `docs/gator-motion` (list-keeper Gator).

---

## 1. Scope

**In this handoff:**

1. The **empty Pantry** page (`/pantry` with no Batches): Gator banner with quick actions, a ticked-items bar, one empty shelf per Location.
2. The **Add to Pantry sheet** that replaces today's Add-batch form: quick row (Take a photo · Scan barcode · Say it), search, Popular to start, and a one-card Batch editor.
3. **Camera entry points** with a preselected mode, and the one-shot return from the camera into the sheet.
4. A new **BARCODE** Scan Mode (proposal; §6.3, §8).

**Not in this handoff:** the Pantry list itself (see `pantry-batches`), Finish Shopping's Review, the full Scan Session / Review flow, Voice Note recording and review (see `voice-notes`). The prototype shows them only as stubs.

## 2. Empty Pantry (`/pantry`, zero Batches)

Layout, top to bottom (390 pt phone, page gutter as today; the prototype uses 18):

### 2.1 Header
As today: "Pantry" (display 30) with the subline "Nothing in here yet" (13 `--muted`), the search ghost button (40 pt, **disabled** at opacity .45 while empty) and the "+" FAB (44 pt, `--primary`) which opens the Add sheet (§3).

### 2.2 Location chips (dimmed)
The normal chip row (All · Fridge · Freezer · Cupboard · Spices with counts, 34 pt, `--surface`, 1 pt `--line`, 13/600, count 12 tabular at 70 %, "All" selected in `--accent-tint`) at **opacity .55**, `aria-hidden="true"` and not interactive. It previews the page's shape without inviting taps that lead nowhere.

### 2.3 Ticked-items bar (conditional)
Shown only when the Shopping List has checked Shopping Items. Full width, padding 10 × 12, radius `--r-card`, `--butter` / `--butter-ink`, 13.5/700. Cart icon 20 · "{n} ticked on your Shopping List" (flex 1) · "Move them ›". Tap → **Finish Shopping** (existing flow: Review, then Batches with Default Expiry). Margin 4 pt above and below.

### 2.4 Gator banner
- Panel: `--accent-tint` (Dark: #1F3A2A by token), radius 24, min-height 132, padding 12 12 12 0, overflow hidden, flex row, gap 6, items centred, 6 pt below.
- **Gator**: list-keeper (`gator/gator-list-keeper.svg`, viewBox 0 −4 280 244) at 122 × 110, bottom-aligned, margins −4 −4 −12 −8 so the feet and tail bleed off the panel's bottom-left. It is a `<button>` named "Gator reading a list. Tap to say hi"; the art is `aria-hidden`.
  - Motion: one-shot **entrance** (`gator-list-keeper-entrance.svg`, ~1.25 s pop) then the **signature** loop (ticks draw in, pencil scribbles, eyes scan, head nods) — switch after ~1.3 s, and only play the entrance once per visit to the page. **Tap**: the 0.9 s hop. Nothing moves under reduced motion.
- **Copy** (flex 1): "Tell me what you have and I'll put it on the right shelf." 14/700 `--accent-on-tint`, line-height 1.3.
- **Pills** under the copy (wrap, gap 6): 36 pt, padding 0 11 0 9, radius 999, `--card-bg`, `--shadow-card`, 13/700 `--ink`, icon 16 `--accent`:
  - **Scan** (receipt icon) → camera on **RECEIPT** (§6.1).
  - **Say it** (mic) → lights the Dock's mic half (§2.6). It does not record by itself.
  - **Type** (pencil) → Add sheet (§3).

### 2.5 Empty shelves
A column, gap 10. One card per Location in Fridge, Freezer, Cupboard, Spices order:
- Padding 12 12 12 14, radius `--r-card`, **1.5 pt dashed `--line-strong`**, transparent fill.
- Icon circle 44 pt, `--subtle`, icon 24 `--muted` (fridge / snowflake / cupboard / spice jar, see `icons-additions.ts`).
- Title 15/700 "{Location} is empty"; hint 12.5 `--muted`:
  - Fridge "Milk, eggs, cheese, leftovers"
  - Freezer "Peas, ice cream, a spare loaf"
  - Cupboard "Pasta, rice, tins, oil"
  - Spices "Paprika, cumin, oregano"
- **+** on the right: 38 pt circle, 1.5 pt `--accent` border, `--card-bg`, plus 20 `--accent`, label "Add to {Location}". Opens the Add sheet with **that Location preset** (§3.6).

Bottom padding of the page: enough to clear the Dock, its capsule and the EN chip (the prototype uses 190).

As soon as the first Batch exists the page switches to the normal list (`pantry-batches`), with the new rows flashing `--accent-tint` for 1.8 s.

### 2.6 Say it: lit capsule
Same look as the intro's teaching state (`intro-gator` §4), but **nothing else is disabled**:
- Mic half of the capsule: fill #F0C96B, icon #4A3608, pulse ring `0 0 0 0 rgba(240,201,107,.75) → 0 0 0 16px transparent`, 1.6 s ease-out, infinite (none under reduced motion).
- Callout above the EN chip: #FBF8F1 card, 260 wide, radius 16, padding 10 14, centred, bottom 166 pt, 12 pt pointer down. Title 15/700 "Hold the mic, talk, let go"; line 12.5 #5C5243 "Try “two litres of milk and a dozen eggs, in the fridge”."
- Clears after 4.8 s, on any tap outside the capsule, or when the mic is pressed (the normal Voice Note flow takes over).

## 3. Add to Pantry sheet

Opened by the header "+", a shelf "+" (with a Location), the banner's Type pill, and anywhere the app today routes to the Add-batch form (for example "Add batch" in an opened ingredient card, which opens the sheet **with that Ingredient already picked**).

### 3.1 Sheet
Scrim rgba(10,12,8,.38). Sheet: `--surface`, top radius 26, from 46 pt under the status bar to the bottom, flex column; slides up 300 ms `cubic-bezier(.2,.8,.2,1)` (none under reduced motion). Grab handle 40 × 5. `role="dialog"`, `aria-modal="true"`, labelled "Add to Pantry". Escape, a scrim tap or × close it.

- **Header** (padding 4 18 10): title "Add to Pantry" display 22; on the right a 40 pt ghost × — after the first add in this visit it becomes a **Done** pill (36 pt, padding 0 14, `--primary`, 14/700).
- **Body**: scrolls, padding 0 18 20.
- **Footer** (only once an Ingredient is picked): 1 pt `--line` top border, padding 12 18 28 (+ safe area), full-width primary button 48 pt.

### 3.2 Before a pick
Top to bottom:
1. **Added strip** (after at least one add in this visit): horizontal scroller, gap 6, bleeding to the sheet edges. Caps label "Added" 11.5/700 `--muted`, then a chip per added Batch: 32 pt, radius 999, `--accent-tint` / `--accent-on-tint`, ingredient icon 24, name 12.5/700, check 16.
2. **Quick row**: grid of 3, gap 8, margin-bottom 12. Each tile 66 pt tall, radius `--r-card`, `--card-bg`, 1 pt `--card-line`, `--shadow-card`; icon 24 above a 13/700 label:
   - **Take a photo** (camera) → camera on **PRODUCT** (§6.2).
   - **Scan barcode** (barcode) → camera on **BARCODE** (§6.3).
   - **Say it** (mic) → closes the sheet and lights the Dock mic (§2.6).
3. **Search**: `CatalogSearch` field as specified there (50 pt), placeholder **"Or type it, e.g. milk"**, clear × once there is text or an aisle. Results, no-match, free text, Add to your catalog and errors exactly as `catalog-search` §4.
4. **Empty query panel** (field empty, no aisle):
   - If the Family has gone items, the **Gone from your Pantry** tiles (`catalog-search` §4.3).
   - Otherwise (new Family) **Popular to start**: same two-column tile (radius 14, 1 pt `--line`, `--card-bg`, 32 pt icon tile in the Aisle tint, name 13.5/600, second line 11 `--muted` "{default amount} · {Location}"), up to 8. Tap = pick.
   - Then **Browse by aisle** chips (`catalog-search` §4.4).

### 3.3 After a pick
- The field becomes the **token** (`catalog-search` §3.1): `--accent-tint`, min-height 56, ingredient tile 42, name 16/700, meta 12 at 80 % ("{leaf} · {aisle}", or the product name when the pick came from the camera), × 36 "Change ingredient".
  - Camera picks get a tag after the name: **"From photo"** (camera icon) or **"Scanned"** (barcode icon); 10.5/800, padding 1 × 7, radius 999, `--butter` / `--butter-ink`, icon 11.
- 12 pt below, **one card** holds the Batch: `--card-bg`, 1 pt `--card-line`, radius `--r-card`, `--shadow-card`, padding 14; sections gap 14. Each section has a label row: 11.5/700 caps `--muted` on the left, and a hint on the right in 600 `--accent-on-tint` (normal case) when the value is the usual one.
  1. **Amount** — the `amount-presets` field: 50 pt input 17/600 tabular with the unit chip (36 pt, min 46, `--chip`), preset chips row 8 pt below. Hint "usual amount" when the value equals a preset. Default value: the Catalog's default amount for the Ingredient (the prototype uses the second preset for mass/volume, the first for counts). Camera picks: the pack size read.
  2. **Where it goes** — four-way control on a `--chip` track (padding 4, gap 4, radius `--r-ctl`): buttons 52 pt with the Location icon 20 over the name 12/600; selected `--card-bg`, 700, `0 1px 2px rgba(0,0,0,.1)`. A 6 pt `--accent` dot (top 6, right 8) marks the Catalog default Location. Hint "usual for {leaf}" when the default is selected. Default: the Ingredient's Category Location (SPEC 29), unless a Location was preset (§3.6).
  3. **Expires** — chips row (36 pt, radius `--r-chip`, 1 pt `--line`, 13/600; selected `--accent` / `--accent-ink`), scrolls sideways: **"Usual · {n}"** (selected by default; n as "10 d", "1 wk", "2 wk", "1 mo", "18 mo", or "none"), 3 d, 1 wk, 2 wk, 1 mo, No date, and a calendar chip that opens `ExpirySheet` (`expiry` handoff) for any other date. Under the row, 8 pt: calendar icon 16, the resolved date in 700 `--ink` ("Sat 31 Oct · in 7 days", or "No expiry date") and, when Usual, " · usual for {name}" in `--muted`. Choosing a value equal to the usual one selects Usual.
  4. **Note** (Product Description) — folded as a text link "+ Add a note (brand, size)" (13.5/700 `--accent`). Tapping it reveals the 46 pt field, placeholder "Brand or size, e.g. Zuzu 3.5%", labelled "Note · optional", and focuses it. It is open and filled when the pick came from the camera.
- **Footer button**: "+ Add {name, lowercase}" (e.g. "Add milk").

### 3.4 Saving
- Creates the Batch (existing create endpoint). Toast "Added {name} · {amount} {unit} · {Location}" (toasts sit 96 pt from the bottom while the sheet is open).
- The sheet **stays open**: the token and card clear, the quick row and search come back, the search field takes focus (keyboard stays up on phones only if it was up), the Added strip gains the item, and × becomes Done.
- Done / × / Escape / scrim closes; the Pantry shows the new rows flashing.

### 3.5 Change ingredient
× on the token, tapping the token, or Backspace clears the pick and the card, keeps any added items, and refocuses the search.

### 3.6 Location preset
When opened from a shelf "+", that Location is selected for every pick in this visit (the usual dot still marks the Catalog default). Picks from the camera get it too.

## 4. Pantry with Batches
Unchanged (`pantry-batches`). The header "+" opens §3.

## 5. Behaviour shared with the rest of the app
- **Finish Shopping** from the ticked bar: unchanged flow, entered from here.
- **Say it**: never records from the page or the sheet; it always teaches the Dock mic.
- **Scan / Take a photo / Scan barcode** never get their own camera: they open the app camera (`scan-screen-v3`) with a mode preselected (§6).

## 6. Camera entry points

Route: the existing Scan screen with `?mode=` (already supported) plus a new **`return=pantry-add`** parameter for the two Add paths.

| Entry | Mode | After capture |
|---|---|---|
| Empty Pantry · Scan pill, Dock camera | RECEIPT | Normal Scan Session and Review (unchanged) |
| Add sheet · Take a photo | PRODUCT | One shot, then back to the sheet (§6.2) |
| Add sheet · Scan barcode | BARCODE (new) | First code read, then back to the sheet (§6.3) |

With `return=pantry-add`:
- A pill **"Adds to your Pantry"** sits centred 12 pt under the top bar: padding 6 × 11, radius 999, rgba(155,227,143,.16), `cam-accent` text 12/700, box icon 16.
- Close returns to the sheet unchanged. The mode slider still works; moving to RECEIPT, INGREDIENTS or PLATE drops `return` and continues as a normal Scan Session.
- The photo stack and Import keep working as today (Import in PRODUCT reads one photo and returns).

### 6.1 RECEIPT
No change.

### 6.2 PRODUCT, single shot
- Shutter → the photo is read as a PRODUCT Scan. A status pill replaces the hint: spinner 14 + "Gator's reading the label…" (13/600, rgba(0,0,0,.62), radius 999, padding 9 × 14, bottom 196). Shutter disabled at .5 while reading.
- Success: back to the sheet with the matched Ingredient picked (§3.3), amount and unit = the pack size read, Note = the product name, tag "From photo". Toast "Read from your photo · check it and add".
- No match: back to the sheet with the search **prefilled with the read name**, results showing, and the Note prefilled. Toast "Couldn't match {name} · pick the closest".
- Read failure: stay in the camera, pill "Couldn't read that label. Try again or type it." with a "Type it" text button (back to the sheet, search focused).

### 6.3 BARCODE (new mode)
- Slider order becomes **RECEIPT · PRODUCT · BARCODE · INGREDIENTS · PLATE**. The prototype shows a small butter "new" superscript on the label; drop it after a release or two.
- Guide: **0.80 × screen width, 0.24 × clear-area height**, same brackets and morph as the other modes.
- A **scan line** inside the guide: 2 pt, 7 % side insets, `cam-accent` with `0 0 12px 2px rgba(155,227,143,.7)`, sweeping from 16 % to 84 % of the guide height and back, 1.4 s ease-in-out alternate; static at the middle under reduced motion. Hidden once a code is read.
- Hint under the guide: "Hold the barcode in the frame · it reads on its own".
- The Scan Language chip is hidden (a code needs no language), as in Plate.
- **Decoding** runs on live frames (the `BarcodeDetector` API where available, a WASM decoder such as ZXing otherwise); EAN-13, EAN-8, UPC-A, UPC-E. The **shutter** forces a decode of the current frame (and is the only way where live decoding isn't available). A read gives a 12 ms haptic.
- **Result card**: left/right 14, bottom 190, rgba(251,248,241,.97), `#2B2418` text, radius 18, padding 12, shadow `0 14px 34px rgba(0,0,0,.4)`, slides up 280 ms. Row: ingredient tile 46, then the code (mono 11, letter-spacing .06 em, #766A58), the product name 15.5/700 ("Zuzu milk 3.5% · 1 l"), and "{Ingredient} · {Aisle}" 12.5 #766A58. Buttons (42 pt, radius 12, 14/700, grid 1 : 1.3, gap 8): **Scan again** (#EAE1CF) and **✓ Use this** (#5F6F2E, white). `role="status"`.
  - Use this → back to the sheet: Ingredient picked, amount = pack size, Note = product name, tag "Scanned". Toast "Found by barcode · {product name}".
  - **Unknown code**: the card reads "We don't know this barcode yet", shows the code, and offers **Type it** (back to the sheet with search focused). After the Member picks and adds, the code is remembered for the Family (§8), so the next scan finds it.

## 7. Strings (en; `pantry.json` unless noted)
`empty.subtitle` "Nothing in here yet", `empty.gatorLine` (in `gator.json`) "Tell me what you have and I'll put it on the right shelf.", `empty.scan` "Scan", `empty.sayIt` "Say it", `empty.type` "Type", `empty.ticked_one/other` "{{count}} ticked on your Shopping List", `empty.moveThem` "Move them", `empty.shelfEmpty` "{{location}} is empty", `empty.hint.fridge` "Milk, eggs, cheese, leftovers", `empty.hint.freezer` "Peas, ice cream, a spare loaf", `empty.hint.cupboard` "Pasta, rice, tins, oil", `empty.hint.spices` "Paprika, cumin, oregano", `empty.addTo` "Add to {{location}}", `teach.mic.title` "Hold the mic, talk, let go", `teach.mic.line` "Try “two litres of milk and a dozen eggs, in the fridge”.", `add.title` "Add to Pantry", `add.done` "Done", `add.takePhoto` "Take a photo", `add.scanBarcode` "Scan barcode", `add.sayIt` "Say it", `add.searchPlaceholder` "Or type it, e.g. milk", `add.popular` "Popular to start", `add.added` "Added", `add.amount` "Amount", `add.usualAmount` "usual amount", `add.where` "Where it goes", `add.usualFor` "usual for {{name}}", `add.expires` "Expires", `add.usualChip` "Usual · {{value}}", `add.noDate` "No date", `add.noExpiry` "No expiry date", `add.inDays_one/other` "in {{count}} day(s)", `add.note` "Note", `add.optional` "optional", `add.addNote` "Add a note (brand, size)", `add.notePlaceholder` "Brand or size, e.g. Zuzu 3.5%", `add.save` "Add {{name}}", `add.savedToast` "Added {{name}} · {{amount}} · {{location}}", `add.fromPhoto` "From photo", `add.scanned` "Scanned", `add.photoToast` "Read from your photo · check it and add", `add.photoNoMatch` "Couldn't match {{name}} · pick the closest", `add.barcodeToast` "Found by barcode · {{name}}". In `scan.json`: `mode.barcode` "Barcode", `hint.barcode` "Hold the barcode in the frame · it reads on its own", `addsToPantry` "Adds to your Pantry", `readingLabel` "Gator's reading the label…", `labelFailed` "Couldn't read that label. Try again or type it.", `typeIt` "Type it", `barcode.scanAgain` "Scan again", `barcode.use` "Use this", `barcode.unknown` "We don't know this barcode yet", `info.barcode` (Info sheet line) "Point at a product's barcode to add it to your Pantry.". Every string needs ro and da, with `few` plurals for counts.

## 8. Data / API
- **Empty state**: no new API. The ticked count comes from the Shopping List query (checked items). Popular to start: a client constant per locale for now (8 Ingredient ids), see open questions.
- **Add sheet**: the existing Batch create endpoint. Location default = the Ingredient's Category Location; Expiry default = Default Expiry (Family override → Catalog) from today, as today.
- **PRODUCT single shot**: the existing Scan endpoint with mode `product`. The response needs, per item, the matched Ingredient (or a raw name), **`productName`**, and the **pack size** (`quantity`, `unit`) when printed. Add those fields if the reader doesn't return them yet.
- **BARCODE** (new):
  - `GET /catalog/barcodes/:code?locale=` → `{ code, ingredient: CatalogSearchResult, productName, quantity, unit, source: 'family' | 'catalog' }`, or 404.
  - `POST /catalog/barcodes` `{ code, ingredientId, productName?, quantity?, unit? }` stores a **Family-scoped** mapping (written after a Batch is added from an unknown code, or when a Member corrects a match). Family mappings join the Admin curation queue for promotion to the shared catalog, like Family Ingredients.
  - Source of shared codes is an open question (§10).
- **Query invalidation after a save**: Pantry list, Suggestions (the Ingredient leaves "Gone"), Shopping List (if a Finish Shopping ran), Health inputs.

Code touched (proposed): `apps/web/src/pages/Pantry/PantryPage.tsx` (empty branch), new `pages/Pantry/components/EmptyPantry.tsx`, `ShelfCard.tsx`, `TickedBar.tsx`; `AddBatchForm` → new `AddToPantrySheet.tsx` with `QuickAddRow.tsx`, `BatchEditorCard.tsx`, `LocationSegment.tsx`, `ExpiryChips.tsx`, `AddedStrip.tsx`; `components/AmountField` (presets); `components/catalogSearch/*` (Popular tiles in the empty panel); `AppDock` / `DockCapsule` (a `highlight?: 'mic' | 'camera'` prop that lights one half without disabling the rest); Scan page (`BARCODE` mode, guide size, scan line, result card, `return=pantry-add`, single-shot PRODUCT); `lib/catalog.ts` (`useBarcodeLookup`, `useSaveBarcode`); `i18n/locales/{en,ro,da}/{pantry,scan,gator}.json`; `packages/ui` icons (see `icons-additions.ts`). API: barcode table + two routes; PRODUCT response fields if missing.

## 9. Accessibility
- The dimmed chip row is `aria-hidden`; the shelf "+" buttons carry "Add to {Location}". The ticked bar is one button with the full sentence as its name.
- The sheet is a modal dialog; focus goes to the search on open, returns to the opener on close. The Added strip is announced through the toast (`role="status"`).
- The Location control is a group of toggle buttons with `aria-pressed`; the usual dot has the text "usual" for screen readers. Expiry chips likewise; the resolved date line is in the accessible description of the group.
- Camera: the mode slider stays a radio group (add Barcode). Reads are announced ("Found Zuzu milk 3.5%, 1 litre"). The scan line, pulse and Gator motion stop under reduced motion.
- Gator is a button with a name; the SVG is hidden.

## 10. Open questions
1. **Barcode data**: only codes learned from Families (starts empty), an open product database (e.g. Open Food Facts; licence and coverage in RO/DK to check), or both? Is a server-side lookup with caching OK?
2. Should Take a photo / Scan barcode allow several items in one camera visit (photo stack, a list of reads), or always return after one, as prototyped?
3. **Freezer and expiry**: choosing Freezer for a fridge Ingredient (chicken, usual 2 d) keeps the fridge Default Expiry. Should Default Expiry be per Location (e.g. freezer 3 mo), switching "Usual" when the Location changes?
4. Popular to start: a fixed list per locale, or the most-added Ingredients across Families?
5. Product Description folded behind "Add a note" for typed picks: OK, or keep it always visible?
6. A Location filter that's empty in a non-empty Pantry (e.g. Spices 0): reuse a single shelf card from §2.5? Not prototyped.

## 11. Screens (`png/`)

| # | File | Shows |
|---|---|---|
| 01 | `01-empty-pantry` | Empty Pantry, Warm, with 4 ticked items |
| 02 | `02-empty-pantry-no-ticked` | Same without ticked items (no bar) |
| 03 | `03-say-it-callout` | Say it: mic half lit, callout |
| 04 | `04-add-sheet` | Add sheet: quick row, search, Popular to start, aisles |
| 05 | `05-add-search` | Search "pa" |
| 06 | `06-add-picked` | Parmesan picked: token, Amount, Where it goes, Expires |
| 07 | `07-add-note` | Note open |
| 08 | `08-add-added-strip` | After saving: Added strip, Done, toast |
| 09 | `09-camera-product` | Camera on PRODUCT, "Adds to your Pantry" |
| 10 | `10-camera-reading` | Reading the label |
| 11 | `11-add-from-photo` | Back in the sheet: "From photo", pack size, note |
| 12 | `12-camera-barcode` | Camera on BARCODE |
| 13 | `13-camera-barcode-found` | Barcode result card |
| 14 | `14-add-from-barcode` | Back in the sheet: "Scanned" |
| 15 | `15-pantry-after-adds` | Pantry list after the adds |
| 16 | `16-add-from-freezer-shelf` | Opened from the Freezer shelf: Freezer preset, usual dot on Fridge |
| 17 | `17-camera-receipt` | Camera on RECEIPT from the empty Pantry |
| 18 | `18-empty-pantry-dark` | Empty Pantry, Dark |
| 19 | `19-add-picked-dark` | Add sheet with a pick, Dark |
| 20 | `20-empty-pantry-minimal` | Empty Pantry, Minimal |

The screenshots are rendered with reduced motion (Gator at rest, the scan line static) and with fallback fonts, because the capture environment couldn't load Google Fonts. Check type against `prototype.html`, which loads Fraunces / Instrument Sans (Warm), Schibsted Grotesk / Figtree (Minimal) and Sora / Albert Sans (Dark). The camera scenes (receipt, yogurt tub, barcode label) are drawings standing in for the live feed.
