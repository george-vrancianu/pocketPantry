# Row gestures (swipe to delete, hold to edit) — prototype notes

Prototype artifact: https://claude.ai/artifact/RPYDXAyuaTuGLhAUgMYuzQ (interactive; Pantry / Shopping / Template editor lists, three themes, tuning panel).

**Approved 2026-10-13.** Handoff: `handoff.md` + `prototype.html` in this folder. The handoff is the source of truth for numbers; the rounds below are history.

## Brief
Replace per-row action buttons (edit, remove ×) with gestures: swipe left to delete, long-press to edit. Feedback on the row for both, inline delete confirmation. Decisions: demonstrate on Pantry items, Shopping list rows and Template editor lines; long-press opens the existing edit sheet/screen (not an inline editor).

## Round 4 — final polish before handoff
- Trash tab lost its "Delete" label (icon only, 22 px). The "Release to delete" band label stays for zone 2.
- Tab entry smoothed: its opacity/scale follow the drag with no transitions (they were fighting the per-frame values), the zone "bump" keyframe is gone; zone changes ease the icon itself (1 → 1.12 → 1.28, 300 ms cubic-bezier(.2,.7,.3,1)).

## Round 3 — hold feedback is a soft circle from the press point
Replaces the left-to-right tint sweep. A first version with two fast pulses and a hard ring was too aggressive; final: row settles to 99 %, 48 pt `--accent-tint` circle at 55 % under the content grows from the touch point over the hold (scale 0 → 20), one slow breath of shadow (22 % peak) and one thin ring; on armed a last ring drifts out, the row eases back, the sheet opens.

## Round 2 — swipe reworked into three release zones
Tab attached to the row (not a static background), no "open" resting state. Release by distance: < 92 pt → spring back, ignore; tab fully in view → inline confirmation; past ⅔ of the row → fly off and delete with Undo. Band fades in with the first 92 pt; solid `--urgent-bg` in zone 1, solid `--urgent-fg` + white icon + "Release to delete" in zone 2; content dims 70 % / 45 %; haptics light / medium.

## Round 1
Inline confirmation ("Remove {name}?" + context, Keep / Remove, 6 s countdown bar), collapse + Undo toast 5 s, hold 500 ms (400/650 tried), edit sheet with a "Remove from …" link as the no-gesture path, first-use peek + hint pill, tuning panel.

## Open questions (carried into the handoff §12)
- Pantry row tap: open the item detail?
- Delete mutation timing: on snackbar close vs immediately with re-add on Undo.
- Hint on the Staples screen if its rows adopt `SwipeRow`.
- Native haptic mapping once wrapped.
