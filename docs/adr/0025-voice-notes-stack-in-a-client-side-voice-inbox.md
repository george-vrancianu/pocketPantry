# Voice Notes stack in a client-side Voice Inbox

Walking round the kitchen, a Member wants to say "two yogurts in the fridge", open a cupboard, then say "we're out of rice", without waiting for each Voice Note to be read and reviewed. Today the mic refuses while a note is being read or a failed one is kept, so the Member must wait. We let Voice Notes stack in a **Voice Inbox** and be reviewed when the Member is ready, alone or merged. This amends ADR 0017 (one Voice Note at a time), ADR 0021 (the status pill and the Spoken Language chip above the Dock) and ADR 0022 (Spoken Language changed for a single Voice Note).

## Decision

- **The Voice Inbox lives in the client, in memory,** like the Scan Session (ADR 0004). A reload loses it, and the page asks before unloading while a Voice Note in it is unapplied. Sign-out drops it silently.
- **Recording no longer waits.** Each Voice Note joins the Voice Inbox and is read at once, at most 2 at a time, the rest in recording order. It holds at most 5 Voice Notes; a sixth asks the Member to review first. The mic is not offered while a Review or answer sheet is open.
- **Each Voice Note keeps what it was recorded with:** its Default List (the page it was recorded on) and its Spoken Language.
- **Failures stay in the Voice Inbox** with Retry and Discard, and no longer block the mic. A network error is retried once automatically. The Voice Cap fails the Voice Note that reached it and those waiting behind it, as in ADR 0004.
- **The indicator above the Dock replaces the status pill:** a wide strip with Gator, the count of Voice Notes and a summary such as "Reading 2 · 1 ready", with Review when exactly one is ready. It buzzes briefly on phones that support it when a Voice Note is ready; no toast, no sound. Tapping it opens that one Voice Note, or else a Voice Inbox sheet with one row per Voice Note (transcript preview, list, state, Retry and Discard) and "Review all (N)".
- **Review is unchanged for one Voice Note.** An answers-only Voice Note opens the answer sheet, with the answers as they were when read.
- **"Review all" merges every read Voice Note with Voice Actions into one Review:** every transcript under "What I heard" in recording order, one answer card, and the Voice Actions grouped by list, each keeping the list its own note resolved. Nothing is de-duplicated; Voice Actions apply in recording order, in one Apply and one transaction. On success every merged Voice Note leaves the Voice Inbox; on an error they all stay with their edits. Discarding asks once and discards them all. A merge over 50 Voice Actions (the apply limit) is refused. The API is unchanged: apply already takes a flat list of Voice Actions.
- **The Spoken Language chip above the Dock is removed,** on every page and in Setup. A Voice Note is spoken in the Member's Spoken Language preference. A Voice Note that failed or heard nothing can be read again in another language from its row in the Voice Inbox; that read counts against the Voice Cap.
- ~~**Setup keeps one Voice Note,** reviewed at once, with no Voice Inbox.~~ Superseded by [ADR 0030](0030-setup-uses-the-scan-session-and-voice-inbox.md): Setup uses the Voice Inbox.

## Considered options

- **A persisted Voice Inbox** (IndexedDB). Rejected for the same reasons as ADR 0004: a half-reviewed inbox resurfacing later confuses more than it helps, and Voice Notes are cheap to redo.
- **Merge only the notes the Member selects.** Rejected: a selection mode for little gain; reviewing one note alone covers the rest.
- **De-duplicate across merged notes.** Rejected: it would quietly drop "two more yogurts". Review shows the duplicate.
- **Other indicators,** prototyped on branch `prototype-voice-inbox`: a chip of state dots over the mic with an in-place tray, and a deck of stacked cards. The strip won: it reads at a glance and grows from the existing pill.
- **Keep the Spoken Language chip.** Rejected: the strip now takes its place, and most Members never change language. The need shows up after a misheard read, where re-reading in another language serves it.

## Consequences

- A reload or closed tab loses every unapplied Voice Note in the Voice Inbox.
- Each read counts against the Voice Cap, so a long kitchen round can reach it part-way; notes read before that stay usable.
- Recordings stay in memory until read, and proposals until applied or discarded, which is why the Voice Inbox is capped at 5.
- A merged Review can propose a removal resolved before an earlier note was applied; apply re-resolves as ADR 0017 already does.
