# Scan Language is separate from the UI locale

Until now every Scan sent one `locale`, the Member's UI language, and the API used it for four jobs: the reading hint in the AI prompt, the language of Ingredient names returned to Review, the tag on Unmatched entries, and the output language of Plate Scan dish titles. A Member who scans a receipt in another language (a Danish receipt with a Romanian UI) got the receipt read with the wrong assumptions about abbreviations, dates and decimal commas, and its Unmatched names tagged with the wrong language.

## Decision

- A **Scan Language** is chosen per Scan, independent of the UI locale. The list is `SCAN_LANGUAGES = ['en', 'ro', 'da']`, the same list as `CATALOG_LOCALES = ['en', 'ro', 'da']` since Danish became a catalog locale (it was wider before). There is no auto-detect.
- **Scan Language drives:** the AI reading hint, and the language tag of Unmatched entries.
- **UI locale drives:** Ingredient names returned to Review, the AI's `fallbackIngredientName`, and Plate Scan dish titles. Plate Scan has no Scan Language.
- The Review line name stays as printed on the receipt or package.
- **Unmatched tagging is per line.** A line whose name is still the scanned text is tagged with the Scan Language. A line the Member renamed or added by hand in Review is tagged with the UI locale.
- **Synonyms may be in any Scan Language.** Display names stay limited to catalog locales. A `da` Synonym exists only for matching.
- The API takes an optional `scanLanguage` next to `locale` on the scan and save endpoints, defaulting to `locale`.

## Consequences

- Curators can turn a Danish raw name into a `da` Synonym, so the next Danish receipt matches without relying on the AI.
- Synonym locale and display-name locale are now two different lists. Admin screens and validation must use the right one.
- Review has to remember each line's original scanned name to choose the tag.
- Danish is now also a UI and catalog locale (issue #98), so a Danish Synonym can sit beside a Danish display name. The two lists are still separate constants, so a future Scan Language need not become a UI locale.
