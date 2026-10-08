# Scan Language is separate from the UI locale

Until now every Scan sent one `locale`, the Member's UI language, and the API used it for four jobs: the reading hint in the AI prompt, the language of Ingredient names returned to Review, the tag on Unmatched entries, and the output language of Plate Scan dish titles. A Member who scans a receipt in another language (a Danish receipt with a Romanian UI) got the receipt read with the wrong assumptions about abbreviations, dates and decimal commas, and its Unmatched names tagged with the wrong language.

## Decision

- A **Scan Language** is chosen per Scan, independent of the UI locale. The list is `SCAN_LANGUAGES = ['en', 'ro', 'da']`. There is no auto-detect.
- **Scan Language drives:** the AI reading hint, and the language tag of the printed text kept on Unmatched entries.
- **UI locale drives:** Ingredient names returned to Review, the AI's `fallbackIngredientName`, and Plate Scan dish titles. Plate Scan has no Scan Language.
- The Review line name of an Unmatched line is the generic `fallbackIngredientName`, so it is in the UI locale. The text printed on the receipt or package is shown beside it as the source line, and `productName` stays in its printed language.
- **An Unmatched entry keeps two texts, each with its own language.** The raw name (the Review line name, whether the AI wrote it or the Member typed it) is tagged with the UI locale. The printed text, when the line came from a Scan, is stored with the Scan Language.
- When resolving an Unmatched entry, the curator can also add the printed text as a Synonym in its Scan Language (`sourceSynonym`, unchecked by default). The raw-name Synonym takes a catalog locale.
- Exact matching on the next Scan also looks up the printed text, so such a Synonym matches without relying on the AI.
- **Synonyms may be in any Scan Language and exist only for matching. Display names are limited to `CATALOG_LOCALES`.** Since Danish became a catalog locale (#98) the two lists are equal, but they stay separate constants so a future scan-only language is possible.
- The API takes an optional `scanLanguage` next to `locale` on the scan and save endpoints, defaulting to `locale`.

## Consequences

- Curators can turn the printed text of a foreign receipt line into a Synonym in that language, so the next such receipt matches without relying on the AI. Raw names never get a language they aren't written in.
- Admin screens and validation must use the right list: Scan Languages for Synonyms, catalog locales for display names.
- Review sends the printed text with each Unmatched line on save. Unmatched entries have a printed text and its language (migration 0010).
- A generic printed word made into a Synonym (e.g. "OST") would match every such line and skip the confidence threshold, which is why the option starts unchecked.
