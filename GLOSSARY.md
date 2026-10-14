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
A Member with the catalog-curation role. Unrelated to Family ownership. Never granted at signup; set directly in the database.
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
The ordered shop section a Parent Category maps to. Used to group the Shopping List, in the shop order Admins set.
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

**Pantry Basic**:
An Ingredient Admins flag as always at hand, such as water, salt, or black pepper. Recipe matching treats its Ingredient Lines as covered and never adds them to the Shopping List on its own; a Member can still add one by hand.
_Avoid_: Staple (a Family's always-wanted Ingredient), essential, cupboard item

**Ingredient Icon**:
The picture shown for an Ingredient wherever it appears, coloured by its Aisle. Several Ingredients may share one, and an Ingredient without one shows the Default Icon. Belongs to the Ingredient, never to a Product Description.
_Avoid_: product icon, category icon, thumbnail

**Default Icon**:
The generic Ingredient Icon for an Ingredient that has none of its own, and for Unmatched names.
_Avoid_: placeholder, fallback tile

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

**Expired**:
A Batch whose expiry date is before today. A Batch that expires today is not yet Expired, and a Batch with no expiry date never is. Derived at read time, never stored on the Batch.
_Avoid_: Stale, gone off, past date

**Expiring Soon**:
A Batch that is not Expired and whose expiry date is at most the Family's Stale Threshold days away, today included. Derived at read time from the expiry date and the current threshold, never stored on the Batch; a Batch with no expiry date is never Expiring Soon.
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
A Recipe whose missing ingredients added a Shopping Item. Always a specific Base Recipe or Variant. One Shopping Item may have several.
_Avoid_: Recipe tag, origin

**Finish Shopping**:
The action that moves checked Shopping Items into the Pantry as Batches with Default Expiry, after a Review, archives the list, and starts a new one that carries over the unchecked items. The button that starts it may read "Move N to Pantry"; the action is still Finish Shopping.
_Avoid_: Move to pantry (as a name for the action), checkout, complete

**Staple**:
An Ingredient the Family always wants in stock, with an optional preferred quantity and unit. A Staple with no unexpired Batch in the Pantry is missing and becomes a Suggestion.
_Avoid_: Must-have, favourite, essential

**Shopping Template**:
A named, reusable list of Ingredients or Unmatched names, each with an optional quantity and unit, that a Member applies to the Shopping List. Not a Shopping List: applying it adds Shopping Items to the one active list.
_Avoid_: Predefined list, saved list, preset

**Template Line**:
One Ingredient or Unmatched name in a Shopping Template, with an optional quantity and unit. Applying the Shopping Template turns each Template Line into a Shopping Item.
_Avoid_: Template item, entry

**Used Up**:
The state of an Ingredient whose last Batch was removed from the Pantry within the past 30 days. A Staple is never Used Up; it is missing instead.
_Avoid_: Run out, finished, nothing left

**Running low**:
A manual flag a Family sets on an Ingredient it is nearly out of, while the Ingredient still has at least one Batch. Per Family, never set automatically from quantities; cleared when a Batch is added or the last Batch is removed. Turning it off is the only way to clear it from the Running low Suggestions.
_Avoid_: Low stock, almost out, low quantity

**Suggestion**:
A proposed Shopping Item, from a missing Staple, a Used Up Ingredient, or a Running low Ingredient, that is not on the Shopping List yet. Derived at read time, never added automatically. Dismissing a missing Staple or Used Up Suggestion hides it for the Family until the Ingredient is restocked and runs out again; a Running low Suggestion has no dismissal, and it leaves when its flag is turned off. Not to be confused with plate matches: the closest Base Recipes offered when saving a Plate Scan as a Recipe.
_Avoid_: Alert, notification, recommendation

### Scanning

**Scan**:
A photo sent for recognition. One of four Scan Modes.
_Avoid_: Capture, upload

**Scan Session**:
The Scans a Member takes from opening the camera until they are added or discarded. It is held in the app, in memory, and each Scan in it is read in the background while the Member keeps scanning.
_Avoid_: Batch (a Batch is a Pantry purchase), queue

**Scan Mode**:
Product, Receipt, Plate, or Ingredients.

**Product Scan**:
Recognises a single packaged product and its best-before date from a photo.

**Receipt Scan**:
Recognises every purchased line on a receipt photo.
A long receipt can be scanned across several photos, one per **Receipt Section**: the Member folds the receipt about every 20 items and photographs each fold. In Review the sections are joined into one card with "Merge with previous" (and undone with "Split"); each counts as one Scan against the **Scan Cap**. It is still one Receipt Scan of one receipt.

**Receipt Section**:
One photo of a folded part of the same receipt. It is read as one **Scan**, and in Review its card is merged with the card of the previous section (up to 10 sections).

**Scan Language**:
The language the text in a Scan is read in: English, Romanian, or Danish. Chosen per Scan and independent of the Member's UI locale. Plate Scans have none.
_Avoid_: Scan locale, source language

**Plate Scan**:
Recognises a cooked dish from a photo and lists its likely Ingredients for one serving.

**Ingredients Scan**:
Recognises loose ingredients laid out in a photo.

**Match**:
The link from a scanned or typed name to an Ingredient, with a confidence.
_Avoid_: Mapping, resolution

**Review**:
The screen where a Member confirms, edits, or discards results before anything is saved: Scan results, or the Batches proposed for the checked Shopping Items when Finishing Shopping. For a Scan Session it is an overview with one card per Scan; opening a card edits that Scan's lines, and saving commits that card alone.
_Avoid_: Confirm sheet, preview

**Scan Cap**:
The maximum number of Scans a Member may run per day.
_Avoid_: Quota, rate limit

### Recipes

**Recipe**:
Something a Member can cook, with its own ingredients and steps. Either a Base Recipe or a Variant.
_Avoid_: Dish, meal

**Base Recipe**:
A Recipe with no parent, such as "Omelette". Cookable on its own, and the starting point its Variants branch from.
_Avoid_: Category, recipe family, parent recipe

**Variant**:
A Recipe that branches from exactly one Base Recipe, such as "Mediterranean omelette" or "Frittata". A Variant never has Variants of its own.
_Avoid_: Sub-recipe, version, child recipe

**Catalog Recipe**:
A Recipe curated by Admins and shared by every Family. Members can cook it and make Variants of it, but not change it.
_Avoid_: Global recipe, built-in recipe

**Family Recipe**:
A Recipe owned by one Family, which its Members can edit and delete. Either a Base Recipe or a Variant, possibly of a Catalog Recipe.
_Avoid_: Custom recipe, my recipe, user recipe

**Cuisine**:
An optional tag for the culinary region a Recipe comes from, such as Mediterranean. At most one per Recipe.
_Avoid_: Region, style, origin

**Method**:
An optional tag for the cooking technique that sets a Recipe apart, such as rolled, folded, or frittata. At most one per Recipe.
_Avoid_: Technique, style, pro tip

**Tip**:
A short piece of cooking advice attached to a Recipe or to one of its steps. It doesn't change the dish.
_Avoid_: Pro tip, hint, note

**Servings**:
The number of people a Recipe's quantities are written for. A Member can pick another number on the Recipe, and quantities scale in proportion.
_Avoid_: Portions, yield

**Ingredient Line**:
One ingredient of a Recipe: an Ingredient (or, on a Family Recipe, an Unmatched name), an optional quantity and unit, an optional preparation note, and whether it is optional.
_Avoid_: Recipe item, component

**Step**:
One ordered instruction in a Recipe, optionally with a timer. Step Tips attach to a Step.
_Avoid_: Instruction, direction

**Can Make**:
A Recipe whose required Ingredient Lines are all covered by the Pantry's unexpired Batches. Optional lines and Pantry Basics never block it.
_Avoid_: Cookable, available, in stock

**Pairing**:
A food or drink that goes well with a Recipe, with a reason why. It may link to a Catalog Ingredient or another Recipe.
_Avoid_: Match, side, suggestion

**Pairing Principle**:
The general rule behind a Pairing, such as acid cuts fat or salt balances sweet. Optional, from a fixed list.
_Avoid_: Flavour rule

**Nutrition Note**:
A short, free-text recommendation on how nourishing a Recipe is, covering both the good and the bad, such as "Rich in protein and filling; fairly high in fat from the butter and cheese." A general direction, never values.
_Avoid_: Macros, nutrition facts, calories

**Eating Moment**:
A time or situation for eating, such as Morning, After a workout, or Before bed, from a list Admins curate and translate. A Recipe marks each Eating Moment it uses as Good for or Avoid, with an optional reason.
_Avoid_: Occasion, meal time, timing

### Lists

**Undo window**:
The 5 seconds after a Member removes a row from a list ([ADR 0009](docs/adr/0009-row-delete-is-deferred-until-undo-expires.md)), during which Undo puts it back. The delete is only sent when the window ends.
_Avoid_: Grace period, trash

**Row hint**:
The one-time pill and peek that teach a list's swipe and hold gestures, shown once per list and remembered on the device. Not a Tip, which is cooking advice on a Recipe.
_Avoid_: Tutorial, onboarding

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
Settings private to a Member: locale, Theme and Dashboard layout.
_Avoid_: Settings

**Theme**:
The app's look, one of Warm editorial (`warm`, the default), Minimal crisp (`minimal`) and Dark-first (`dark`). A Member Preference, so it follows the Member across devices.
_Avoid_: Skin, colour scheme (MUI's mechanism behind a Theme), mode

**Match system**:
A per-device switch that makes the app follow the device's dark mode: Dark-first in dark mode, the Member's chosen light Theme in light mode (Warm editorial if they chose Dark-first). Stored on the device, not a Member Preference.
_Avoid_: Auto theme, system theme
