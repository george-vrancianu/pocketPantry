# Pocket Pantry: Receipt Review ("Verificare") Handoff

Instructions for Claude Code: this file is the full spec for the receipt review screen, the step after a receipt scan where the user checks and adjusts the detected items before saving them to the pantry. Build it as a React + TypeScript component that fits the existing app. It replaces the old one-big-card-per-item layout. UI copy stays in **Romanian** (strings in §8).

There are two layouts of the same component:

- **Phone (< 900 px):** a compact 4-column table; rows open into an edit panel.
- **Tablet / laptop (≥ 900 px):** a full-width table. Items that need checking are edited directly in their row; confident items are read-only rows.

---

## 1. Goals (what was wrong before)

1. Each item took ~340 px of height, even when the scan was confident. **Confident rows must be one line (~54 px) and collapsible.**
2. The page felt empty and form-heavy. **Present items as a clean table with summary counters.**
3. Problems must be obvious: items with low confidence or missing data sort to the top and are already open for editing.

---

## 2. Data model

```ts
type Unit = 'g' | 'kg' | 'ml' | 'L' | 'buc.';
type Location = 'Frigider' | 'Congelator' | 'Dulap' | 'Condimente';
type Confidence = 'high' | 'low';

interface ReceiptLine {
  id: string;
  receiptText: string;        // raw text from the receipt, e.g. "Crema de alune"
  matchName: string;          // matched pantry product, e.g. "Unt de arahide"
  matchId?: string;
  qty: number | null;         // null = not detected
  unit: Unit;
  location: Location;
  expiresOn: string;          // ISO date "2027-10-08"
  confidence: Confidence;
}

interface ReviewState {
  lines: ReceiptLine[];        // lines that will be saved
  excluded: ReceiptLine[];     // non-food / unreadable lines (and lines the user removed)
  open: Record<string, boolean>;       // expanded rows
  confirmed: Record<string, boolean>;  // user confirmed → treated as "ok"
  sureGroupOpen: boolean;              // default true
}
```

### Derived row status

```ts
type RowStatus = 'low' | 'qty' | 'ok';
function statusOf(l: ReceiptLine, confirmed: boolean): RowStatus {
  if (confirmed) return 'ok';
  if (l.confidence === 'low') return 'low';
  if (l.qty == null) return 'qty';
  return 'ok';
}
```

- `low`: the match is uncertain → red/orange.
- `qty`: the match is confident but the quantity is missing → amber. *(Before, these were shown as "fine" even with an empty quantity.)*
- `ok`: confident and complete → green.

### Groups and order

- **"De verificat"** = rows with status `low` or `qty`. Order: `low` first, then `qty`, then receipt order. Hidden when empty.
- **"Sigure"** = rows with status `ok`, in receipt order. The whole group can be collapsed.
- **"Excluse"** = `excluded.length`, always shown last as one collapsed row.

### Default expansion

- When the screen opens, every `low` row is **expanded**. `qty` and `ok` rows are **collapsed**.
- **Confirmă** sets `confirmed[id] = true` and collapses the row, so it moves to "Sigure".
- **Elimină** (delete) moves the line to `excluded`; the counters update.

---

## 3. Design tokens (same as the rest of the app)

```css
--bg:#EEF1EA; --surface:#FFFFFF; --ink:#17231C; --muted:#55635A;
--line:#DCE3D8; --divider:#EEF1EA; --subtle:#F7F9F5; --chip-neutral:#E2E8DD;
--accent:#2E6A4D; --accent-tint:#DDEBE2;
--urgent-bg:#FBE6DA; --urgent-fg:#B54A17; --urgent-row:#FDF3EC; --urgent-border:#F2CDB8;
--soon-bg:#F6EBC8;   --soon-fg:#6E5200;   --soon-row:#FBF5E1;   --soon-icon:#8A6700; --soon-border:#E3B94B;
--font-display:'Bricolage Grotesque',sans-serif; --font-body:'DM Sans',sans-serif;
```

Row background by status **when the row is expanded** (phone) or always (tablet):
`low → --urgent-row`, `qty → --soon-row`, `ok → --subtle` (phone expanded only; tablet ok rows stay white).

Status icons (`lucide-react`): `low` → `TriangleAlert` (urgent-fg) · `qty` → `CircleAlert` (soon-icon) · `ok` → `CircleCheck` (accent). 18 px phone, 20 px tablet, stroke 2. Each icon needs an `aria-label` (see §8).

---

## 4. Phone layout (reference width 390 px)

