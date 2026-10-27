# Recipe Drafts are kept on the server, per Member

Writing a New Recipe or a new Variant can take a long time: typing lines and steps, tidying a Recipe from Link read or a Plate Scan, asking for Guidance. Today nothing is kept until Save, and a reload, a wrong tap or a closed tab loses it all, including a read that already counted against the Link Cap or Scan Cap. We keep the form automatically as a **Recipe Draft** on the server, private to the Member who started it, so they can finish it later on any device. This departs on purpose from the Scan Session (ADR 0004) and the Voice Inbox (ADR 0025), which keep unfinished work in memory only.

## Decision

- **Scope:** New Recipe (blank, from Link, from a Plate Scan) and New Variant. Editing an existing Family Recipe and the Admin Catalog Recipe editor have no Recipe Drafts.
- **A Recipe Draft is not a Recipe.** It is never browsed, matched, planned, shopped from or allergy-filtered; it can only be resumed or discarded. Saving it creates the Recipe and deletes the Recipe Draft in the same step.
- **Private to its Member** and scoped to their Family. Leaving the Family deletes the Member's Recipe Drafts.
- **Created at the first real content** (a title, a line or a step; a Recipe from Link or Plate Scan fill counts at once), so opening a blank form and backing out leaves nothing. Saved about 1 to 2 s after each change and flushed on leaving the page. Leaving never discards it. Amended by [ADR 0031](0031-background-reads-share-one-strip-and-link-reads-become-recipe-drafts.md): a Recipe from Link read creates its Recipe Draft on the server when it finishes, checking the limit before reading.
- **Stored as typed:** the form state, the Source Link and its source language, and the suggested markers on unsaved Guidance. No Recipe validation applies until it is saved as a Recipe; the server checks only the shape and the same line, step and Tip limits as a Recipe. Plate matches are not stored; they are asked again on resume.
- **Limits:** at most 20 per Member, several per base Recipe allowed. A Recipe Draft not edited for 30 days is deleted; its row shows "kept until" that date.
- **Resuming:** a "Drafts (N)" entry on the Recipes page, newest edit first, each row with title (or "Untitled recipe"), "Variant of X" or "New recipe", where it came from, and when it was last edited. Opening New Recipe, or New Variant of a base with Recipe Drafts, asks "Continue your draft?" first.
- **Concurrency:** each save carries a version. A tab whose version is stale stops autosaving and offers Load latest; nothing is merged.
- **Status:** an inline "Draft saved / Saving…" in the form header, no toast per save. A failed save shows a non-blocking retry notice, and leaving while a save has failed asks first.
- **Discard** from the row or the form uses Undo with a deferred delete, as in ADR 0009.
- **When the world moves:** a Variant draft whose base was deleted or archived opens as a Base Recipe with a note; a line whose Ingredient was deleted falls back to its name as Unmatched.
- Voice Notes, Assistant Requests and Meal Plans do not create, resume or use Recipe Drafts.

## Considered options

- **On the device** (IndexedDB or localStorage). Rejected: long recipe work moves between phone and tablet, and clearing the browser would lose it. The reasons ADR 0004 and 0025 give against persistence (a cheap redo, a stale half-reviewed inbox confusing more than it helps) do not hold for a recipe someone spent half an hour typing.
- **Shared with the Family.** Rejected: half-finished work is personal, sharing invites two Members editing one form at once, and it would clutter everyone's Recipes. Saving is how a Recipe is shared.
- **A draft state on the Recipe itself.** Rejected: every derived feature (Can Make, Cook Tonight, Plan Forecast, Source Recipes, Allergy hiding) would have to learn to skip it.
- **Last write wins across devices.** Rejected: a forgotten tablet could silently overwrite work done since on the phone.

## Consequences

- A new table and API module hold raw, possibly invalid form state. There is no scheduler, so a Recipe Draft past 30 days without an edit is deleted lazily, whenever its Member's Recipe Drafts are listed or counted.
- Text read by Recipe from Link is kept on the server for up to 30 days after the last edit even if the Member never saves.
- Edit has no protection yet; adding it later is a separate decision, because pending changes to an existing Recipe can conflict with other Members' edits.
