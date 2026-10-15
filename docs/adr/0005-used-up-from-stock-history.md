# Used Up comes from a stock history table, not soft-deleted Batches

Used Up Suggestions need to know that an Ingredient was in the Pantry and no longer is. The Pantry keeps no record of that: deleting a Batch is a hard delete (`pantry.service.ts`), a Batch's quantity can't be 0 (`batches_quantity_positive`), and there is no consumption log. The only history today is the checked Shopping Items on archived lists, which only covers purchases made through Finish Shopping.

## Decision

- A new table holds one row per Family and Ingredient with `last_stocked_at` and a nullable `used_up_at`.
- Whenever a Batch is created for a matched Ingredient (manual add, Scan confirmation, Finish Shopping, or Admin relinking of an Unmatched Batch), the row is upserted with `last_stocked_at = now()` and `used_up_at = null`. Creating a Batch also clears any dismissal for that Ingredient.
- When a Batch delete leaves the Ingredient with no Batches, `used_up_at` is set to now, unless the deleted Batch was created less than 10 minutes earlier (a mistaken entry).
- An Ingredient is Used Up when `used_up_at` is within the past 30 days, it has no Batches, and it is not a Staple. Dismissing a Used Up Suggestion clears `used_up_at`.
- The migration fills the table from current Batches (`last_stocked_at` = newest `created_at`, `used_up_at` null). Ingredients used up before the release are not recovered.

## Alternatives rejected

- **Soft-delete Batches (`deleted_at`).** Every Pantry read, the roll-up ([ADR 0002](0002-pantry-rollup-and-search-client-side.md)), Expiring Soon, Finish Shopping and Scan ticking would have to filter out deleted rows. Missing that filter anywhere is a silent bug, and deleted Batches build up forever.
- **Derive from archived Shopping Lists.** This misses everything that entered the Pantry by Scan or manual add, which is most of it.

## Consequences

- Every place that creates or deletes Batches must update the table. The writes belong in the Pantry service's create and delete paths, not in each caller.
- A mistaken re-stock (add, then delete within 10 minutes) is not a use, but the add already cleared any existing `used_up_at` and Staple dismissal, and they stay cleared.
- The table records only the latest stock cycle per Ingredient. It is not a consumption log, and analytics like "how often do we buy milk" need something else.
- Wave 2 cook confirmation with Pantry deduction will remove Batches too, and must go through the same delete path so Used Up keeps working.
