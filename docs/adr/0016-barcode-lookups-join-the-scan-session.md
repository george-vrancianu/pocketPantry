# Barcode Lookups join the Scan Session

A Member unpacking a bag of shopping on the Scan page had to take a Product Scan of each item, even for a Known Barcode the Family had already saved. Barcode Lookup is the free, instant path ([ADR 0013](0013-barcode-lookup-is-not-a-scan.md)), but it only filled the add-Batch form. Barcode now sits on the Scan page's mode dial, right after Product, and its lookups ride in the Scan Session as cards, reviewed and saved like any other card. A Barcode Lookup is still not a Scan: it stays a camera mode, not a Scan Mode.

## Decision

- **One card per accepted code.** The camera reads continuously in Barcode mode. Each accepted code adds a card whose thumbnail is the video frame frozen at the moment of the read, with a small barcode badge. The card carries its code and no photo, and moves through the same states as a Product Scan card: reading, then read (one proposed line) or failed (with Retry).
- **Dedupe.** A code identical to the last accepted code is ignored until either a different code is accepted, or 1.5 s pass without that code being seen (each repeated sighting resets the 1.5 s). Each accepted read vibrates briefly (where supported) and is announced through a live region; ignored sightings do neither. A Member holding a pack up gets one card, and a second pack of the same product gets a second card once the first has been moved away.
- **Exempt from the Scan Cap, counted in the Session limit.** A Barcode card is never failed with the Scan Cap and never counts toward it, so Barcode mode keeps working once the Scan Cap is reached. It does count toward the 20-card Session limit, with the same "session full" message, so Review stays manageable.
- **Lookups skip the read queue.** A Barcode card is looked up as soon as it is added, in the UI locale. It takes none of the concurrent photo-read slots and does not wait for one, because a lookup is cheap and quick next to a photo read.
- **Saving teaches the Family.** A Barcode card's line carries its code into the new Batch request, including when the lookup found nothing and after the Member changes the Ingredient or the name. The existing upsert makes it a Known Barcode.
- **A Product Scan card teaches its photo's barcode.** On the Scan page, a Product Scan photo (camera or gallery) is also decoded for a barcode on the device, from the full frame before it is resized for the read. The decode runs alongside the read and settles on its own: it never delays or fails the read, and a code that settles after the card was saved or removed is dropped. The code goes with the card's line into the new Batch only when the read gave exactly one line, and survives edits to the Ingredient or name. It is not a lookup, so the line gets no Open Food Facts credit or Allergen row. If the code already points to another Ingredient, the latest save wins, with no conflict UI. Receipt, Ingredients and Plate Scans are not decoded. The card keeps this in `barcode`, apart from a Barcode card's `code`, so it is never mistaken for a Barcode card.

## Considered Options

- **One aggregated "Barcodes" card holding every code read.** It would be a single place to review a shopping bag, but a wrong read could not be removed or opened on its own, and the card's states would mix reading, read and failed. One card per code reuses everything a card already does.
- **A per-code count on a single card per product (scan the same code twice for quantity 2).** It would hide that the Member scanned two packs, make the thumbnail ambiguous, and tie the dedupe rule to quantity. Quantity belongs to the line the Member confirms in Review. A second pack is a second card.

## Consequences

- The Session card's `mode` is a camera mode, and its photo is optional. Code that assumes every card has a photo, or that every card is read from a read slot, has to check for Barcode first.
- Barcode cards make the Scan Cap and the Session limit different rules: only Scans count toward the first, every card toward the second.
- A not-found code still becomes a card with one empty line. Open Food Facts coverage for Romanian and Danish products is patchy, and keeping these cards is how Families build their Known Barcodes.
