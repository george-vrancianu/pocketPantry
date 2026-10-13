# Row delete is deferred until its Undo expires

Row gestures (swipe left to remove, `docs/handoffs/row-gestures-handoff.zip`) put an Undo on every removal from a list. `docs/handoffs/shopping/shopping-handoff.md:30` had ruled out Undo on Shopping Items because deleting and re-adding loses the Source Recipes, and deleting a Batch is a hard delete ([ADR 0005](0005-used-up-from-stock-history.md)), so re-adding one would make a new Batch and could set Used Up by mistake. We keep the Undo and make it lossless by not sending the delete until the Undo is gone.

## Decision

- For Batches, Shopping Items and Staples, removing a row hides it in the client straight away. The delete request is sent when its Undo toast closes, is replaced by another toast, or the Member leaves the page (route change or `pagehide`). Undo just shows the row again; no request is made.
- While a delete is pending, refetches (such as the Shopping List's 10 s poll) filter that record out so the row does not come back.
- Only the most recent removal can be undone. A new toast sends any pending delete at once.
- If the delayed delete fails, the row comes back with an error toast.
- Template Lines are the exception: they are deleted at once and Undo puts the line back at its old position by replacing the Template's lines again. A Template Line is only a name, quantity and unit, so re-creating it loses nothing, and every Template save replaces all lines, which would otherwise have to leave out pending deletes.

## Alternatives rejected

- **Delete at once, re-add on Undo.** This loses Source Recipes on Shopping Items and creates a new Batch (and possibly a false Used Up) in the Pantry.
- **Soft delete on the server.** This was already rejected for Batches in ADR 0005.

## Consequences

- Other Members of the Family keep seeing a removed row for up to the Undo window (5 s).
- If the app is killed during the window, the delete is lost and the row is still there next time. That is the safe way to fail.
