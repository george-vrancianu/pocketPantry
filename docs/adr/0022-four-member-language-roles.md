# Four Member languages: UI, Catalog, Spoken and Scan

A Romanian living in Copenhagen may want the app in English, Ingredient names in Romanian, Voice Notes spoken in Romanian and receipts read in Danish. ADR 0003 split only the Scan Language from the UI locale. The UI locale still drove Catalog names and the names the AI makes up, and Voice Notes shared the Scan Language. We give a Member four languages, each with one job.

## Decision

- **UI Language:** the app's own text, and how dates and numbers are written. Nothing else.
- **Catalog Language:** everything Admins curate and translate (Ingredients, Categories, Aisles, Allergens, Eating Moments, Cuisines, Methods, Catalog Recipes), plus names the AI makes up: `fallbackIngredientName` for Scans, Voice Notes and Plate Scans, and Plate Scan dish titles. Unmatched raw names and new Family Ingredients are tagged with it. If a name is missing, the fallback is Catalog Language, then English, then the canonical name. The UI Language is not added to that chain.
- **Spoken Language:** the transcription hint and reading language for Voice Notes. It can be changed for a single Voice Note.
- **Scan Language:** the printed text in a Scan only, as in ADR 0003. It can be changed for one Scan Session (until the camera is closed or the Session is added or discarded), and the change is not saved.
- **Catalog, Spoken and Scan Language start as "Same as UI Language"** and follow it until the Member picks a language. A one-language Member never notices the split.
- **A one-use override is not remembered.** The device-local "last Scan Language" memory is removed. The stored Member Preference is the only default, and it is the same on every device.
- **The API reads the Member's stored Preferences itself** instead of trusting a `locale` query sent by the browser. Only signed-out screens and Admin previews in another language send a language explicitly.
- **Assistant Requests keep ADR 0019's rule:** the language is told from the dictated text, and the reply is spoken in it. What is written (Shopping Item names, Unmatched names) follows the Catalog Language instead of the UI Language.
- **No automatic translation of text Members wrote.** Typed Shopping Items, Unmatched raw names, Family Ingredients and Family Recipes are shown as written. Items linked to an Ingredient are shown to each viewer in their own Catalog Language.

## Considered options

- **Copying the UI Language into each new setting at signup.** Rejected: a one-language Member who later changes the UI Language would be left with names, Scans and speech in the old language.
- **An Assistant Language per Assistant Token.** Rejected, as in ADR 0019: the Shortcut's Dictate Text can use Romanian even though Siri can't, and telling the language from the text needs no setting to keep in step.
- **Sending `catalogLanguage` on every request.** Rejected: each new endpoint would have to remember to send it, and Assistant Requests already rely on stored settings.

## Consequences

- This supersedes ADR 0003's rule that the UI locale drives names in Review, `fallbackIngredientName` and Plate Scan titles. The Catalog Language now drives them.
- Every endpoint that takes `locale` today must resolve the language from the Member.
- Members in one Family can see the same linked Shopping Item under different names, each in their own Catalog Language.
