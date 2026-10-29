# Credits belong to the Family, are granted once per Member, and sit beside the Caps

> Amended by [ADR 0035](0035-a-plate-scan-writes-a-recipe-draft.md): writing a Plate Scan's picked dish as a Recipe now has its own Credit Price, charged on its own.

Every AI read costs us money, and nothing records how much: token usage is only logged, transcription reports nothing, and the daily Caps count per Member without history. We add Credits, a budget each Family spends on AI reads, and Usage Records, which keep what each provider call really cost so Credit Prices can be set from evidence.

## Decision

- **Credits belong to the Family**, so a Family shares one Credit Balance. Prices start at 1 Credit for a Scan (each Receipt Section; a Plate Scan includes loading its picked dish), a Voice Note, an Assistant Request, Suggest Guidance and pasted recipe text, and 2 for a recipe read from a web page. Barcode Lookups are free. Prices are set per kind of read in the environment, like the Caps, and changed by redeploying.
- **The Welcome Grant of 100 is given once per Member**, at signup, into their Household of One. A Household of One made later (on leaving, removal, or Family deletion) starts at 0. A Member who joins a Family brings their Household of One's balance with them, since that household is deleted. Every Family that exists at rollout gets one Welcome Grant.
- **The Credit Balance is the sum of a ledger,** never a stored number. Each entry is a Credit Grant (with a reason) or a spend (with the Member and the read). Grants beyond the Welcome Grant are added by hand with a script until top-ups exist.
- **A read holds its Credits when it starts and gives them back if it fails** or finds nothing, the same consume-and-refund rule the Caps use. The balance never goes below zero, a read that cannot be paid for is refused at once, and a read that has started always finishes. A result the Member discards is still paid for.
- **The Caps stay.** They limit how fast a Member can spend; Credits limit how much a Family can spend. A read must pass both.
- **Admin work on Catalog Recipes costs no Credits**, but still leaves Usage Records.
- **One Usage Record per provider call**, not per read: the feature, the Member and Family at that time, the model, input, output, cached and reasoning tokens (or audio seconds for transcription), success or failure, and the cost in USD frozen at that time from a price table in code. Failed calls are recorded too, since we pay for them. Usage Records outlive Members and Families (their links are cleared, not cascaded) and are never shown to Members.

## Considered options

- **A Welcome Grant per Family.** Rejected: a Household of One is created every time a Member leaves or is removed, so leaving and rejoining would mint 100 Credits each time.
- **Credits that follow the Member.** Rejected: the Family is the unit that shares a Pantry and pays together; a per-Member wallet splits a shared pool.
- **Credits instead of Caps.** Rejected: one Member's broken Shortcut could empty the whole Family's balance in minutes.
- **Charging when a read is requested, or only when its result is saved.** Rejected: the first charges for our failures, the second makes reading free for anyone who discards.
- **A stored balance column.** Rejected: it cannot explain itself to a Member asking where the Credits went, and it gives no history to adjust prices from.
- **Charging a Plate Scan's dish pick separately.** Rejected: Members see a Plate Scan as one Scan, and its two calls (the photo, then the picked dish) cost about what a Voice Note's two do. Its token used to load each of up to 5 guessed dishes once, so a client calling the API directly could make 6 calls for one Scan; it now loads one dish, as the app already did.

## Consequences

- Family ids change on leave, remove, join and delete, so the join path must move the abandoned Household of One's balance before deleting it.
- Transcription must start reporting usage (or the server must measure duration); the client's `durationMs` is not trusted for cost.
- When a read is Credit-blocked in the background (Scan Session, Voice Inbox, link reads), it fails like a capped read and can be retried once Credits are added.
