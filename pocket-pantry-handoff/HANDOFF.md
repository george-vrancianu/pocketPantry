# Pocket Pantry — Build Handoff (React web app)

Instructions for Claude Code: read this file first, then use the files in `design-source/` as the visual reference for each screen. Rebuild the screens as React components. Don't port the `.dc.html` files directly: they use a design-tool runtime (`<x-dc>`, `<sc-for>`, `{{holes}}`) that is not part of the app.

## 1. Product summary

Pocket Pantry is a mobile-first kitchen app. It has five areas:

| Area | Purpose |
|---|---|
| **Dashboard (Home)** | Customisable widget grid, like a phone's home screen |
| **Shopping list** | Grouped checklist; bought items can be moved into the pantry |
| **Pantry** | Inventory by storage place, with expiry tracking |
| **Recipes** | Recipes ranked by how many ingredients you already have |
| **Scan** | Camera with 4 modes: Product, Receipt, Plate, Ingredients |

**Core layout idea:** the app feels like a phone home screen. A floating **dock** at the bottom holds the 4 main destinations, in this order: **Shopping · Pantry · Recipes · Scan**. Scan is always highlighted (filled accent). The Dashboard is "home": you reach it from the Home button in each screen's header, not from the dock.

Targets: phones first (390 px reference), up to tablets and small laptops (~1280 px).

## 2. Suggested stack

- React 18 + TypeScript + Vite
- React Router (routes below)
- Plain CSS Modules or Tailwind. Either way, use the tokens in §4 as CSS variables.
- State: Zustand or React Context + `useReducer`; persist to `localStorage` for v1
- Camera: `navigator.mediaDevices.getUserMedia` (scan). Barcode decoding: `BarcodeDetector` with a fallback such as `@zxing/browser`. Receipt, plate and ingredient recognition are backend/AI calls; stub them for now.
- Drag-to-reorder widgets: `@dnd-kit/core` + `@dnd-kit/sortable`

## 3. Routes and screens

| Route | Design file | Notes |
|---|---|---|
| `/` | `Main.dc.html` | Dashboard: header (date, greeting, Customise button), widget grid, page dots, dock |
| `/customise` | `EditDashboard.dc.html` | Edit mode. No dock. "Done" returns to `/` |
| `/pantry` | `Pantry.dc.html` | Search, filter chips, sections per location |
| `/recipes` | `Recipes.dc.html` | Segmented control: Cook now / Saved / Explore |
| `/shopping` | `Shopping.dc.html` | Summary + "Move to pantry", add-item input, grouped checklist |
| `/scan` | `Scan.dc.html` | Dark full-screen camera UI; the dock switches to its dark variant |
| (≥ 900 px) | `Tablet.dc.html` | The dashboard at tablet/laptop width: 4-column grid, centred dock |

Sub-screens share a header: Home button (44 px circle, left), H1 title, one action button (right): add, search or share.

## 4. Design tokens

```css
:root {
  /* colour */
  --bg: #EEF1EA;            /* app background (sage paper) */
  --surface: #FFFFFF;
  --ink: #17231C;           /* primary text, dark buttons */
  --muted: #55635A;         /* secondary text */
  --line: #DCE3D8;          /* borders */
  --divider: #EEF1EA;       /* row separators */
  --accent: #2E6A4D;        /* basil green: primary actions, Scan */
  --accent-hover: #1F4D37;
  --accent-tint: #DDEBE2;   /* active dock pill, tags */
  --accent-mid: #8DBBA0;
  --accent-soft-on-dark: #CFE3D7;
  --butter: #F3D27A;        /* shopping widget */
  --butter-ink: #4A3B0B;
  --urgent-bg: #FBE6DA;  --urgent-fg: #B54A17;   /* expires today / remove */
  --soon-bg:   #F6EBC8;  --soon-fg:   #6E5200;   /* 1–3 days */
  --ok-bg:     #EEF1EA;  --ok-fg:     #55635A;   /* later */
  --camera-bg: #101813;  --camera-surface: #1C2922; --camera-line: #2E3D34; --camera-muted: #B8C4BC;

  /* type */
  --font-display: 'Bricolage Grotesque', sans-serif;  /* headings, big numbers */
  --font-body: 'DM Sans', sans-serif;

  /* radius */
  --r-dock: 26px; --r-widget: 22px; --r-card: 20px; --r-input: 16px; --r-chip: 999px;

  /* shadow */
  --shadow-dock: 0 10px 30px rgba(23,35,28,0.12);
}
```

