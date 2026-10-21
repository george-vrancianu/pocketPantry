# Barcode Lookup is not a Scan; Open Food Facts behind a Family's Known Barcodes

Members want the add-Batch form prefilled from a product, and a photo read costs tokens and a Scan. We add Barcode Lookup, which wave 1 had ruled out ("Barcode scanning and external product databases"). The barcode is decoded on the device and looked up through the API: first the Family's Known Barcodes, then a shared cache of Open Food Facts results, then Open Food Facts itself. Because no photo is sent for recognition, a Barcode Lookup is not a Scan. It has no Scan Language and never counts against the Scan Cap, even though Barcode sits on the camera's mode dial.

## Decision

- Decoding runs in the browser through the `BarcodeDetector` API, with a ZXing WASM ponyfill where the browser lacks it (Firefox, iOS Safari). The WASM loads only when Barcode mode is first opened or a Product photo is first decoded. Formats: EAN-13, EAN-8, UPC-A, UPC-E.
- The lookup goes through the API, never from the browser to Open Food Facts. The API holds the Known Barcodes, caches results for every Family (hits for 30 days, not-found for 1 day), sends the User-Agent Open Food Facts asks for, and serves the later Flutter app too.
- An Open Food Facts product is matched to an Ingredient deterministically: an exact Synonym or name lookup, then the Catalog search. There is no AI call. A miss leaves the Ingredient unpicked, with the product name typed into the search.
- A Known Barcode belongs to a Family and points to an Ingredient or an Unmatched name, plus a Product Description. It is upserted in the same transaction as the Batch created with that barcode, and the latest save wins. The Batch itself stores no barcode. Barcodes are stored, cached and looked up in one canonical form, GTIN-13 (a UPC-A gets a leading 0, a UPC-E is expanded first; an EAN-8 stays 8 digits), and a code with an invalid check digit is rejected before Open Food Facts is called.
- Prefill shows "Product data: Open Food Facts" when the values came from there (ODbL attribution).

## Considered Options

- **Barcode as a fifth Scan Mode, counted against the Scan Cap.** The cap exists because recognition costs money; a lookup doesn't.
- **A text-only AI match of the Open Food Facts name.** It's cheaper than a photo but still costs tokens. A one-tap miss is acceptable because the pick then becomes a Known Barcode.
- **A commercial GTIN API, or an Admin-curated barcode table.** These cost money or curation effort up front. Known Barcodes can be promoted to a shared table later, as Family Ingredients are.

## Consequences

- Open Food Facts coverage for Romanian and Danish products is patchy. The Family's Known Barcodes, not Open Food Facts, are what make repeat purchases instant.
- Open Food Facts allows 15 product reads a minute per IP, so Barcode Lookups have a Lookup Limit (#416): 8 a minute per Member and 12 for the whole API process, counting only calls that really go out (not Known Barcodes, cache hits or invalid codes). Over it the API answers 429 `barcode.rate_limited` with Retry-After. Per Member, not per Family, because a Member's scan session is what bursts; the global limit bounds a Family of scanners. In memory and per process, like the Invite Code limit.
