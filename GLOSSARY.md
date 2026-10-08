# Pocket Pantry

A kitchen app for a person or a family: scan groceries into a shared pantry, keep a shared shopping list, and (later) cook from recipes that match what you have.

## Language

### People

**Member**:
A signed-in person who belongs to exactly one Family.
_Avoid_: User (when the family relationship matters), account

**Family**:
The group that owns a Pantry, a Shopping List, and Family Settings. Every Member belongs to exactly one.
_Avoid_: Household, group, team

**Household of One**:
The Family with a single Member, created automatically at signup and again whenever a Member leaves a Family, is removed from it, or the Family is deleted.
_Avoid_: Solo family, personal account

**Owner**:
The single Member of a Family who can remove Members, regenerate the Invite Code, transfer ownership, and delete the Family.
_Avoid_: Admin (reserved for the catalog role), creator

**Invite Code**:
A short, reusable, expiring code that lets a Member join a Family.
_Avoid_: Invite link, token

**Admin**:
A Member with the catalog-curation role. Unrelated to Family ownership.
_Avoid_: Owner, superuser

### Catalog

**Catalog**:
The canonical set of Ingredients and Categories that everything in the app matches against.
_Avoid_: Ingredient list, dictionary, taxonomy

**Ingredient**:
A canonical, uniquely named entry in the Catalog, such as "Parmesan". Not a product and not a Batch.
_Avoid_: Item, product, food

**Parent Category**:
A top-level grouping of the Catalog, such as "Dairy". Carries the Aisle.
_Avoid_: Department, group

**Leaf Category**:
A granular grouping under a Parent Category, such as "Hard cheese". Every Ingredient belongs to exactly one.
_Avoid_: Subcategory, type

**Aisle**:
The ordered shop section a Parent Category maps to. Used to group the Shopping List.
_Avoid_: Section, department

**Synonym**:
An alternative name for an Ingredient in a given Scan Language, used for matching. Unlike display names, Synonyms are not limited to the catalog locales.
_Avoid_: Alias, keyword

**Default Expiry**:
The number of days after purchase a Batch of an Ingredient is assumed to last, taken from the Leaf Category, falling back to the Parent Category, and overridable per Family.
_Avoid_: Shelf life

**Unmatched**:
The state of a scanned or typed name that could not be matched to an Ingredient with confidence. Unmatched Batches are saved under an "Other" Leaf Category and queued for Admin curation.
_Avoid_: Unknown, custom, uncategorised

### Pantry

**Pantry**:
A Family's inventory of Batches.
_Avoid_: Inventory, stock, fridge

**Batch**:
One purchase of one Ingredient in the Pantry, with its own quantity, expiry date, Location, and optional product description.
_Avoid_: Pantry item, entry, stock line

**Location**:
Where a Batch is stored: fridge, freezer, cupboard, or spices.
_Avoid_: Storage, place

**Product Description**:
The free-text name of the actual product a Batch came from, such as "Grana Padano 200g", kept alongside the matched Ingredient.
_Avoid_: Label, brand

**Expiring Soon**:
A Batch whose expiry date falls within the Family's Stale Threshold. Derived at read time from the expiry date and the current threshold, never stored on the Batch; a Batch with no expiry date is never Expiring Soon.
_Avoid_: About to go stale, going off

**Stale Threshold**:
The Family Setting for how many days before expiry a Batch counts as Expiring Soon.
_Avoid_: Warning window

### Shopping

**Shopping List**:
A Family's single active list of Shopping Items, grouped by Aisle.
_Avoid_: Cart, basket

**Shopping Item**:
One Ingredient wanted on the Shopping List, with a quantity, a checked state, and zero or more Source Recipes.
_Avoid_: Cart item, line

**Source Recipe**:
A recipe whose missing ingredients added a Shopping Item. One Shopping Item may have several.
_Avoid_: Recipe tag, origin

**Finish Shopping**:
The action that moves checked Shopping Items into the Pantry as Batches with Default Expiry, after a Review, archives the list, and starts a new one that carries over the unchecked items.
_Avoid_: Move to pantry, checkout, complete

### Scanning

**Scan**:
A photo sent for recognition. One of four Scan Modes.
_Avoid_: Capture, upload

**Scan Mode**:
Product, Receipt, Plate, or Ingredients.

**Product Scan**:
Recognises a single packaged product and its best-before date from a photo.

**Receipt Scan**:
Recognises every purchased line on a receipt photo.
A long receipt can be scanned across several photos, one per **Scan Language**:
The language the text in a Scan is read in: English, Romanian, or Danish. Chosen per Scan and independent of the Member's UI locale. Plate Scans have none.
_Avoid_: Scan locale, source language

**Receipt Section**: the Member folds the receipt about every 20 items and photographs each fold. The sections are read independently and merged into one Review; each counts as one Scan against the **Scan Cap**. It is still one Receipt Scan of one receipt.

**Receipt Section**:
One photo of a folded part of the same receipt. It is read as one **Scan**, and its lines are merged with the other sections into one Review.

**Plate Scan**:
Recognises a cooked dish from a photo and lists its likely Ingredients for one serving.

**Ingredients Scan**:
Recognises loose ingredients laid out in a photo.

**Match**:
The link from a scanned or typed name to an Ingredient, with a confidence.
_Avoid_: Mapping, resolution

**Review**:
The screen where a Member confirms, edits, or discards results before anything is saved: Scan results, or the Batches proposed for the checked Shopping Items when Finishing Shopping.
_Avoid_: Confirm sheet, preview

**Scan Cap**:
The maximum number of Scans a Member may run per day.
_Avoid_: Quota, rate limit

### Dashboard

**Dashboard**:
A Member's personal home screen made of Widgets.
_Avoid_: Home, overview

**Widget**:
A card on the Dashboard showing one slice of Family data, with a type and a size.
_Avoid_: Card, tile, panel

### Settings

**Family Settings**:
Settings shared by all Members of a Family: Default Expiry overrides per Category and the Stale Threshold.
_Avoid_: Preferences (reserved for per-Member settings)

**Member Preferences**:
Settings private to a Member: locale and Dashboard layout.
_Avoid_: Settings
