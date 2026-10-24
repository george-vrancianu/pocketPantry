# Add Recipe — v3 amendments (grilling, 2026-10-24)

Status: decisions from a grilling session on 2026-10-24, applied on top of `handoff.md` and `v2-amendments.md`. Where they disagree, this file wins. Nothing here is prototyped; the v2 prototype is still the source of truth for look and spacing except where this file changes it.

Why a v3: the handoff predates three decisions on `main`, and this file brings it in line with them:

- **ADR 0026** (Suggest Guidance into empty fields, on request).
- **ADR 0027** (the screen header holds only the add action; no Settings gear on sub-screens).
- **ADR 0028** (Recipe Drafts are kept on the server, per Member; New Recipe and new Variant only).

The Recipe Drafts tickets (#544–#550) and Suggest Guidance tickets (#551–#556) were written against today's stacked editor; §10 says how they line up with this work.

## 1. Header

- **Back · title · Save.** No Settings gear (ADR 0027 replaces v2 §5) and no Home button: the editor has no Dock, and Back is never a dead end. Save is the editor's single header button, taking the add action's place (recorded as a consequence in ADR 0027). The same applies to the From a link page: Back · "From a link", no gear.
- **Draft status subline** under the title, 12.5 `--muted`, New and Variant only (Edit has no Recipe Draft and shows nothing): "Saving…" → "Draft saved"; on a failed save "Couldn't save draft, retrying", retried automatically (#550). Nothing before the Recipe Draft exists (no real content yet). The title keeps its one-line ellipsis; the subline never pushes the buttons.

## 2. Tabs and opening tab

- Use `SegmentedTabs` (`packages/ui/src/molecules/SegmentedTabs.tsx`), the detail page's component, not `SegmentedControl`. The editor keeps its own order and names, **Details · Ingredients · Steps**: its first tab holds the basics a draft is missing, which is not the detail page's About.
- Opening tab: **Details** for New, Variant, a resumed Recipe Draft, From a link and Plate Scan; **Steps** for Edit only.

## 3. Copy that changes because of Recipe Drafts

Never say "nothing is saved" in the editor.

- Variant hint: "Copied from {{base}} ({{owner}}). It becomes a Recipe when you save it."
- New hint: "Kept as your draft until you save it as one of your family's Recipes."
- The link and Plate Scan title hints (v2 §4) and the Source row's "Link removed. It goes when you save." are still true and stay.

## 4. Leaving the editor

- **New and Variant:** leaving flushes the Recipe Draft and never asks, except while the last save has failed (#550).
- **Edit:** leaving with changes to the document or Guidance asks "Discard your changes?". Tips are not counted: they are already saved.
- Both use one shared leave guard. The app moves from `<BrowserRouter>` to `createBrowserRouter` so `useBlocker` can catch Back, the browser or OS back gesture and the Dock; the editor's own Back alone would miss the phone back gesture.

## 5. In-form Recipe Draft parts (New and Variant)

- Status: the header subline (§1).
- Stale version: an Alert pinned under the sticky tabs, on every tab: "This draft was changed on another device" with **Load latest** (#550). Autosave stops while it shows.
- **Discard draft**: a ghost link at the end of the Details tab. It returns to `/recipes` and shows "Draft discarded" with Undo, the delete deferred as in ADR 0009.
- The "Drafts (N)" list on Recipes and the "Continue your draft?" ask are **not** in this handoff (#547, #548).

## 6. Details tab

- **Base Recipe card** stays on Details, under the title (closes the v2 open question). **Make a Variant** shows a read-only "Variant of **{title}**" row in the same spot, so every entry answers "what is this a Variant of?" in one place.
- **Suggest Guidance** (ADR 0026) sits on the Guidance disclosure row as a ghost "Suggest" button, visible while collapsed whenever at least one of Pairings, Nutrition Note and Eating Moments is empty; offered on New, Variant and Edit. Tapping it expands the card and fills only the empty fields. Each suggested item carries a "Suggested" pill until it is edited. A field still empty after a suggestion says "Nothing to suggest". On a link draft the subline "Optional · never read from the page" stays beside the button.

## 7. Ingredients tab

- Lines not matched to an Ingredient are **Unmatched** lines (`GLOSSARY.md`); the handoff's "free-text line" means this. UI copy stays "Not in the Catalog".
- **Adopted** (v2 §3 proposal): an Unmatched line's ⌄ strip has "Add “{name}” to your catalog". No API change is needed: `POST /catalog/family-ingredients` returns the new id, the form sets it on the line, and a save with the line's id updates it in place. Creating the Family Ingredient also relinks every saved Unmatched line of that name in the Family's other Recipes; this is existing behaviour and needs no extra copy.
- The quantity cell stays the handoff's compact number + unit tag. No Usual Amount picks (#522 leaves recipe editors out).

## 8. Reorder and removal (ingredients and steps)

- **Drag uses `@dnd-kit/sortable`** (already used by `CustomisePage`) instead of the hand-built drag in handoff §5.2. `PointerSensor` with `{ delay: 500, tolerance: 8 }` for the hold, the grip drags at once, auto-scroll on, plus the keyboard sensor. The §5.2 visuals and timings (tint during the hold, lift, 200 ms slide, haptics, reduce-motion) remain the spec. Move up / Move down stay in the ⌄ strip.
- A hold that starts on an input, select, textarea or button never lifts the row (closes the round 1 question).
- **Removing a line or a step** is a form change: toast "Removed {name}" (`common:row.removed` / `common:row.undo`, `polite`, `UNDO_WINDOW_MS`) whose Undo puts it back at its old index. The toast closes when the page unmounts, as on `TemplateEditorPage`. On a Recipe Draft the next autosave stores whichever state is current.
- **Removing a saved step with Tips** keeps the inline two-step confirm (handoff §5), with no Undo.
- **Deleting a Tip on Edit** follows ADR 0009 through `useDeferredRemoval`: "Tip deleted" with Undo, and the delete is sent only when the window ends. Today it is sent at once with no Undo.

## 9. Saving Edit

One Save sends the document (`useUpdateFamilyRecipe`), then, only if that succeeded, Guidance (`useSetFamilyGuidance`). "Recipe saved." shows only when both succeed. If one fails, an inline Alert names the part that failed and only that part stays changed. No API change.

## 10. Scope and order

- **Admin Catalog Recipe editor:** gets the new one-row lines and steps, drag and Undo (they replace the shared `RecipeLinesSection` / `RecipeStepsSection`), but keeps its stacked page and separate panels, with no tabs. Its search stays `scope="shared"` with no Use as typed.
- **From a link page** restyle (v2 §4) is in scope, last, logic and copy unchanged.
- **Order:** the tabbed editor comes first. Recipe Drafts and Suggest Guidance tickets with API work only (#545, and the Suggest Guidance API side) run in parallel; tickets that add form UI wait for the slice they need.

### Proposed slices

| # | Slice | Editors | Blocked by |
|---|---|---|---|
| A | Leave guard: `createBrowserRouter` and a shared leave-guard hook. No visible change | — | — |
| B | Tabs shell (tracer): tabs and badges, header with subline slot, Details basics (title, facts, Level, Cuisine/Method), hints, next links, opening tab. Today's line and step sections sit inside their tabs for now | Family | — |
| C | One-row Ingredient Lines: grip, quantity cell, ⌄ strip, inline search popover, Undo | Both | B |
| D | One-row Steps: timer chip, add rows at both ends, step-with-Tips callout, Undo | Both | B |
| E | Drag to reorder with dnd-kit | Both | C, D |
| F | Tips inline on Edit: Tip chip, Recipe tips card with inherited toggles, deferred Tip delete | Family | D |
| G | Guidance disclosure, and Edit's single Save of document and Guidance | Family | B |
| H | "Discard your changes?" when leaving Edit | Family | A, G |
| I | Source Link row with Undo, Base Recipe card, read-only "Variant of" row | Family | B |
| J | Unmatched line → Add to your catalog | Family | C |
| K | From a link page restyle | — | — |

Existing tickets to block: #546 and #548 by B; #549 by B and I; #550 by A and B; #552, #554 and #555 by G. #544–#550 should also cite ADR 0028 (they say 0026).

## Open questions closed

| Question | Answer |
|---|---|
| Hide the gear or prompt before leaving? (v2) | No gear (ADR 0027); prompt on Edit only (§4) |
| Base pick on Details or its own step? (v2) | Details (§6) |
| Read-only Base row for Make a Variant? (v2) | Yes (§6) |
| API check for Add to your catalog from a line (v2) | None needed (§7) |
| Auto-scroll while dragging (round 1) | dnd-kit auto-scroll (§8) |
| Hold on the quantity cell or step text lifts? (round 1) | No (§8) |
| Warn before Back on Edit? (round 1) | Yes (§4) |