Google Fonts:
`https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap`

Type scale: H1 (dashboard) 30/700 display, −0.02em · H1 (sub-screen) 28/700 · widget big number 40/700 display · card title 20–22/700 display · body 15/500–600 · meta 12–13 muted · section label 12/700 uppercase, 0.06em tracking, muted.

Spacing: 20 px page gutter (phone), 12 px widget gap, 48 px gutter and 16 px gap on tablet. Touch targets are ≥ 44 px everywhere.

## 5. Components

- **`<Dock active>`**: fixed, `left/right/bottom: 16px`, height 76, translucent white, 1px `--line` border, `--shadow-dock`, 4 equal columns. Each item: icon in a 52×32 pill + 11 px label. The active item gets `--accent-tint` pill + `--accent` text. Scan's pill is always `--accent` with a white icon. Variant `dark` for `/scan`. On ≥ 900 px: centred, width 520, height 84. Use `<nav aria-label="Main">`, links with `aria-current="page"`. Pad page content at the bottom (~110 px) so nothing hides under it.
- **`<ScreenHeader title action>`**: Home link + title + one icon button (each with an `aria-label`).
- **`<ExpiryChip days>`**: 0 → "Today" urgent · 1–3 → soon · else ok (shows days or date).
- **`<WidgetCard size>`**: sizes `small` (1×1) and `wide` (2×1). Tall `2×2` is used on tablet only.
- **`<SearchField>`**, **`<FilterChips>`** (40 px tall, active = ink fill), **`<SegmentedControl>`**, **`<ProgressBar>`** (6 px, accent fill), **`<ChecklistItem>`** (whole row is a `<button aria-pressed>`; checked = accent box + strikethrough).
- **Icons**: simple 24 px line icons at 1.8 stroke. `lucide-react` is a good match (shopping-bag, archive/jar, book, camera, scan-barcode, receipt, circle-dot for plate, leaf, home, search, plus, share, zap, image, pencil, grip-vertical, minus, clock).

## 6. Dashboard widgets

Widget registry (type → component, allowed sizes):

| Widget | Default size | Content |
|---|---|---|
| Use soon | wide | Top 3 items by soonest expiry + ExpiryChip; "See all" → /pantry |
| Cook tonight | wide | Accent-filled card: photo, recipe name, time, "uses N items expiring" → recipe |
| Shopping | small | Butter background; count of unchecked items; first few names → /shopping |
| Pantry stock | small | Total items; stacked bar Fridge/Freezer/Cupboard |
| Quick scan | wide | 4 tiles → `/scan?mode=product|receipt|plate|ingredients` |
| Meal plan | wide | 7-day strip; today highlighted ink; empty days dashed with "+" |
| Budget | small | Spent vs monthly budget + bar (amount is a placeholder for now) |
| Nutrition | small | 3 bars (protein / carbs / fat) |
| Recipe of the day | small/wide | Suggested recipe |

Layout state: `{ widgets: { id, type, size }[] }`, saved to storage. Grid: 2 columns on phone, 4 on tablet (`grid-auto-flow: dense`). Page dots are for later "multiple pages"; one page is fine for v1.

**Customise screen:** "On your dashboard" list (drag handle, icon, name, size toggle Small/Wide, remove button) plus an "Add widgets" gallery (2-col cards with mini preview + add button). Changes apply live; Done → `/`.

## 7. Screen behaviour