From top to bottom; page background `--bg`, 20 px side gutters.

### 4.1 Header
- Home button: 44 px circle, white, 1 px `--line` border, house icon, `aria-label="Acasă"`.
- H1 **"Verificare"**: display font, 28/700, letter-spacing −0.02em.
- Subtitle under it: **"Bon scanat · {N} linii citite"**, 13 px muted. N = lines + excluded.

### 4.2 Summary counters
3-column grid, 8 px gap, 14 px below the header:

| Tile | Style | Value |
|---|---|---|
| **de salvat** | white, 1 px `--line` border | `lines.length` |
| **de verificat** | `--urgent-bg` background, `--urgent-fg` text | rows in "De verificat" |
| **excluse** | `--chip-neutral` background, muted text | `excluded.length` |

Tile: radius 16, padding 10×12, number 24/700 display font, label 12/600.

### 4.3 Table card
White, 1 px `--line` border, radius 20, `overflow:hidden`, 14 px below the counters.

**Shared column grid** (header row and item rows):
```css
grid-template-columns: minmax(0,1fr) 56px 60px 58px;
gap: 8px; padding: 0 12px;
```
Columns: **Produs | Cant. | Locație | Expiră**.

- **Header row:** 36 px tall, 11/700 uppercase muted, letter-spacing 0.05em. Hidden from screen readers (rows carry the meaning).
- **Group header row:** min 40 px, `--subtle` background, top border `--divider`. Label `"{TITLU} · {count}"` in 12/700 uppercase, 0.06em letter-spacing; colour `--urgent-fg` for "De verificat", `--accent` for "Sigure". "Sigure" has a text button on the right, **"Restrânge" / "Arată"** (36 px tall, accent, 13/700, `aria-expanded`).
- **Collapsed "Sigure" group:** instead of rows, one line of muted 13 px text listing the product names: `"Fasole roșie, Unt"`.

**Item row (collapsed):** the entire row is one `<button aria-expanded>`, min-height 54 px, padding 8×12, top border `--divider`.
- Produs cell: status icon + two lines:
  - `matchName`: 14/700, one line, cut off with "…" if too long
  - `"Pe bon: {receiptText}"`: 11 px muted, one line, cut off with "…"
- Cant. cell: `"{qty} {unit}"` 13/600, no wrap. **If qty is null:** amber pill `"? {unit}"` (`--soon-bg` / `--soon-fg`, 12/700, radius 999).
- Locație cell: 12 px, cut off with "…".
- Expiră cell: short date **`dd.MM.yy`**, 12 px, `font-variant-numeric: tabular-nums`.

**Expanded edit panel** (below the row button, same background as the row, padding 2 12 14):
1. Message line (12/600), only for `low` or `qty`:
   - low: **"Încredere scăzută: verifică potrivirea"** in `--urgent-fg`
   - qty: **"Lipsește cantitatea"** in `--soon-fg`
2. 2-column grid, 8 px gap. Every field is 40 px tall, radius 12, white, 1 px `--line` border, 14 px text, with an 11/600 muted label above it:
   - **Potrivire în cămară** (spans both columns): a button showing `matchName` plus a right-aligned swap icon and **"Schimbă"** (accent 12/700). It opens the product picker to change the match.
   - **Cantitate**: number input (`inputMode="decimal"`, placeholder "0") joined to a unit `<select>` (`aria-label="Unitate"`, `--subtle` background, divider on the left) inside one bordered box. When qty is missing, the border is `--soon-border`.
   - **Locație**: `<select>` of the 4 locations.
   - **Data expirării**: date input showing `dd.MM.yyyy` (a native `type="date"` is fine if the locale formats it this way; otherwise use a text input with a mask and placeholder "zz.ll.aaaa").
   - **Actions** (the 4th cell, aligned to the bottom): a 40×40 delete icon button (white, `--urgent-border` border, `--urgent-fg` trash icon, `aria-label="Elimină {matchName}"`), then a **Confirmă** button filling the remaining width (accent fill, white 14/700, radius 12). For rows that are already `ok`, the button reads **"Gata"**.

**Excluded row** (last in the card): a full-width button, min 52 px, `--subtle` background. Two lines on the left: **"EXCLUSE · {n}"** (12/700 uppercase muted) and **"Linii nealimentare sau necitite"** (12 px muted). **"Arată"** on the right (accent 13/700). Tapping it opens a simple list of excluded lines, each with a **"Adaugă înapoi"** action.

