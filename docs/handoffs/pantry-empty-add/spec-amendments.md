# SPEC.md amendments — Empty Pantry + Add to Pantry (2026-10-24)

Add or replace these bullets in `docs/SPEC.md`. Text not listed here stays as it is. Design detail is in `handoff.md`.

## User stories (Pantry) — add

- As a Member with an empty Pantry, I want the page to show me the quickest ways to fill it (scan, speak, type, or move what I ticked while shopping), so that I can get started without hunting for buttons.
- As a Member, I want to add a Batch by photographing the product or scanning its barcode, so that the Ingredient, pack size and product name are filled in for me.
- As a Member, I want to add several things by hand one after another without the form closing, so that stocking up by hand is fast.

## User stories (Scanning) — add

- As a Member adding to my Pantry by hand, I want a barcode I scan from the Add sheet to be confirmed on a card before it fills the sheet, so that a misread costs one tap, not a trip back.

## Implementation Decisions → Pantry — add

- An Empty Pantry (no Batches at all, Expired ones included) shows an empty state instead of the list: dimmed Location chips, a bar to move checked Shopping Items into the Pantry (Finish Shopping, through `/shopping?finish=1`) when there are any, a Gator banner with Scan (camera on Receipt), Say it (lights the Dock mic without disabling the tabs) and Type (Add sheet), and one empty card per Location whose "+" opens the Add sheet with that Location preset. The header holds only the "+" (ADR 0027).
- In a Pantry that has Batches, a Location filter with none shows that Location's empty card instead of "No batches match."
- Manual add is a bottom sheet that replaces the inline add-Batch form, and every entry to that form (the header "+", "Add batch" on an Ingredient card) opens it. Before a pick it offers Take a photo (camera on Product), Scan barcode (camera on Barcode), Say it, the Catalog search, and Recently Stocked tiles (or Popular to start, a fixed list per locale, when there are none) with aisle chips. After a pick, one card holds amount, Location (the Catalog default marked; with none, Cupboard and no mark) and expiry (Usual = Default Expiry, quick picks, or the expiry sheet); the Product Description is a note, folded for typed picks and open for camera picks. Changing the Location does not change the Default Expiry. Saving keeps the sheet open for the next item and lists what was added; each add's toast offers Undo, which deletes only that Batch.

## Implementation Decisions → Scanning — change

- Replace "The add-Batch form's camera (Product and Barcode, for Prefill) uses the same top bar, shutter and slider, with no photo stack." with: The Add sheet's camera (Product and Barcode, for Prefill) opens over the sheet without leaving the Pantry, uses the same top bar, shutter and slider with no photo stack, and shows "Adds to your Pantry" with a Scan several action that closes the sheet and opens the Scan page in the same mode. It is single-shot: a Product photo that reads returns to the sheet with the Ingredient picked, the pack size as the amount and the product name as the Product Description. A read barcode shows a result card (Scan again / Use this, with the Open Food Facts credit when the data came from there). An unknown barcode offers Take a photo (switches to Product) or Type it, and the code goes with the Batch either way, so it becomes a Known Barcode.
- The mode slider order (Receipt, Ingredients, Product, Barcode, Plate) and Barcode's status as a camera mode, not a Scan Mode (ADR 0013, 0016), are unchanged.
- Add to the Barcode guide description: a scan line sweeps inside the guide (static at the middle under reduced motion, hidden once a code is read), on the Scan page and in the Add sheet's camera. The guide size, the absence of a hint and the non-interactive ring stay as they are.
