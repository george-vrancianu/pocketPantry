# Voice Notes and Assistant Requests answer Pantry Questions

> Amended by ADR 0023: the "Pantry check" Shortcut is retired; "Gator, do we have" answers Pantry Questions instead.

Standing in the shop, a Member wants to ask "Do we have milk and butter?" and hear the answer without opening the Pantry and scrolling. Today the read sends every question to `unsupported`, and ADR 0019 lists questions answered aloud as out of scope. This record adds Pantry Questions to both Voice Notes and Assistant Requests. It amends ADR 0019, and ADR 0017 for Voice Notes.

## Decision

- **A Pantry Question asks only whether named Ingredients are in the Pantry.** "How much milk do we have?" and "Is there milk in the fridge?" are read as the same question, and their amount or Location is ignored rather than refused, because every answer already gives the quantity and Location. Wider questions, such as what is Expiring Soon, what is on the Shopping List or what is Running low, are not Pantry Questions and stay in `unsupported`.
- **It is read in the same model call as Voice Actions.** The read schema gains a `questions[]` list beside `actions[]` and `unsupported[]`. Each entry names one Ingredient and is matched exactly like a Voice Action. A Pantry Question is not a Voice Action and not a new `op`: it never reaches the Voice Action handlers, Review or apply. One request may mix both, as in "Do we have milk? Add eggs."
- **The API answers it from the Family's data, deterministically.** For each Ingredient:
  - **Yes** when it has at least one Batch that is not Expired. The answer gives the quantity summed per unit, never converting between units (as in the ADR 0002 roll-up), the Location, and whether a Batch is Expiring Soon under the Family's Stale Threshold. It adds "running low" when the Ingredient is flagged Running low.
  - **Yes** for a Pantry Basic with no Batch.
  - **Only expired** when every Batch is Expired.
  - **No** when it has no Batch.
  - A "no" or "only expired" answer says when the Ingredient is already on the Shopping List. Used Up is not mentioned.
- **Unsure is never "no".** A name that matches no Ingredient with confidence is compared, by normalised name, with Unmatched Batches and Shopping Items (as voice already matches rows) before giving up. If nothing matches, the answer is "not sure", never "no". Category words such as "cheese" are not expanded to the Ingredients in a Category.
- **Assistant Requests speak the answers before the Voice Action outcomes.** Each Ingredient that is in the Pantry gets its own clause with its details. Those that are not are grouped by answer into one list each, in en, ro and da, in the same language as the rest of the reply. At most 8 Ingredients are spoken, followed by "and N more, check the app". There is no follow-up turn: the Shortcut cannot ask back.
- **A second Shortcut, "Pantry check".** It sends the dictated text to the same Assistant Request endpoint, so "Hey Siri, Pantry check" reads naturally. "Pantry add" keeps working and answers questions too.
- **Assistant Tokens may now read the Pantry.** Amending ADR 0019, a leaked token can learn what is in the Family's Pantry and on its Shopping List, as well as add to the list and flag Running low. It still works on no other endpoint, and it can still be revoked in Settings, whose copy says so.
- **In the app, answers are shown, not spoken.** A Voice Note with only Pantry Questions opens an answer sheet with one row per Ingredient and closes with Done. A Voice Note that also has Voice Actions shows the answers as a card at the top of Review, and Apply covers only the Voice Actions.
- **"Add N to shopping list" from the answers.** The answer sheet and card offer one button that adds every "no", "only expired" and Running low Ingredient that is not already on the Shopping List. It applies `shopping.add` Voice Actions and reports with the usual apply toast, with no Undo, as in ADR 0017. Assistant Requests have no such offer: the Member says "Pantry add butter".
- **The caps are unchanged.** A Voice Note with a Pantry Question counts against the Voice Cap, and an Assistant Request against the Assistant Cap. A Pantry Question costs nothing extra.

## Alternatives considered

- **A separate model call to classify questions before the read.** Rejected: one more provider call per request, a second prompt to keep in step, and no cache sharing with the Catalog prefix.
- **A Pantry Question as a new Voice Action `op`.** Rejected: every `op` changes data and goes through Review and apply. A question would need a handler that never writes, and Review would show a row with nothing to confirm.
- **Answering from the client-side roll-up.** Rejected: Assistant Requests have no client. The API sums per unit itself, with the same rules as the roll-up.
- **Expanding Category words to their Ingredients ("cheese: Parmesan and Cheddar").** Rejected for now: matching only links names to Ingredients, and answering by Category needs new matching work.
- **Asking back which Ingredient was meant.** Rejected: an Apple Shortcut has no cheap follow-up turn.
- **A per-token "can read Pantry" switch, or a separate kind of token for questions.** Rejected: the token is per Member, revocable and limited to one endpoint, and Pantry contents are low sensitivity. A switch would add Settings UI for little protection.
- **Showing the answer as a toast.** Rejected: toasts disappear and do not fit several Ingredients.
- **Answering "how much" and "where" as separate questions.** Rejected: every answer already carries both.
- **Mentioning Used Up ("you ran out 3 days ago").** Rejected: it lengthens speech, and the Shopping List mention already answers "do I need to buy it?".

## Consequences

- The read prompt stops sending these questions to `unsupported`, and the shared read schema gains `questions[]`.
- The API gets a server-side Pantry answer that repeats the roll-up's per-unit summing, and the two must agree.
- The spoken-reply dictionary in `assistant-speech.ts` gains answer clauses in en, ro and da.
- Review gains an answer card, and voice gains an answer sheet.
- `docs/siri-shortcut.md` and the Siri section in Settings gain a second Shortcut.
- A wrong Match gives a wrong answer, but nothing is written, so a misheard question costs only a second ask.