### 4.4 Sticky action bar
Fixed to the bottom; white with a top border `--line`; padding 12 20 24 (add `env(safe-area-inset-bottom)`).
- **Renunță**: 48 px, white, 1 px border, 15/700.
- **Salvează {n} articole**: fills the remaining width, 48 px, accent fill, white 15/700, radius 16.
- Add ~100 px of bottom padding to the scrolling content so the bar never covers the last row.
- There is no app dock on this screen (it is a modal step in the scan flow).

---

## 5. Tablet / laptop layout (≥ 900 px; reference 1180 px)

Padding 32 × 40.

### 5.1 Header (one row)
Home button (48 px) · H1 "Verificare" 34/700 + subtitle 14 px · on the right, three **counter chips** (36 px tall, radius 18): `"{n} de salvat"` (white + border), `"{n} de verificat"` (urgent), `"{n} excluse"` (neutral); the number is bold display font 16 px.

### 5.2 Table
White card, radius 24, 24 px below the header.

```css
grid-template-columns: 24px minmax(0,1fr) 150px 150px 150px 120px 92px;
gap: 16px; padding: 0 20px;
```
Columns: *(status icon)* | **Produs** | **Cantitate** | **Locație** | **Expiră** | **Încredere** | *(actions)*. The header row is 44 px tall, with the same uppercase styling as on phone.

- **Rows to check (`low` / `qty`):** min 68 px, tinted background (`--urgent-row` / `--soon-row`). They are **always editable in the row**: quantity + unit box, location select, date input (each 40 px, radius 12). Produs shows `matchName` 15/700 with `"Pe bon: …"` 12 px muted below it.
- **Sigure rows (`ok`):** min 52 px, white, **read-only text** (values indented 12 px so they line up with the inputs above). Produs shows the name and `"Pe bon: …"` on one line. Clicking the row or the pencil button turns that row into inputs.
- **Încredere column:** a pill (12/700, radius 999):
  - `low` → **"Scăzută"** (urgent)
  - `qty` → **"Fără cantitate"** (soon)
  - `ok` → **"Ridicată"** (`--accent-tint` / `--accent`)
- **Actions column:** 40×40 icon buttons.
  - Rows to check: swap match (bordered, accent) + delete (urgent border).
  - Sure rows: edit (pencil) + delete, borderless, muted.
- The group header rows and the "Excluse" row work as on phone, spanning the full width.

### 5.3 Footer
A bottom row inside the page: helper text on the left, **"Rândurile sigure sunt restrânse. Atinge un rând ca să-l editezi."** (13 px muted); on the right, **Renunță** and **Salvează {n} articole** (48 px).

---

## 6. Behaviour

- **Save:** `Salvează {n} articole` saves `lines` (with edits) to the pantry. If any rows are still `low`, the save still goes through (the user has seen them), but log it in analytics. Optional: show a toast, "2 articole încă neverificate", with an "Anulează" (undo) action.
- **Validation:** qty must be > 0 if entered; the date must be valid. Errors appear inline under the field (12 px, urgent colour) and don't block the other rows.
- **Editing an `ok` row and changing a value** keeps it `ok`.
- **Swapping the match** opens the product search sheet; the chosen product sets `matchName`/`matchId` and suggests default location and expiry.
- **Removing a line** moves it to Excluse; it can be added back from there.
- **Focus:** when a row expands, focus moves to the first empty field (qty if missing), otherwise to the Potrivire button. When it collapses, focus returns to the row button.
- **Animation:** expand/collapse height over 150–200 ms; disabled under `prefers-reduced-motion`.
- **Dates:** store them as ISO; show `dd.MM.yy` in collapsed phone rows and `dd.MM.yyyy` everywhere else (locale `ro-RO`). *Note: the old screen showed month-first dates, which are ambiguous for Romanian users.*

---

## 7. Accessibility

- Every collapsed row is a single `<button aria-expanded>`; the panel has an `id` that the button points to with `aria-controls`.
- Status icons have `role="img"` + `aria-label` (§8). Colour is never the only signal: the icon shape differs (triangle / circle-alert / circle-check) and the tablet adds a text pill.
- Every input has a visible `<label>`; the unit select has `aria-label="Unitate"`; icon-only buttons have `aria-label`s that include the product name.
- Touch targets ≥ 40 px (44 px for primary buttons). Text contrast ≥ 4.5:1 with the tokens above.
- On tablet, the table can be a real `<table>` with editable cells, or the grid with `role="table"`/`row`/`cell`. Pick one and stay consistent.

---

## 8. Copy (ro-RO)