**Pantry:** search filters by name. Chips: All / Fridge / Freezer / Cupboard / Spices, with counts. Sections are grouped by location and sorted by expiry. Each row shows a coloured initial tile, name, quantity + note, and an ExpiryChip. "+" opens add-item (manual form; it also offers Scan).

**Recipes:** "Cook now" ranks by `have / needed` ingredients, boosting recipes that use items expiring soon. Featured card on top (photo, "All N ingredients" badge, "Uses N expiring" badge). List rows show a thumbnail, name, time, missing items, ProgressBar, and `have/needed`. Later: an "Add missing to shopping list" action.

**Shopping:** a summary card ("N to buy", "X of Y in your basket", ProgressBar) with **Move to pantry**, which moves checked items into the pantry with default expiry and removes them from the list. Add-item input. Groups: Produce, Dairy, Bakery & dry (by category). An item can carry a recipe tag (e.g. "Orzo") showing which recipe added it.

**Scan:** dark UI with a close button (→ previous screen / home), a title "Scan {mode}", and a flash toggle. Viewfinder: 280×300 with corner brackets and a scan line. Hint + detail text change by mode:

| Mode | Hint | Detail | Result |
|---|---|---|---|
| Product | Point at a barcode or label | Adds it to your pantry with its best-before date. | Confirm sheet → pantry item |
| Receipt | Fit the whole receipt in the frame | Adds every item from your shop in one go. | Review list → bulk add; tick off matching shopping items |
| Plate | Hold steady above your plate | Logs the meal and takes what you used out of the pantry. | Meal log + pantry deductions to confirm |
| Ingredients | Spread items out on the counter | Recognises loose produce and suggests recipes. | Detected items → add to pantry / see recipes |

Controls: mode pills (active = white fill, ink text), gallery picker on the left, 76 px shutter in the centre, manual add on the right. Dark dock below.

## 8. Data model (v1)

```ts
type Location = 'fridge' | 'freezer' | 'cupboard' | 'spices';
interface PantryItem { id: string; name: string; qty: string; note?: string; location: Location; expiresOn?: string /* ISO */; }
interface ShoppingItem { id: string; name: string; qty: string; category: string; checked: boolean; recipeTag?: string; }
interface Recipe { id: string; name: string; minutes: number; servings: number; tags: string[]; ingredients: { name: string; qty: string }[]; image?: string; }
interface WidgetInstance { id: string; type: WidgetType; size: 'small' | 'wide' | 'tall'; }
type ScanMode = 'product' | 'receipt' | 'plate' | 'ingredients';
```

Seed data matching the designs: yogurt (today), spinach (1 day), chicken thighs (2 days), milk (4 days), feta (6 days), orzo, chickpeas; recipes: Spinach & feta orzo, Chickpea & tomato curry, Lemon chicken traybake, Yogurt flatbreads; 10 shopping items with milk, sourdough and oats checked.

## 9. Responsive rules

- `< 600 px`: 2-col widget grid, full-width dock (16 px inset), 20 px gutters.
- `600–899 px`: 3-col grid, dock max-width 480, centred.
- `≥ 900 px`: 4-col grid with tall widgets allowed, dock width 520, 48 px gutters. Pantry, Recipes and Shopping go to a centred max-width ~960 px; Recipes uses a 2–3 column card grid.
- The camera screen stays full-bleed at every size.

## 10. Accessibility

Real `<button>`, `<a>` and `<input>`+`<label>` elements; `aria-label` on every icon-only button; `aria-pressed` for toggles and chips; text contrast ≥ 4.5:1 (the tokens above pass); visible focus rings (2 px `--accent` outline, 2 px offset); respect `prefers-reduced-motion` for the scan line and widget drag animations.

## 11. Suggested build order

1. Tokens, fonts, layout shell, Dock, routes
2. Dashboard with a static widget registry
3. Pantry, Shopping (with Move to pantry), Recipes matching
4. Customise (reorder/resize/add/remove + persistence)
5. Scan UI with camera + barcode; stub the AI modes behind an interface
6. Tablet/laptop breakpoints
