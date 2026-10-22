# Voice Notes are read into Voice Actions that are applied after Review

In the shop, with a basket in one hand, Members want to tell the app what they did instead of tapping through it: "got the bread and sausages, take milk off, put two yogurts in the fridge, they expire Friday". A Voice Note is held-to-talk on the Shopping List or the Pantry. The API transcribes it, reads the transcript into Voice Actions, and returns them for Review. Nothing is written until the Member applies them. Only some of these choices follow from the existing Scans, so they are recorded here.

## Decision

- **A Voice Note is not a Scan.** It is not a photo, it does not join the Scan Session, and it counts against its own Voice Cap (`VOICE_DAILY_CAP`, default 50), not the Scan Cap. Both caps share `scan_usage` with a `kind` column, and both charge before the provider call and refund on failure. An empty transcript is refunded too.
- **Two provider calls, each with its own model setting.** Transcription uses `AI_TRANSCRIBE_MODEL` (`gpt-transcribe`) on the uploaded recording. The transcript is then read with `AI_TEXT_MODEL` (`gpt-5-mini`), not the vision model. The Scan Language (since ADR 0022, the Spoken Language) is the main transcription hint, and the other supported languages are extra hints. Recordings last at most 60 seconds, and the API stores neither the audio nor the transcript.
- **Matching is the Receipt Scan pipeline.** The Catalog goes into the prompt, and the model returns `matchedIngredientId` with a confidence. The API then validates the id, prefers an exact name or Synonym hit, and drops Matches below the threshold to Unmatched. The Catalog leads the prompt so provider caching discounts it.
- **The model names Ingredients, never rows.** The API resolves each Voice Action to the Shopping Item or Batches it acts on, deterministically:
  - Removing from the Pantry with no quantity takes the one Batch expiring soonest, with undated Batches last.
  - "All" or "out of" takes every Batch.
  - A quantity in the Batch's unit is subtracted, soonest-expiring Batch first, deleting Batches that reach zero.
  - Anything else asks for a Batch in Review.
  - Checking an Ingredient that is not on the Shopping List adds it checked. Checking it with a quantity sets the item to that quantity.
  - Running low on an Ingredient with no Batch becomes an add to the Shopping List.
- **The page sets the default list.** On the Shopping List, Voice Actions target the Shopping List, and on the Pantry they target the Pantry, unless the Member names the other list for that action. (Amended by ADR 0021: Voice Notes are recorded from the Dock, and other pages set no default list.)
- **Dates are resolved against the Member's day.** The app sends its local date with the recording, and the model returns ISO dates. A date in the past or more than five years ahead is dropped, so the Default Expiry applies, as it does for an unspoken one.
- **Review, then apply, with no Undo.** Review lists the Voice Actions by list under the collapsed transcript. Each one can be removed, edited (quantity, unit, expiry, Match) or kept. Apply writes them all in one transaction through the Shopping and Pantry services, so Batch deletes keep Used Up and Running low correct (ADR 0005). Every Voice Action is re-resolved on apply: one already done counts as applied, and one that can no longer happen is skipped and reported, without failing the rest.

## Alternatives considered

- **Voice as a Scan Mode, or under the Scan Cap.** Rejected: it has no photo, and a Member recording many cheap Voice Notes would lock themselves out of Receipt Scans.
- **Reuse the vision model for the transcript.** Rejected: the transcript is text only, and a separate setting lets cost and quality be tuned on their own.
- **Let the model pick Shopping Item or Batch ids from the current lists.** Rejected: row choice must be predictable and testable without a provider, and a model can name a row that is gone.
- **Apply immediately with an Undo snackbar, or defer the write until Undo expires (ADR 0009).** Rejected: a Voice Note mixes actions across two lists, and showing all of them as pending before they are written is the most expensive client work in the feature. Re-creating a deleted Batch would also reset its stock history. Review is the safety net instead.
- **Reject the whole apply when the lists changed since the proposal.** Rejected: Family members shopping together would hit this, and one stale row would throw away every other Voice Action.
- **Browser speech recognition.** Rejected: support and quality vary by browser and are weakest for Romanian and Danish.
- **Persist failed recordings for offline retry.** Deferred: a failed upload stays in memory with Retry and is lost on reload, like a failed Scan.

## Consequences

- A Voice Note costs two provider calls. Transcription is most of the cost.
- A misheard removal is only caught in Review, so Review always shows the Batch it will take, with its expiry date.
- Review now covers a third kind of result, beside Scans and Finish Shopping.
- The read is tuned with recorded real transcripts in English, Romanian and Danish, replayed through `scan-replay`, alongside mocked provider tests in CI.
