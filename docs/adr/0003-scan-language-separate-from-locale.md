# Scan Language is separate from the UI locale

Until now every Scan sent one `locale`, the Member's UI language, and the API used it for four jobs: the reading hint in the AI prompt, the language of Ingredient names returned to Review, the tag on Unmatched entries, and the output language of Plate Scan dish titles. A Member who scans a receipt in another language (a Danish receipt with a Romanian UI) got the receipt read with the wrong assumptions about abbreviations, dates and decimal commas, and its Unmatched names tagged with the wrong language.

## Decision

- A **Scan Language** is chosen per Scan, independent of the UI locale. The list is `SCAN_LANGUAGES = ['en', 'ro', 'da']`, wider than `CATALOG_LOCALES = ['en', 'ro']`. There is no auto-detect.
- **Scan Language drives:** the AI reading hint, and the language tag of the printed text kept on Unmatched entries.
- **UI locale drives:** Ingredient names returned to Review, the AI's `fallbackIngredientName`, and Plate Scan dish titles. Plate Scan has no Scan Language.
- The Review line name of an Unmatched line is the generic `fallbackIngredientName`, so it is in the UI locale. The text printed on the receipt or package (`productName` stays in its printed language) is shown beside it as the source line.
- **An Unmatched entry keeps two texts, each with its own language.** The raw name (the Review line name, AI-written or typed by the Member) is tagged with the UI locale. The printed text, when the line came from a Scan, is stored with the Scan Language.
- When resolving an Unmatched entry, the curator can also add the printed text as a Synonym in its Scan Language.
- Exact matching on the next Scan also looks up the printed text, so such a Synonym matches without relying on the AI.
- **Synonyms may be in any Scan Language.** Display names stay limited to catalog locales. A `da` Synonym exists only for matching.
- The API takes an optional `scanLanguage` next to `locale` on the scan and save endpoints, defaulting to `locale`.

## Consequences

- Curators can turn the printed text of a Danish receipt line into a `da` Synonym, so the next Danish receipt matches without relying on the AI. Raw names never get a language they aren't written in.
- Synonym locale and display-name locale are now two different lists. Admin screens and validation must use the right one.
- Review sends the printed text with each Unmatched line on save. Unmatched entries gain a printed text and its language (a migration).
- Danish as a UI and catalog locale is separate work. Until it lands, a Danish Synonym has no Danish display name beside it.
