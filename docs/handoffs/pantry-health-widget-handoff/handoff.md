# Pantry health widget — design handoff

Status: approved (variant D · Sheet), ready for implementation. Date: 2026-10-15.
Reference prototype: `prototype.html` in this folder (self-contained, open in a browser; live at https://claude.ai/artifact/2SdiZhK5XNswosQWdqjzgJ). D opens by default; A–C stay in the file for comparison only. The left panel's "Pantry state" resets the sample (Messy week / Two things / All in order); every button in the sheet changes the sample, and the score updates live.

Code touched: new `apps/web/src/pages/Dashboard/widgets/HealthWidget.tsx` and `components/HealthSheet/*`, new `lib/health.ts` (score and to-dos, pure; a reference version is in this folder), `widgets/registry.ts` + `types.ts` (new type `health`), `pages/Customise/WidgetPreview.tsx`, `i18n/locales/{en,da,ro}/dashboard.json`, `packages/ui/src/icons` (three new icons, `icons-additions.ts` in this folder). Reuses the `Sheet` molecule, `ExpirySheet` (expiry handoff), `Tag`, the ingredient tile, the snackbar with Undo. API: one optional column (§6.3); everything else uses existing endpoints.

Comes from `home-widgets/` round 1 (variant B's to-do list) → round 2 (four collapsible designs). Notes: `claude/home-widgets-notes.md`.

---

## 1. Summary

A **Pantry health** Widget: a compact card on the Dashboard with a 0–100 score, a plain verdict and how many things there are to do. Tapping it opens a **bottom sheet** with the to-do list grouped by urgency (**Now / This week / Tidy up**). Each to-do has one button that fixes all of it; tapping the to-do opens its items, each with its own small action. Fixes go through the existing Pantry and Shopping endpoints, show a toast with Undo, and the score animates to its new value.

The Dashboard never shifts: the card has one fixed height whether there are 0 or 9 to-dos.

## 2. Widget (closed card)

Type `health`, sizes **wide** (default) and **small**. Uses `WidgetCard` (card tokens, padding 12 14 14, 10 pt gap).

**Wide** (≈ 130 pt tall):
- Header: label "Pantry health" with the `pulse` icon (new, see `icons-additions.ts`) in the widget label style (11.5/700 caps, .07 em, `--muted`); `info` icon 15 px on the right (decorative here; the sheet explains).
- Row (12 pt gap): **ring** 56 pt, stroke 6, track `--chip`, arc in the score colour (§5.3), round cap, starts at 12 o'clock; score number centred, display face 20 `tabular-nums`. Then the text column: verdict display 16 (`--display-w`), under it 12.5 `--muted` "**{n} to do** · {first to-do title}", ellipsis on one line. Then `chevron-right` 18 px `--muted`.
- **Check bar** under the row: 8 pt tall, four segments with 2 pt gaps, radius 2, widths by weight (40 / 30 / 15 / 15), each filled with that check's score colour. No labels on the card; the sheet header names them.
- Nothing to do: subline "Nothing to do"; the card still opens the sheet.

**Small** (half width): ring 56, verdict 14.5 under it, subline "{n} to do". No bar.

The whole card is one `button` (`aria-haspopup="dialog"`), accessible name "Pantry health, 78, a few things to sort, 6 things to do". Press scale .985.

## 3. Sheet

`Sheet` molecule, `label` "Pantry health". Height **86 %** of the viewport, top radius 24, `--card-bg`, `--shadow-float`; scrim `rgba(10,12,10,.38)`. Slide 340 ms `cubic-bezier(.2,.8,.2,1)`; scrim fades 250 ms. Grab handle 40 × 5, `--line-strong`, 8 pt from the top. Closes on scrim tap, drag down, Escape, or the × button.

### 3.1 Header (fixed)
Padding 6 18 12, bottom border `--divider`. Ring 52 pt / stroke 6 + text column: verdict display 17, under it 12.5 `--muted` "Fresh 89 · Staples 71 · Dated 79 · Rotation 84" (wraps to two lines). Close: 34 pt round `--chip` button with `close` 16 px.

### 3.2 Body (scrolls)
Padding 4 18 30. Three groups in this order, each only if it has to-dos:

| Group | Label | To-dos |
|---|---|---|
| `now` | Now | Toss expired · Add missing Staples |
| `week` | This week | Use soon · Restock running low |
| `tidy` | Tidy up | Date Batches · Check forgotten |

Group heading: 11/800 caps, .08 em, `--muted`, count right-aligned; 12 pt above (2 pt for the first).

**To-do row** (min-height 54, padding 6 0, `--divider` top border between rows):
- Left part is a `button` (`aria-expanded`, `aria-controls` → its items): **icon** 32 pt circle with the severity pair (§4), icon 16 px stroke 2.2; **title** 14.5/600 with, after it, the **gain pill** "+n" (11/800, `--accent-tint` / `--accent-on-tint`, radius 999, padding 1 6) when fixing it all raises the score, then `chevron-down` 18 px `--muted` (rotates 180° when open); **subline** 12.5 `--muted`: the first three names, "+n" after that.
- Right: **bulk button**, pill 32 pt, 12.5/700, `--card-bg` with `--line-strong` border; **primary** (`--primary` / `--primary-ink`) for the `now` group.

**Items** (open state): indented 42 pt (under the title), 2 pt apart, 10 pt bottom padding. Each item: min-height 42, padding 4 8 4 6, radius `--r-ctl` − 2, `--subtle` fill; ingredient tile 30 pt (aisle tint), name 13.5/600, line 12 `--muted` (one line, ellipsis), optional trailing Tag, then its action(s): pill 28 pt 12/700, or a 28 pt icon-only pill (with `aria-label`).

**Opening**: one to-do open at a time (accordion). The items wrapper animates `grid-template-rows: 0fr → 1fr`, 300 ms `cubic-bezier(.2,.8,.2,1)`; toggling must not re-mount the list or the transition is lost.

**Done pills** at the end of the body (14 pt above): one per check with nothing to do — "Nothing expired", "Staples covered", "Nothing due soon", "Nothing low", "All dated", "Nothing forgotten". 12/600 `--muted` on `--subtle`, radius 999, padding 4 9 4 7, `check` 12 px `--accent`.

**All done**: the body shows a 30 pt `--accent-tint` check circle + "Nothing to do. Everything is in date, stocked and accounted for." (13.5 `--muted`), then the done pills.

## 4. To-do catalogue

All derived on the client from data the Dashboard already loads (Pantry Batches, Staples, the Running low flag from pantry-batches, the active Shopping List, `staleThresholdDays`). `today` is the device's local date as in the expiry handoff.

| key | group | severity (icon · colours) | shows when | title | bulk | item line · action |
|---|---|---|---|---|---|---|
| `expired` | now | urgent · `trash` · `--urgent-bg/fg` | Batches with `daysUntil < 0` | Toss {n} expired | **Toss** → delete all | `500 g · fridge · since Wed` · Toss |
| `missingStaples` | now | urgent · `star` · urgent | Staples with no unexpired Batch, not on the Shopping List | Add {n} Staple(s) | **Add** → bulk-add with each Staple's preferred amount | `Staple · usual 1 kg · none left` · + (icon) |
| `useSoon` | week | soon · `cook` (new) · `--soon-bg/fg` | `0 ≤ daysUntil ≤ thr` | Use {n} by {weekday of today + thr} | **Recipes** → `/recipes` (the "You can make this" strip already favours expiring) | `1 l · fridge` + expiry Tag · **Used** |
| `runningLow` | week | low · `low` (battery) · `--butter` / `--butter-ink` | Running low, still in stock, not on the list | Restock {n} running low | **Add** → bulk-add | `Marked by Ana · Mon` · + (icon) |
| `undated` | tidy | neutral · `calendar` · `--chip` / `--ink` | `expiryDate` null | Date {n} Batch(es) | **Date all** → each gets its Default Expiry (§6.1) | `190 g · fridge · 34 d old` · **Set date** → `ExpirySheet` |
| `forgotten` | tidy | neutral · `hourglass` (new) · neutral | Batch older than its Location limit (§5.2) | Check {n} forgotten | **All good** → mark checked | `In the freezer since 25 Mar` · **Still good** + trash icon (Toss) |

Order inside a group is the table order. Items: expired oldest first; use soon soonest first; forgotten most overdue (age ÷ limit) first; others in Aisle order. Unmatched Batches take part in expired / use soon / undated / forgotten (by `rawName`); they can't be Staples or Running low.

## 5. Score

### 5.1 Formula (`lib/health.ts`, pure)
Four checks, each 0–100, weighted into a rounded total. Reference implementation: `health.ts` in this folder.

| check | weight | value |
|---|---|---|
| Fresh | 40 % | over Batches with a date: expired 0, `daysUntil ≤ thr` 0.6, later 1; mean. No dated Batches → 1 |
| Staples | 30 % | per Staple: stocked 1, stocked + Running low 0.6, missing but on the Shopping List 0.5, missing 0; mean. No Staples → 1 |
| Dated | 15 % | share of Batches with an expiry date |
| Rotation | 15 % | share of Batches not past their Location limit |

Empty Pantry: every check is 1 → 100 "In good shape" (with zero to-dos). Revisit if this feels wrong for a new Family (open question).

### 5.2 Location limits (Rotation)
Age = days since `max(createdAt, checkedAt)` (§6.3). Limits: fridge 21 d, freezer 180 d, cupboard 365 d, spices 730 d. Constants in `lib/health.ts` for now.

### 5.3 Verdict and colour
| total | verdict | colour |
|---|---|---|
| ≥ 85 | In good shape | `--accent` |
| 65–84 | A few things to sort | `--star` |
| < 65 | Needs attention | `--urgent-fg` |

The same thresholds colour each check's bar segment.

### 5.4 Gain pill
`gain = score(state after the bulk fix) − score(now)`, computed by applying the fix to a copy of the inputs. Shown only when > 0. `useSoon` never shows one (its fix is cooking, which the widget can't simulate).

### 5.5 Score animation
On any change the ring arc animates `stroke-dashoffset` 700 ms `cubic-bezier(.2,.8,.2,1)` and the number counts up/down over 700 ms (ease-out cubic). Reduce-motion: jump.

## 6. Actions and API

### 6.1 Mutations (existing endpoints)
- **Toss / Used**: delete Batch. Both go through the deferred delete of ADR 0009 (sent when the Undo window ends), so Undo is free. "Used" and "Toss" call the same endpoint today; keep them separate in the client so a future "Saved from the bin" stat can send a reason.
- **Add / +**: the Shopping List bulk-add endpoint (Staples use their preferred quantity and unit, as Suggestions do). The added Ingredients drop out of the to-do because they are now on the list.
- **Set date**: opens `ExpirySheet` for that Batch (context line `Pesto · 190 g · Fridge`, "Usual" pre-selected); saving updates the Batch. The prototype skips the sheet and applies a per-Location expiry directly.
- **Date all**: one PATCH per Batch (or a bulk endpoint if one exists) setting `createdAt + Default Expiry` for its Category (Family override → Catalog default); if that date is already past, use `today + Default Expiry`. Toast: "{n} given their usual expiry · edit any in Pantry". Batches whose Category has no default are skipped and stay in the list. (The prototype uses fixed per-Location days instead.)

### 6.2 Undo
Every action shows the snackbar for 5 s with **Undo**: deletes are simply not sent; adds call delete on the created Shopping Items; date changes restore the previous `expiryDate`; checks restore the previous `checkedAt`. The prototype restores a snapshot of the whole state.

### 6.3 New: `batches.checked_at` (needs schema review)
`timestamp null`. Set by **Still good** / **All good**; Rotation counts age from `max(createdAt, checkedAt)`. `PATCH /pantry/batches/:id` accepts `checked: true`. Small migration; the user merges schema PRs.

## 7. Accessibility

- Card: `button` with the full accessible name in §2; Enter/Space opens.
- Sheet: `role="dialog"`, `aria-modal`, labelled "Pantry health". Focus moves to the close button on open, returns to the card on close; focus is trapped; Escape closes.
- To-do row: the left part is the disclosure button (`aria-expanded`), the bulk button is separate with its own name ("Toss 2 expired", "Add 2 Staples" — not just "Toss").
- Item icon-only buttons have names ("Add Bread", "Toss Chicken thighs").
- Score changes are announced once through the snackbar's live region ("Removed 2 expired · score 81"); the ring itself is `aria-hidden`.
- Colour is never the only signal: severity also comes from the group heading and the icon.

## 8. Strings (`dashboard.json`, `health.*`)

`title` "Pantry health", `verdict.good` "In good shape", `verdict.some` "A few things to sort", `verdict.attention` "Needs attention", `toDo_one/few/other` "{{count}} to do", `nothingToDo` "Nothing to do", `allDone` "Nothing to do. Everything is in date, stocked and accounted for.", `group.now` "Now", `group.week` "This week", `group.tidy` "Tidy up", `check.fresh` "Fresh", `check.staples` "Staples", `check.dated` "Dated", `check.rotation` "Rotation".
To-dos: `expired.title` "Toss {{count}} expired", `staples.title_one/other` "Add {{count}} Staple(s)", `soon.title` "Use {{count}} by {{day}}", `low.title` "Restock {{count}} running low", `undated.title_one/other` "Date {{count}} Batch(es)", `forgotten.title` "Check {{count}} forgotten". Buttons: `toss` "Toss", `add` "Add", `recipes` "Recipes", `dateAll` "Date all", `allGood` "All good", `used` "Used", `setDate` "Set date", `stillGood` "Still good". Lines: `since` "since {{day}}", `usual` "usual {{amount}}", `noneLeft` "none left", `markedBy` "Marked by {{name}} · {{day}}", `age` "{{count}} d old", `inLocationSince` "In the {{location}} since {{date}}". Done: `done.expired` "Nothing expired", `done.staples` "Staples covered", `done.soon` "Nothing due soon", `done.low` "Nothing low", `done.dated` "All dated", `done.rotation` "Nothing forgotten". Toasts: `toast.tossed` "Removed {{count}} expired", `toast.added` "{{count}} added to the Shopping List", `toast.dated` "{{count}} given their usual expiry · edit any in Pantry", `toast.checked` "{{count}} checked · still good". Ro/Da need `few` plurals.

## 9. Tests

- `lib/health.ts`: each check at its edges (no dated Batches, no Staples, empty Pantry = 100), weights and rounding, verdict thresholds 64/65/84/85, Staple on the list counts 0.5, Running low Staple 0.6, Rotation uses `checkedAt` when later than `createdAt`.
- To-dos: each appears only under its condition; group and order as §4; on-list Ingredients drop out; gain equals the simulated difference and is hidden for `useSoon`.
- Widget: card name and subline; tap opens the sheet; Escape and scrim close it and return focus.
- Sheet: accordion opens one to-do; bulk and item actions call the right mutation; Undo reverts each kind; the list re-renders without closing the open row when other rows change.
- Snapshots in the three themes, closed card (wide and small) and open sheet.

## 10. Open questions for the implementer to flag

- Empty or brand-new Pantry scores 100. Show "Add your first shop" instead of a score until there are, say, 5 Batches?
- Location limits as constants vs a Family Setting next to the Stale Threshold.
- `checked_at` migration (§6.3), or drop "Still good" and only offer Toss for forgotten Batches.
- Should the sheet also be reachable from the Pantry header (a small score chip), or only from the Dashboard?
- The Suggestions widget overlaps the Staples and Running low to-dos; keep both, or drop Suggestions from the default layout once Health ships.
