# Row gestures — design handoff

Status: approved look and behaviour, ready for implementation. Date: 2026-10-13.
Reference prototype: `prototype.html` (self-contained, open in a browser; live at https://claude.ai/artifact/RPYDXAyuaTuGLhAUgMYuzQ). Switch list (Pantry / Shopping / Template editor) and theme at the top; the left panel shows the row state live and lets you try the hold duration and the delete line. The prototype is the source of truth for timing, distances and feedback; the numbers below are copied from it.

Code touched: a new `SwipeRow` molecule and `useRowGestures` hook in `packages/ui`; the rows in `apps/web/src/pages/Pantry/*` (ingredient rows), `apps/web/src/pages/Shopping/components/ShoppingGroups.tsx` (list rows), `apps/web/src/pages/Shopping/templates/*` (template editor lines); the existing edit sheet/screen for each of those; `apps/web/src/i18n/locales/{en,da,ro}/common.json` (new `row.*` keys). No API change: delete and edit call the mutations the buttons call today.

---

## 1. Summary of the change

List rows lose their per-row action buttons (the edit control and the remove ×). Instead:

- **Swipe left to delete.** A trash tab attached to the row's trailing edge slides in with the row. What happens on release depends on how far the row was dragged: not far enough → nothing; the tab fully in view → the row asks inline; past two thirds of the row → the row is deleted at once, with Undo.
- **Hold to edit.** Holding the row for 500 ms opens the item's existing edit sheet/screen. A soft circle grows from under the finger while holding, so the hold is visible before it fires.
- **Tap keeps its meaning.** Shopping rows still tick on tap; the staple star keeps its own tap. Pantry and template rows do nothing on tap today (see open questions).

Everything uses the theme tokens (`packages/ui/src/theme/themes.ts`); nothing new at token level. All timings respect reduce-motion (instant), see §8.

## 2. Row anatomy

A `SwipeRow` wraps the row content and renders three layers, all clipped by the row (`overflow: hidden`):

| Layer | What |
|---|---|
| Band (`.under`) | Absolutely fills the row, `--urgent-bg`. Opacity `0.35 + 0.65 × p` where `p = min(1, drag / 92 pt)`. Transitions background 180 ms, opacity 120 ms. |
| Content (`.fg`) | The row's normal content on `--card-bg`, `translateX(x)` where `x ≤ 0` follows the finger. Carries the **tab** and the **band label** as absolutely positioned children so they move with the row: the tab at `left: 100%`, 92 pt wide, full height, trash icon 22 px centred, `--urgent-fg`; the label "Release to delete" at `left: calc(100% + 92 pt + 4 pt)`, vertically centred, 12.5/700 white, hidden until zone 2. The hold circle (§5) also lives here, under the content. |
| Confirmation (`.confirm`) | Absolutely fills the row, `--urgent-bg`, slides in from the right (§4). |

Row height is unchanged (min 56 pt, 8 pt vertical padding). Rows keep the 1 px `--divider` between them. `touch-action: pan-y`, `user-select: none`.

## 3. Swipe to delete

### 3.1 Drag

- A drag starts when the pointer has moved more than 8 pt and the movement is more horizontal than vertical; pointer capture on the row. Vertical movement is left to the scroll view, which cancels the gesture (`pointercancel` → spring back). A drag that starts on the star still swipes; the click that would follow a drag is swallowed.
- `x = dx`. Dragging to the right is rubber-banded at 0.25. Past the delete line (§3.2) the row keeps following at 0.4 of the finger.
- Tab while sliding in (no transitions on these while dragging, they track the finger): opacity `0.3 + 0.7 × p`, scale `0.86 + 0.14 × p`.

### 3.2 Zones and feedback

`w` is the row width (350 pt on the 390 pt reference). Zone changes are the only things that animate during a drag: icon transform 300 ms `cubic-bezier(.2,.7,.3,1)`, colours 250 ms, content opacity 150 ms.

| Zone | Entered when | Feedback on entering | On release |
|---|---|---|---|
| 0 · tab sliding in | drag < 92 pt | band and tab fading/growing with `p` | **Ignore**: row springs back, 300 ms `cubic-bezier(.25,1.35,.45,1)` (slight overshoot). |
| 1 · tab in view | drag ≥ 92 pt | band opacity 1; icon eases to scale 1.12; row content (text, tile, checkbox, tags, star, grip) dims to 70 %; haptic light (10 ms). | **Ask**: inline confirmation (§4). |
| 2 · past the delete line | drag ≥ ⅔ × w (≈ 233 pt); test at 98.5 % of it | band flips to solid `--urgent-fg`; icon white, scale 1.28; "Release to delete" fades in and slides 6 pt into place (150 / 180 ms); content dims to 45 %; haptic medium (pattern 14-40-22 ms). | **Delete**: content and tab fly off left, 200 ms `cubic-bezier(.4,0,.8,.6)` to `-100% − 92 pt`, band solid; then the row collapses (§3.3). Haptic 10-30-30 ms. |

Moving back across a line reverses the feedback (zone is recomputed on every move). The delete line was tried at 60 % and 75 % in the prototype; ⅔ is the approved value. A visible marker for the line is not possible (it sits under the content until crossed): the colour flip, the label and the haptic carry it.

### 3.3 Removal and Undo

- Collapse: row animates `max-height 80 → 0` and opacity to 0 over 240 ms `cubic-bezier(.4,0,.6,1)`, then the item is removed from the list. Haptic 8 ms.
- Snackbar "Removed {name}" with **Undo** (undo icon + label in `--toast-action`), 5 s. Undo re-inserts the item at its previous index; the restored row expands over 260 ms `cubic-bezier(.2,.8,.2,1)`.
- The delete mutation fires when the snackbar closes or the user navigates away, not on collapse (so Undo needs no API call). If the mutation fails, re-insert the row with an error snackbar.
- Shopping: the list summary ("N to buy") updates on collapse.

## 4. Inline confirmation

Entered from zone 1 (and from the edit sheet's Remove link, §6).

- Content slides to `-30 %` and fades out (260 / 200 ms); the band fades out; the confirmation slides in from the right, 260 ms `cubic-bezier(.2,.8,.2,1)`.
- Layout (padding 8 / 10 / 8 / 14, gap 10): 30 pt round `--urgent-fg` badge with a white 16 px trash icon; text block (flex 1, ellipsis): "Remove {name}?" 14/600 `--ink`, under it the context line 12 `--urgent-fg` ("in your Pantry" / "from your list" / "from this template"); **Keep** button 34 pt, radius `--r-ctl` − 2, `--card-bg` with `--line-strong` border, 13.5/700 `--ink`; **Remove** button same size, `--urgent-fg` fill, white text. Press scale .96.
- Countdown: 3 px bar along the bottom, `--urgent-fg` at 55 %, scales from full width to 0 over 6 s, linear. When it ends the row returns to idle untouched.
- Keep → back to idle (reverse of the entry). Remove → collapse + Undo (§3.3).
- Focus moves to Keep when the confirmation opens; Escape = Keep.
- Only one row can be confirming at a time; starting a gesture on another row is allowed and leaves the countdown running.

## 5. Hold to edit

- Press without moving. After 90 ms (so a quick tap never flashes) the row enters *pressing*: content eases to scale 0.99 (250 ms ease-out) and the hold circle appears.
- **Hold circle**: a 48 pt circle in `--accent-tint` at 55 % opacity, centred on the touch point, under the row content (content stays readable), clipped by the row. It grows to cover the row over the hold duration (scale 0 → 20, `cubic-bezier(.3,.05,.3,1)`). While it grows it breathes once: its shadow swells to `--accent` at 22 % mid-hold and back to 0; one 1.5 px `--accent` ring drifts out from the same point over the whole hold (opacity 0 → .35 at 25 % → 0, scale .9 → 2.6).
- **Hold duration 500 ms** (400 and 650 were tried; 500 approved). Moving more than 8 pt, or the scroll view taking over, cancels the hold: the circle fades in 250 ms and nothing else happens.
- **Armed** (hold complete): a last ring drifts out (opacity .4 → 0, scale 1.2 → 4, 500 ms); content eases 1.006 → 1 over 400 ms; haptic 18 ms; the circle fades over 450 ms after a 100 ms delay; the edit sheet opens 160 ms after arming.
- The pointer-up that ends the hold does nothing (no tap).
- Edit target: the existing edit flow for that row (Pantry item editor, Shopping item amount, template line editor). The prototype's sheet shows the expected shape: title = item name, context line, Amount field with unit chip, Expires chips (Pantry only), Cancel / Save, and a **"Remove from …"** link under the buttons (§6). Save → snackbar "Updated {name}".

## 6. No-gesture paths (accessibility)

Gestures are the primary path; every action stays reachable without them:

- The edit sheet keeps a **Remove from Pantry / Remove from list / Remove line** link (`--urgent-fg`, 14/700, 40 pt) that closes the sheet and opens the inline confirmation on that row.
- Keyboard: rows are focusable (`tabindex=0`). **Enter** opens the edit sheet, **Delete / Backspace** opens the inline confirmation, **Escape** keeps. Inside the confirmation, Tab moves between Keep and Remove.
- Screen readers: the row is a `group` named after the item with a description "Swipe left to remove, hold to edit"; expose **Edit** and **Remove** as custom actions (iOS `accessibilityCustomActions`, Android `AccessibilityAction`) so they appear in the rotor/actions menu. The tab and band label are `aria-hidden`; the confirmation is announced as a `dialog`-like region: "Remove {name}? Keep. Remove."
- A long-press must not also open the browser's context menu: `contextmenu` is prevented on the row (`-webkit-touch-callout: none`).

## 7. First-use hint

Once per list (persist `pp.rowHint.{pantry|shopping|template}` locally): 700 ms after the list mounts, the first row peeks 40 pt left and back over 1.1 s `cubic-bezier(.2,.8,.2,1)` with the band at `p = 0.6`, and a pill under the header reads "← Swipe left to remove · hold to edit" (`--accent-tint` / `--accent-on-tint`, 12.5/600, radius 999, 7 / 12 padding, icon 14 px). The pill fades (250 ms) after the first swipe that reaches zone 1 or the first completed hold.

## 8. Motion, haptics and edge cases

- Reduce-motion: no spring, no fly-off, no circle (the row just dims to 70 % while pressing), confirmation and collapse are instant; haptics unchanged.
- Haptics (native when wrapped; `navigator.vibrate` on Android web, nothing on iOS web): light on zone 1, medium on zone 2, success on armed, light on fly-off and on remove.
- Long names: one line with ellipsis in the row and in the confirmation question.
- Checked Shopping rows swipe and hold like any other row.
- The list keeps polling every 10 s; a refetch must not reset a row that is dragging, confirming or pressing (key rows by id, keep gesture state outside the data).
- Tablet / desktop: the same gestures work with a mouse (drag; press and hold). Hover reveals nothing; the keyboard path (§6) is the desktop affordance.
- Template editor: the grip at the left is for reordering, which stays a separate gesture (drag vertically from the grip; not in this handoff). A horizontal drag that starts on the grip swipes.

## 9. Component API (proposal)

```tsx
<SwipeRow
  id={item.id}
  name={item.name}                 // used in "Remove {name}?" and announcements
  deleteContext={t('row.context.pantry')}
  onDelete={() => remove(item.id)} // called when Undo expires
  onEdit={() => openEditor(item)}  // hold / Enter / custom action
  onTap={toggle}                   // optional; Shopping passes the tick toggle
  disabled={stale}
>
  {rowContent}
</SwipeRow>
```

`useRowGestures({ reveal: 92, deleteFraction: 2/3, holdMs: 500, moveTolerance: 8 })` holds the pointer logic and returns the zone, `x`, `pressing/armed` flags and the handlers; `SwipeRow` renders the layers in §2 from them. A `SwipeRowList` context keeps "one confirming row at a time" and the shared Undo snackbar.

## 10. Strings to add (`common.json`)

`row.hint` "Swipe left to remove · hold to edit", `row.releaseToDelete` "Release to delete", `row.removeQuestion` "Remove {{name}}?", `row.context.pantry` "in your Pantry", `row.context.list` "from your list", `row.context.template` "from this template", `row.keep` "Keep", `row.remove` "Remove", `row.removed` "Removed {{name}}", `row.undo` "Undo", `row.updated` "Updated {{name}}", `row.a11yHint` "Swipe left to remove, hold to edit", `row.actions.edit` "Edit", `row.actions.remove` "Remove", `edit.removeFromPantry` "Remove from Pantry", `edit.removeFromList` "Remove from list", `edit.removeLine` "Remove line".

Strings that go away once the buttons are gone: the per-row `remove` / `edit` button labels in `pantry.json`, `shopping.json` and `templates.json`. Delete them after the tests are updated.

## 11. Tests to update

Pantry list tests, `ShoppingPage.test.tsx`, `TemplateScreens.test.tsx`: replace button clicks with the keyboard path (Delete key → confirmation → Remove; Enter → editor), plus unit tests on `useRowGestures` for the three release zones, the 8 pt cancel, the hold timing and the Undo window.

## 12. Open questions for the implementer to flag

- Pantry row tap: open the item detail now that edit is on hold? (Prototype: no-op.)
- Delete mutation timing: on snackbar close (proposed) vs immediately with a compensating re-add on Undo.
- Whether the hint should also show on the Staples screen if its rows adopt `SwipeRow`.
- Native haptic mapping (light / medium / success) once the app is wrapped.
