# Meal Plan widget — design handoff

> **Changed after approval (2026-10-15).** Agreed in grilling after this handoff was approved: see #324 and [ADR 0012](../../adr/0012-meal-plans-are-saved-family-schedules.md). Where this note and the sections below disagree, follow this note.
>
> - **Terms**: Mealtime (Breakfast, Lunch, Dinner) and Plan Slot, not "Meal Slot" and "Meal Plan Entry".
> - **Saved Meal Plan**: the table is `meal_plan_slots` under a saved `meal_plans` row (start date, 1 to 7 days, Servings), not a stand-alone `meal_plan_entries` table where plan length is whatever dates have entries. Slots store a day number relative to the plan's start date, not a date. Plans belong to the Family and never overlap. There is no created-by column, which overrides `created_by` in §6.1.
> - **Add**: a plan-scoped server action (the Widget's window, one plan, one date, or one Ingredient), not the Shopping List bulk-add endpoint, which can't carry Source Recipes. The server works out the forecast again, sums shortfalls in g, ml or pcs, adds kg or l at 1000 or more, and returns the created item ids for Undo (ADR 0012). This overrides §5.3 and the bulk-add mention under "Code touched".
> - **Uncertain lines**: a line covered by a Batch with no quantity is `uncertain` after the first use. It shows on the line in the popover ("amount unknown"), is never a bar colour, and never makes the slot short.
> - **Unavailable slots**: a slot whose Recipe was archived shows an empty-outline bar and a "No longer available" tag, and is left out of the forecast, the plan tag and Add, instead of being dropped.
> - **Empty states** add "Next plan starts {date}" and, for a day outside every plan, "Start a plan".
> - **Legend**: hidden once the Member has opened a popover on this device.
> - **Open questions (section 10), answered**: no "Cooked" state in this version; today's slots count all day; the glossary terms are as above; sharing a column component with the expiry strip is left to the implementer.
> - `planCoverage.ts`, `schema-additions.ts` and `icons-additions.ts` are reference material, not code to paste in. The forecast belongs on the API so ADR 0007's comparable-unit logic stays in one place.

Status: approved (variant A · Week columns, window = planned days only), ready for implementation. Date: 2026-10-15.
Reference prototype: `prototype.html` in this folder (self-contained, open in a browser; live at https://claude.ai/artifact/NwaCi1S2XdD4MqoJnxDmRb). A opens by default; B and C stay in the file for comparison only. The left panel sets **Days planned** (1–7) and resets the sample Pantry (Runs short midweek / All covered); the + buttons and Add buttons change the sample and the widget updates live. Ignore the "Always 7" window option: it was not chosen.

Code touched: `apps/web/src/pages/Dashboard/widgets/PlaceholderWidgets.tsx` (remove the static Meal Plan placeholder), new `widgets/MealPlanWidget.tsx` and `components/MealPlanPopover/*`, `widgets/registry.ts` + `types.ts` (type `mealPlan` becomes real, wide only), `pages/Customise/WidgetPreview.tsx`, `i18n/locales/{en,da,ro}/dashboard.json`. Reuses `WidgetCard`, `Tag`, the snackbar with Undo, and the Shopping List bulk-add endpoint. API: new Meal Plan Entry table + read endpoint with coverage (§6), needs schema review.

Files in this folder:

| File | What it is |
|---|---|
| `handoff.md` | This spec |
| `prototype.html` | Interactive reference (variants A–C, three themes) |
| `planCoverage.ts` | Pure reference implementation of §4–§5: `planCoverage()` (days, meal and day statuses, issues with reason codes, plan tag) and `missingItems()` (what Add sends). Checked against the prototype's sample: same statuses, shortfalls and reasons |
| `schema-additions.ts` | Proposed Drizzle table `meal_plan_entries` + `meal_slot` enum (§6.1) and the `GET /meal-plan` response shape (§6.2) |
| `icons-additions.ts` | New `bang` icon (short marker) and `calendar` (from the expiry handoff), to merge into `icons.tsx` |

Comes from SPEC story 69 (placeholder Meal Plan widget). Notes: `claude/meal-plan-widget-notes.md`.

---

## 1. Summary

A **Meal plan** Widget showing the Family's plan for the next 1–7 days as one column per planned day. Each column has three slot bars (Breakfast, Lunch, Dinner), coloured by whether the Pantry covers that meal **after the meals before it have taken their share**. The header says how many meals are short; the footer names what is missing and adds it all to the Shopping List in one tap. Tapping a day opens a **popover** anchored to that column with the day's meals, what each is short of and why, and per-line or per-day add buttons.

## 2. Widget

Type `mealPlan`, size **wide only** (no small size; Customise hides the size toggle for it). `WidgetCard` (card tokens, padding 12 14 14, 10 pt gap).

### 2.1 Header
- Left: a `button` in the widget label style (11.5/700 caps, .07 em, `--muted`): `calendar` icon 15 px, "Meal plan · {n} days", `chevron-right` 13 px at 60 % opacity. Goes to the Meal Plan page (`/meal-plan`, out of scope here; until it exists, hide the chevron and make the label plain text).
- Right: the **plan tag** (§4.3).

### 2.2 Week columns
- Grid with one column per **planned day** (`repeat(n, minmax(0,1fr))`), 4 pt gap. Planned days = today … today + 6 that have at least one Meal Plan Entry **or** fall before the last day that has one (so a gap day inside the plan shows as "nothing planned"). n = 1–7.
- Each column is a `button` (`aria-haspopup="dialog"`, `aria-expanded`), radius `--r-ctl` − 1, padding 7 2 8, 6 pt gap, contents centred:
  - Weekday 11/700 caps, .04 em, `--muted` ("Today" for today, otherwise 3-letter short weekday from `Intl`).
  - Day of month: display face 17, `tabular-nums`.
  - **Slot bars**: three bars stacked (B, L, D top to bottom), each 7 pt tall, radius 3, 3 pt gap, max width 30 pt. Fill by meal status (§4.1): covered `--accent`; short `--urgent-fg`; on list = hatch `repeating-linear-gradient(135deg, var(--star) 0 3px, var(--soon-bg) 3px 6px)`; no meal in that slot = transparent with a 1 pt inset `--divider` outline.
  - **Day mark** (16 pt circle): covered → `--accent-tint` with `check` 10 px `--accent-on-tint`; one short meal → `--urgent-fg` with `!` in `--card-bg`; 2–3 short meals → `--urgent-fg` with the count (10/800); all shortfalls on list → `--soon-bg` with `basket` `--soon-fg`; nothing planned → 1.5 pt inset `--line-strong` ring.
  - **n ≤ 3 only**: the Dinner Recipe title (or the last planned meal) under the bars, 11.5/600, centred, 2-line clamp, min-height 2.5 em; "Nothing yet" in `--muted` for an empty day.
- States: today = `--accent-tint` background, weekday in `--accent-on-tint`; hover `--subtle`; open (popover showing) = `--chip`; press scale .96.
- Accessible name: "Saturday 17 October: 2 meals, short" / "…: nothing planned".

### 2.3 Legend
Under the columns, 11.5/600 `--muted`, wrapping, `aria-hidden`: three 14 × 7 swatches "Covered", "On list", "Short", then "Bars: B · L · D". Keep it: the bars mean nothing without it the first time. (Open question: hide once the Member has opened a popover, like the Row hint.)

### 2.4 Footer
Only when something is missing and not yet on the Shopping List. Top border `--divider`, padding-top 10, space-between:
- 12.5 `--muted`: "Missing for the plan: **{first three names}** +{rest}" (names in `--ink`).
- Primary pill 38 pt: `plus` + "Add {n}", n = distinct Ingredients missing. Adds the summed shortfall per Ingredient (§5.3).

### 2.5 No plan
No entries in the next 7 days: header tag hidden; body = 13.5 `--muted` "Nothing planned this week." + mini pill "Plan your week" → `/meal-plan`. Same card height as a 7-day plan is not required.

## 3. Day popover

`role="dialog"`, labelled by its title. Width `min(340, card width − 24)`, `--surface`, `--line` border, radius `--r-card`, `--shadow-float`; max-height 470, body scrolls.

- **Placement**: below the tapped column, 10 pt gap, arrow (14 pt rotated square) pointing at the column centre, horizontally clamped 12 pt inside the screen. If it would run under the dock, flip above the column (arrow at the bottom). Reposition on scroll; close if the column scrolls away.
- **Open/close**: 140 ms opacity + scale .98 → 1 from the arrow. Closes on tap outside, Escape, the × button, or tapping the same column. Opening another column moves the popover. Focus moves to the title on open and back to the column on close.
- **Header** (padding 12 10 10 16, bottom `--divider`): title display 18 ("Today", "Tomorrow", then the weekday), under it 12/600 `--muted` "Saturday 17 October · Short". Then three 30 pt ghost round buttons: ‹ previous day, › next day (disabled at the plan's ends), × close.
- **Body** (padding 4 16 8): one block per meal in slot order, 10 pt vertical padding, `--divider` between:
  - Slot label 11/700 caps `--muted` ("Breakfast").
  - Row: Recipe tile 34 pt (initials, tinted by the Recipe's first-line Aisle, as the recipes list), title 14.5/600 (ellipsis), under it 12.5 `--muted` "{servings} Servings · {prep+cook} min"; right: status Tag — "Covered" (`check`, accent tint), "On list" (`basket`, soon), "{n} short" (urgent).
  - **Shortfall lines** (indented 44 pt, min-height 32): "**Eggs** · short 2" or "**Lemons** · need 1" (amount in `--urgent-fg`, or `--soon-fg` when on list), reason under it 12 `--muted`, wraps (§5.4). Right: 30 pt `--accent-tint` round + (`aria-label` "Add Eggs to the Shopping List"), or an "On list" soon Tag.
- **Footer** (padding 10 16 14, top `--divider`), only for a day with meals: primary pill "Add {n} missing" (that day's unlisted shortfalls; hidden when none) + mini "Edit day" (`calendar`) → `/meal-plan?day=…`; when nothing is missing, "Edit day" takes the full width.
- **Empty planned day**: "Nothing planned for {weekday}." + mini "Plan a meal".

## 4. Statuses

### 4.1 Meal
| status | when |
|---|---|
| `covered` | no required line short or missing after earlier meals |
| `onList` | has shortfalls, every short Ingredient is on the active Shopping List |
| `short` | at least one short Ingredient is not on the list |

### 4.2 Day
`short` if any meal is short, else `onList` if any meal is on list, else `covered`; `empty` with no meals.

### 4.3 Plan tag (header)
- Any short meal: urgent Tag `!` "{n} meal(s) short" (count of meals, not Ingredients).
- Else any on-list meal: soon Tag `basket` "Covered once you shop".
- Else: accent Tag `check` "All covered".

## 5. Coverage rule (cumulative)

Pure function `planCoverage(input)` in `planCoverage.ts`; ADR 0007 applies to each line, with three additions:

1. **Order**: walk entries by date, then Breakfast → Lunch → Dinner. Each meal **consumes** what it covers from a working copy of the Batches, so later meals see only what is left.
2. **Earliest expiry first**: within an Ingredient, take from the Batch with the soonest `expiryDate`; undated Batches last.
3. **Expiry by the meal's day**: a Batch only counts for meals on or before its expiry date (`daysUntil(expiry) ≥ dayOffset`).

Unchanged from ADR 0007: quantities scaled to the entry's Servings; comparable units only (g↔kg, ml↔l); benefit of the doubt when a Batch exists but can't be compared (counts as covering, consumes nothing); quantity-less lines match on presence; Pantry Basics and optional lines skipped; Unmatched lines match Unmatched Batches by normalised name. **The Shopping List never counts as stock**; it only turns `short` into `onList`.

### 5.1 Shortfall
Per line: `need = scaled − taken`. `taken > 0` → "short {need}", `taken = 0` → "need {need}". Format amounts as Pantry does (kg/l above 1000).

### 5.2 Day and plan "missing"
Sum `need` per Ingredient over the day (popover) or the whole plan (footer), skipping Ingredients already on the list.

### 5.3 Add
Bulk-add endpoint with one item per Ingredient: the summed shortfall in the line's unit, or no quantity for quantity-less lines. Items carry the Recipe(s) as Source Recipe, as Add missing does. Snackbar "{n} added to the Shopping List" with Undo (deletes the created items). The added Ingredients flip to "On list" immediately.

### 5.4 Reason line (first that applies)
| case | text |
|---|---|
| earlier meals took the last usable stock | one meal: "{Sat}'s {recipe} uses the last"; two: "{Fri}'s dinner and {Sat}'s breakfast use the last"; more: "{n} earlier meals use the last" |
| all Batches expire before this day | "Yours expires {Fri}" |
| no Batch at all | "Not in your Pantry" |
| some left after earlier meals | "Only {amount} left after {who}" |
| otherwise | "Only {amount} in your Pantry" |
"{Sat}" is "Today" / "Tomorrow" / short weekday.

## 6. Data and API (needs schema review)

### 6.1 New table `meal_plan_entries`
`id`, `family_id` (fk), `date` (date, Family-local), `slot` enum `breakfast | lunch | dinner`, `recipe_id` (fk, Catalog or Family Recipe), `servings` (int 1–`MAX_SERVINGS`), `created_by`, timestamps. Unique `(family_id, date, slot)` — one meal per slot. Archived Recipes stay readable on existing entries. Plan length is not stored: it is whatever dates have entries.

### 6.2 Read endpoint (recommended)
`GET /meal-plan?from=YYYY-MM-DD&days=7` returns entries with Recipe title, minutes, tile Aisle and, per entry, `status` and `issues[] {ingredientId|rawName, need, unit, kind: short|missing, reason: {code, params}}` computed by §5 on the API, so ADR 0007's comparable-unit logic stays in one place (`recipes/matching`). Reasons travel as codes + params; the client translates. The widget refetches on Pantry, Shopping List or plan changes (same query keys as the other widgets).
Alternative: compute on the client from Batches + Recipe lines; only if the Dashboard already has the Recipe lines (it doesn't today).

### 6.3 Writes
Creating and editing entries belongs to the Meal Plan page (separate handoff). The widget only reads, plus the Shopping List add.

## 7. Accessibility

- Columns are buttons with the full name in §2.2; the bars, marks and legend are `aria-hidden`, so colour is never the only signal (the name says "short" / "on list" / "covered").
- Popover: `role="dialog"` (non-modal), labelled by its title; focus to the title on open, back to the column on close; Escape closes; Tab stays in reading order (header buttons, meal rows, footer).
- Icon-only + buttons have names ("Add Eggs to the Shopping List"). ‹ › have "Previous day" / "Next day".
- Adds announce through the snackbar's live region.
- Reduce-motion: no popover scale/fade.

## 8. Strings (`dashboard.json`, `mealPlan.*`)

`title_one/few/other` "Meal plan · {{count}} day(s)", `short_one/few/other` "{{count}} meal(s) short", `coveredOnceYouShop` "Covered once you shop", `allCovered` "All covered", `missingForPlan` "Missing for the plan:", `addN` "Add {{count}}", `addNMissing` "Add {{count}} missing", `editDay` "Edit day", `planMeal` "Plan a meal", `planWeek` "Plan your week", `nothingThisWeek` "Nothing planned this week.", `nothingOn` "Nothing planned for {{day}}.", `nothingYet` "Nothing yet", `today` "Today", `tomorrow` "Tomorrow", `slot.breakfast` "Breakfast", `slot.lunch` "Lunch", `slot.dinner` "Dinner", `legend.covered` "Covered", `legend.onList` "On list", `legend.short` "Short", `legend.bars` "Bars: B · L · D", `status.covered` "Covered", `status.onList` "On list", `status.short_one/few/other` "{{count}} short", `meta` "{{servings}} Servings · {{minutes}} min", `line.short` "short {{amount}}", `line.need` "need {{amount}}", `reason.usesLast` "{{who}} uses the last", `reason.useLast` "{{who}} use the last", `reason.earlierMeals` "{{count}} earlier meals", `reason.mealOf` "{{day}}'s {{name}}", `reason.expires` "Yours expires {{day}}", `reason.notInPantry` "Not in your Pantry", `reason.onlyLeftAfter` "Only {{amount}} left after {{who}}", `reason.onlyInPantry` "Only {{amount}} in your Pantry", `prevDay` "Previous day", `nextDay` "Next day", `close` "Close", `addLine` "Add {{name}} to the Shopping List", `toast.added` "{{count}} added to the Shopping List". Ro/Da need `few` plurals.

## 9. Tests

- `planCoverage`: consumption across meals (6 eggs, 4 + 4 → second meal short 2); earliest-expiry-first; Batch expiring the day before a meal doesn't count, on the day it does; Servings scaling; g↔kg sums; uncomparable Batch = covered without consuming; Pantry Basics and optional lines ignored; on-list turns short into onList but never covers; reason selection per §5.4.
- Widget: 1, 3 and 7 planned days (column count, titles only at ≤ 3); gap day inside the plan shows as empty; header tag per §4.3; footer hidden when nothing unlisted is missing; Add sends summed shortfalls and Undo removes them.
- Popover: opens under the column, flips above near the dock, ‹ › step and disable at the ends, Escape/outside/× close and return focus; per-line + and "Add n missing" add only that scope.
- Snapshots in the three themes: short plan, all covered, on-list, 2-day plan, no plan.

## 10. Open questions for the implementer to flag

- Does cooking a planned meal deduct from the Pantry, and should cooked meals drop out of the walk (and the widget) once marked done?
- Glossary: "Meal Slot" for Breakfast / Lunch / Dinner (Eating Moment already avoids "meal time")? Add to `GLOSSARY.md` with the schema PR.
- Past days: the widget starts at today; should today's Breakfast still count once it is afternoon? (Prototype: yes.)
- Legend: always shown, or hidden after the first popover?
- Shared column component with the "This week" expiry strip from `home-widgets/` if that ships.