| Key | Text |
|---|---|
| title | Verificare |
| subtitle | Bon scanat · {n} linii citite |
| counter.save / check / excluded | de salvat / de verificat / excluse |
| col.product / qty / location / expiry / confidence | Produs / Cant. (phone), Cantitate (tablet) / Locație / Expiră / Încredere |
| group.review / group.sure | De verificat / Sigure |
| group.collapse / group.expand | Restrânge / Arată |
| row.receiptPrefix | Pe bon: {text} |
| msg.low / msg.qty | Încredere scăzută: verifică potrivirea / Lipsește cantitatea |
| field.match / qty / unit / location / expiry | Potrivire în cămară / Cantitate / Unitate / Locație / Data expirării |
| action.swap / remove / confirm / done | Schimbă / Elimină {name} / Confirmă / Gata |
| pill.low / pill.qty / pill.ok | Scăzută / Fără cantitate / Ridicată |
| icon.low / icon.qty / icon.ok | Încredere scăzută / Lipsește cantitatea / Încredere ridicată |
| excluded.title / hint / show / restore | Excluse · {n} / Linii nealimentare sau necitite / Arată / Adaugă înapoi |
| footer.cancel / save | Renunță / Salvează {n} articole |
| tablet.helper | Rândurile sigure sunt restrânse. Atinge un rând ca să-l editezi. |

Plural note: in Romanian, numbers from 20 up take "de" ("20 de articole"). Use `Intl.PluralRules('ro')` or i18n plural forms for "articol/articole".

---

## 9. Sample data (matches the design)

```ts
const lines: ReceiptLine[] = [
  { id:'arahide', matchName:'Unt de arahide', receiptText:'Crema de alune',     qty:null, unit:'g',    location:'Dulap',    expiresOn:'2027-10-08', confidence:'low'  },
  { id:'bere',    matchName:'Bere',           receiptText:'Bere Stella Artois', qty:1,    unit:'buc.', location:'Dulap',    expiresOn:'2027-04-06', confidence:'low'  },
  { id:'lapte',   matchName:'Lapte',          receiptText:'Lapte integral',     qty:null, unit:'L',    location:'Frigider', expiresOn:'2026-10-15', confidence:'high' },
  { id:'fasole',  matchName:'Fasole roșie',   receiptText:'Piept de pui dezosat', qty:650, unit:'g',  location:'Dulap',    expiresOn:'2028-10-07', confidence:'high' },
  { id:'unt',     matchName:'Unt',            receiptText:'Unt',                qty:180,  unit:'g',    location:'Frigider', expiresOn:'2026-11-07', confidence:'high' },
];
// + 7 excluded lines
```

⚠️ **Matching bug to check:** "Fasole roșie" (red beans) was matched to the receipt line "Piept de pui dezosat" (boneless chicken breast) **with high confidence**. Check the matcher; a match whose name has almost no overlap with the receipt text should drop to `low`.

---

## 10. Suggested component structure

```
<ReceiptReviewScreen>
  <ReviewHeader />                 // title, subtitle, (tablet) counter chips
  <ReviewCounters />               // phone only
  <ReviewTable layout="phone|tablet">
    <ReviewGroup kind="review|sure" collapsible={kind==='sure'}>
      <ReviewRow line status open onToggle>     // phone: collapsed button + <RowEditPanel/>
        <RowEditPanel />                         // tablet: inline cells instead
      </ReviewRow>
    </ReviewGroup>
    <ExcludedRow count onOpen />
  </ReviewTable>
  <ReviewActionBar count onSave onCancel />
</ReceiptReviewScreen>
```

Use a `useReceiptReview(initialLines, initialExcluded)` reducer hook. Actions: `toggle(id)`, `confirm(id)`, `remove(id)`, `restore(id)`, `update(id, patch)`, `toggleSureGroup()`. Selectors: `groups`, `counts`. Choose the layout with a `matchMedia('(min-width: 900px)')` hook.

## 11. Done when

- [ ] Phone: confident rows render as single ~54 px rows; the "Sigure" group collapses to one summary line.
- [ ] Low-confidence rows start expanded; missing-quantity rows show the amber "? unit" pill and start collapsed.
- [ ] Confirm moves a row from "De verificat" to "Sigure"; delete moves it to Excluse; all counters and the Save label update live.
- [ ] Tablet: the review rows are editable in place; the sure rows are read-only until edit is clicked.
- [ ] Dates show as `dd.MM.yyyy` (phone collapsed: `dd.MM.yy`).
- [ ] Keyboard and screen-reader pass (§7); the action bar never covers the last row; the safe area is respected.
