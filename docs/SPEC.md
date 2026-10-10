# Pocket Pantry: Wave 1 Spec

Status: agreed 2026-10-01 after a grilling session. Vocabulary follows `GLOSSARY.md`. Visual reference is `pocket-pantry-handoff/HANDOFF.md` and the mockups in `pocket-pantry-handoff/design-source/`.

## Problem Statement

A family buys groceries, puts them away, and forgets what they have. Food expires unnoticed. Shopping lists live in one person's head or in a chat thread nobody updates. Adding what you bought to any tracking app is so tedious that nobody keeps it up.

The retzetar MVP proved that photographing a receipt, a product, a plate, or a pile of ingredients and matching the result to a canonical ingredient catalog works well enough to be useful. But retzetar is single-user, has no notion of a family, and its design was never finished.

## Solution

Pocket Pantry is a mobile-first web app, with a Flutter mobile app planned later against the same API. A Member belongs to one Family. The Family shares a Pantry, a Shopping List, and Family Settings. Groceries enter the Pantry by Scan, by Finish Shopping, or by manual entry, and every entry is matched to the Catalog so the app can reason about what the family actually has. Expiry is tracked per Batch, and Expiring Soon items surface on the Dashboard.

Wave 1 is a vertical slice: auth, Family, Pantry, the four Scan Modes, Shopping List, Dashboard, Family Settings, Admin catalog curation, and full internationalisation. Recipes, alerts, and push come in wave 2.

## User Stories

### Account and Family

1. As a visitor, I want to sign up with email and password, so that I can start using the app.
2. As a visitor, I want to sign in and stay signed in across visits, so that I don't log in every time.
3. As a new Member, I want a Household of One created for me at signup, so that I can use the app alone without any setup.
4. As an Owner, I want to see my Family's Invite Code, so that I can share it with my family.
5. As an Owner, I want to regenerate the Invite Code, so that a leaked code stops working.
6. As a Member, I want to enter an Invite Code to join a Family, so that I share a Pantry and Shopping List with them.
7. As a Member joining a Family, I want a warning that my Household of One and its data will be deleted, so that I don't lose things by surprise.
8. As a Member, I want to see who else is in my Family, so that I know who shares the Pantry.
9. As an Owner, I want to remove a Member, so that someone who left the household no longer sees our data.
10. As a Member, I want to leave my Family and get a fresh Household of One, so that I can start over.
11. As an Owner, I want to transfer ownership to another Member, so that I can leave without stranding the Family.
12. As an Owner, I want to delete the Family and all its data, so that nothing lingers when the household dissolves.
13. As a removed Member, I want to land in a fresh empty Household of One, so that the app keeps working.
14. As a Member, I want to pick my locale (English or Romanian), so that the app speaks my language.

### Catalog

15. As a Member, I want every pantry and shopping entry to be tied to a canonical Ingredient, so that the same thing isn't counted under three names.
16. As a Member, I want Categories granular enough to tell Parmesan from Cheddar, so that matching isn't vague.
17. As a Member, I want to search the Catalog by name in my locale, so that I can add things manually.
18. As a Member, I want Catalog names shown in my locale, so that lists read naturally.
19. As an Admin, I want to create, edit, and delete Ingredients, Categories, Aisles, Synonyms, and translations, and to reorder Aisles, so that I can curate the Catalog and the shop order.
20. As an Admin, I want a list of Unmatched names from Scans and manual entries, so that I can grow the Catalog from real usage.
21. As an Admin, I want to resolve an Unmatched name to an existing or new Ingredient, so that future matches succeed and existing Batches get relinked.

### Pantry

22. As a Member, I want to see my Family's Pantry grouped by Location, so that I can find things where they're stored.
23. As a Member, I want each Ingredient's Batches rolled up with a total quantity and the soonest expiry, so that the list stays readable.
24. As a Member, I want to expand an Ingredient to see each Batch, so that I can act on one purchase.
25. As a Member, I want to search the Pantry by name, so that I can check if we have something.
26. As a Member, I want to filter the Pantry by Location, so that I see only the fridge.
27. As a Member, I want to add a Batch manually with Ingredient, quantity, unit, Location, expiry, and Product Description, so that unscannable things still get in.
28. As a Member, I want the expiry date pre-filled from Default Expiry when I add a Batch, so that I rarely type a date.
29. As a Member, I want the Location pre-filled from the Ingredient's Category when possible, so that I rarely pick it.
30. As a Member, I want to edit a Batch's quantity, expiry, Location, and description, so that I can correct mistakes.
31. As a Member, I want to delete a Batch, so that used-up or thrown-out food disappears.
32. As a Member, I want Batches with an expiry date sorted soonest first, so that I use things before they go off.
33. As a Member, I want an Expiring Soon marker on Batches inside the Stale Threshold, so that I notice them.
34. As a Member, I want quantity and expiry to be optional, so that I can add "some garlic" without lying about numbers.

### Scanning

35. As a Member, I want to open the camera in any of the four Scan Modes, so that I pick the right recognition for what's in front of me.
36. As a Member, I want to choose a photo from my gallery instead of the camera, so that I can scan a receipt I photographed earlier.
37. As a Member, I want a Product Scan to propose one Ingredient Match, Product Description, and best-before date, so that one item takes seconds.
38. As a Member, I want a Receipt Scan to propose one line per purchased item with quantity, unit, and Match, so that a whole shop goes in at once.
39. As a Member, I want non-food receipt lines excluded with a reason, so that I don't get a Batch of "carrier bag".
40. As a Member, I want a Receipt Scan to tick off Shopping Items that match what I bought, so that the list updates itself.
41. As a Member, I want an Ingredients Scan to propose a Match for each loose item it sees, so that produce without packaging gets in.
42. As a Member, I want a Plate Scan to guess the dish and list its Ingredients for one serving, so that I can add what I'm missing to the Shopping List.
43. As a Member, I want every Scan to land on a Review screen, so that nothing enters the Pantry or list without my say.
44. As a Member, I want to change a proposed Match on the Review screen by searching the Catalog, so that wrong guesses are cheap to fix.
45. As a Member, I want to edit quantities, units, expiry, and Location on the Review screen, so that the saved Batch is right.
46. As a Member, I want to drop any line from the Review screen, so that I only save what I want.
47. As a Member, I want a low-confidence or Unmatched line to be visibly flagged on the Review screen, so that I check it first.
48. As a Member, I want to save an Unmatched line anyway with the name the scan read, so that a thin Catalog doesn't block me.
49. As a Member, I want to be told when I've hit my daily Scan Cap, so that I know why the shutter stopped working.
50. As a Member, I want Scans to work on Romanian receipts and labels, so that my shop in Romania is recognised.

### Shopping List

51. As a Member, I want to see my Family's Shopping List grouped by Aisle in shop order, so that I walk the shop once.
52. As a Member, I want to add a Shopping Item by typing a name and picking the Catalog Match, so that the list stays canonical.
53. As a Member, I want to set a quantity and unit on a Shopping Item, so that whoever shops knows how much.
54. As a Member, I want to check and uncheck a Shopping Item, so that the family sees what's in the basket.
55. As a Member, I want to remove a Shopping Item, so that changed minds don't clutter the list.
56. As a Member, I want to see which Source Recipes added an item, so that I know why it's there.
57. As a Member, I want the list to refresh itself while open, so that I see what my partner just added.
58. As a Member, I want a summary of how many items remain and how many are checked, so that I know how far through the shop I am.
59. As a Member, I want to Finish Shopping and have checked items become Batches with Default Expiry, so that putting things away is one tap.
60. As a Member, I want to review the Batches Finish Shopping is about to create, so that I can set Locations and fix quantities before saving.
61. As a Member, I want a fresh empty list after Finish Shopping, so that the next shop starts clean.

### Dashboard

62. As a Member, I want a Dashboard of Widgets as my home screen, so that the most useful information is one glance away.
63. As a Member, I want a Use Soon Widget showing the three soonest-expiring Batches, so that I plan around them.
64. As a Member, I want a Shopping Widget showing how many items are left to buy, so that I know whether to go shopping.
65. As a Member, I want a Pantry Stock Widget showing total items by Location, so that I see what's where.
66. As a Member, I want a Quick Scan Widget with the four Scan Modes, so that scanning is one tap from home.
67. As a Member, I want to add, remove, reorder, and resize Widgets, so that the Dashboard fits me.
68. As a Member, I want my Dashboard layout saved to my account, so that it follows me between devices.
69. As a Member, I want placeholder Meal Plan, Budget, and Nutrition Widgets available, so that the Dashboard matches the design even before those features exist.

### Family Settings

70. As a Member, I want to see and change Default Expiry per Category for my Family, so that our fridge's reality overrides the defaults.
71. As a Member, I want to set the Stale Threshold, so that "expiring soon" means what we want it to mean.

### Internationalisation

72. As a Member, I want every screen, button, error, and empty state in my locale, so that nothing is half-translated.
73. As a Member, I want dates, numbers, and units formatted for my locale, so that they read correctly.
74. As a Member, I want Catalog names in my locale and the other locale's names still matched, so that scanning a Romanian receipt into an English-locale account works.

### Admin and operations

75. As an Admin, I want my role granted from configuration at signup, so that no manual database edit is needed.
76. As an operator, I want a per-Member daily Scan Cap set by configuration, so that a leaked session can't drain the AI budget.
77. As an operator, I want a one-command local setup with Postgres in Docker, so that any machine can run the stack.
78. As an operator, I want a seed command that loads the Catalog and sample data, so that a fresh database is usable.

## Implementation Decisions

### Repository and stack

- npm-workspaces monorepo with three packages: a web app, an API, and a shared UI package. A Flutter app will join later as a fourth package and consumes the same API.
- The API and the UI package start as copies of the equivalent retzetar packages, renamed, with git history not carried over. Specifically copied: the NestJS on Fastify server, the Drizzle schema and migration tooling, better-auth integration with email and password, the structured-output AI service and its OpenAI configuration, the four scan services and their schemas and specs, the catalog matching validator, the receipt quantity normaliser, client image resizing, the typed fetch wrapper, and the MUI theme wrapper.
- The web app is built fresh to the handoff: React, TypeScript, Vite, React Router, TanStack Query for server state, Zustand only for client-only state such as the in-progress Review.
- Node version matches retzetar. Package scope is `@pocket-pantry`.
- Postgres runs in Docker Compose locally. No deployment in wave 1. When there is one, the API must run as a single instance: the Plate token uses and the Invite Code rate limiter are in memory (see `apps/api/README.md`).
- All business logic lives in the API. The web client renders, validates input, and calls endpoints. This is what keeps the future Flutter client thin.

### Design and UI

- The handoff wins on layout, tokens, routes, component names, screen behaviour, responsive rules, and accessibility. `start.md` wins on stack and code structure.
- The UI package is a Material UI based component library themed with the handoff's tokens and fonts. Components are organised by atomic design (atoms, molecules, organisms). Storybook is configured but no stories are written in wave 1.
- Web pages live under a pages directory, one directory per page named without the Page suffix, containing a main component with the Page suffix plus `hooks` and `components` subdirectories.
- Routes: dashboard at root, customise, pantry, shopping, scan, plus settings, family, and admin routes not in the handoff. Recipes route exists as a placeholder screen in wave 1 so the Dock matches the design.
- The barcode mode is not built. Product Scan is image-based. The Scan screen's product hint still reads as in the design.

### Auth and Family

- better-auth with email and password only. Sessions as in retzetar. Bearer-token mode is a later addition for Flutter.
- Every Member belongs to exactly one Family, created at signup as a Household of One with the Member as Owner. There is no nullable family anywhere in the data model.
- Family has one Owner. All Members have equal read and write on Family data. Owner-only actions: regenerate Invite Code, remove Member, transfer ownership, delete Family.
- Invite Code: 8 characters from an unambiguous uppercase alphanumeric alphabet, reusable until it expires 7 days after generation. Regenerating revokes the previous code. Redeeming requires the code to be unexpired and the redeemer not to be in that Family already.
- Redeeming a code moves the Member to the target Family and deletes their previous Family, which must be a Household of One they own. The client shows a warning naming what will be deleted. Data is not merged.
- Leaving a Family or being removed creates a fresh Household of One for that Member. An Owner cannot leave until ownership is transferred. Deleting a Family cascades to its Pantry, Shopping Lists, Settings, and memberships; each former Member gets a fresh Household of One.
- Admin is a role on the Member. Signup never grants it, and no endpoint does: it is set directly in the database (see README). It is independent of Family ownership.

### Catalog

- Two-level Categories. Retzetar's 18 categories become Parent Categories. Each Parent Category has an Aisle with a sort order. Admins create, rename, translate, reorder (move up or down) and delete Aisles; an Aisle a Parent Category still uses cannot be deleted. Leaf Categories hang under Parents. Every Ingredient belongs to exactly one Leaf Category.
- Default Expiry in days lives on the Leaf Category, nullable, falling back to the Parent Category. A default Location is on the Leaf Category, nullable, falling back to the Parent, used to pre-fill new Batches.
- Ingredient and Category rows carry a canonical English name and a normalised key. A translations table keyed by entity, locale, and kind holds display names and Synonyms per locale. Uniqueness is enforced on the normalised canonical name and on normalised display names within a locale.
- Each Ingredient has a default unit from the unit enum.
- The seed is generated once with an LLM from the 18 parents, producing Leaf Categories and Ingredients with English and Romanian names and Synonyms, then reviewed by hand before being committed as seed data. Seed rows have fixed identifiers so re-seeding is idempotent and keeps Admin edits, Aisle names and shop order included; a seed Aisle an Admin deleted comes back, last in the shop order if its slot is taken.
- An "Other" Leaf Category exists under every Parent Category, plus a top-level "Other" Parent, so Unmatched Batches always have a home.
- Unmatched names are recorded in a review queue with the raw text, locale, source (which Scan Mode or manual), and the Batch or Shopping Item they were saved on. Admin resolution either links to an existing Ingredient or creates a new one, then relinks the referencing rows and adds the raw text as a Synonym. A relinked Shopping Item on the active list merges with an existing line for the same Ingredient and unit; on archived lists it only relinks. Unmatched rows saved before the queue existed (migration 0009) are not queued; that is dev data only and no backfill is provided.

### Matching

- Matching has two stages. Stage one is deterministic: normalise the input (case, diacritics, punctuation, whitespace; the Danish letters æ, ø, å fold to the receipt spellings ae, oe, aa) and look up against canonical names, display names, and Synonyms across all locales. An exact hit is a confident Match. Stage two, used for images and for stage-one misses, is the retzetar approach: the vision model receives the Catalog in the Member's locale and returns a matched Ingredient identifier, a Leaf Category guess, a confidence, and a fallback name. The validator rejects identifiers not in the Catalog.
- Confidence below a configured threshold, or no identifier, marks the line as Unmatched on the Review screen. The Member can still save it.
- Manual entry in Pantry and Shopping uses stage one only, with a Catalog search box as the primary interaction.

### Units and quantities

- Unit enum: g, kg, ml, l, pcs. Packs, bunches, and similar are pcs with the pack size in Product Description.
- Quantity is a decimal number, nullable. Unit is nullable only when quantity is null.

### Pantry

- A Batch belongs to a Family and an Ingredient and has quantity, unit, Location, expiry date (date only, nullable), Product Description, an Unmatched flag with the raw name, and a created-at timestamp. One row per purchase; nothing is merged.
- Pantry read endpoints return Batches grouped by Ingredient with totals and soonest expiry, and support filtering by Location and searching by localised name.
  - Wave 1 deviation: the roll-up and search run client-side in `apps/web/src/lib/pantry.ts` and the API returns Batches. See [ADR 0002](adr/0002-pantry-rollup-and-search-client-side.md).
- Expiring Soon is computed from the Family's Stale Threshold at read time, not stored.

### Scanning

- Images are resized client-side as in retzetar and sent as data URLs. The API forwards them to the AI provider and never stores them.
- The AI provider stays OpenAI via the existing provider abstraction and environment variables.
- Each Scan Mode has its own endpoint, returning the same shape of proposed lines so one Review screen serves all four modes. Receipt and Ingredients return many lines, Product returns one, Plate returns a dish guess plus lines for one serving.
- The Review screen is client state until the Member confirms. Confirming calls a bulk-create endpoint for Batches (Product, Receipt, Ingredients) or a bulk-add endpoint for Shopping Items (Plate). Each line carries its Match or its Unmatched raw name.
- Receipt confirmation also returns which Shopping Items on the active list matched the saved Batches, and the client ticks them.
  - Known limit: a Shopping Item ticked by a receipt is still checked on the list, so Finish Shopping proposes it again as a Batch. A Member who confirmed the receipt Batches should drop that proposed Batch at Finish Shopping. Not prevented in wave 1.
  - A failed tick does not undo the save; Review tells the Member how many Shopping Items were not ticked (removed from the list, or the list changed).
- The Scan screen is a full-screen, non-scrolling, always-dark camera view (it stays dark in the light theme), using the `cam-*` camera palette. The camera feed is aspect-filled behind everything, under a radial vignette; the top bar, hints, mode dial and the gallery and manual buttons are overlaid and stay inside the viewport. The top bar holds Close, a torch button next to it (hidden when the camera has no torch), the Scan Language chip and Info. The chip is a compact EN/RO/DA picker, the UI language first; its choice is sent with each following Scan, and it is locked while a Scan is being read or Receipt Sections are in progress. It is hidden in Plate mode (ADR 0003).
- Scan Modes are picked on an icon dial at the bottom, in the order Receipt, Product, Ingredients, Plate: the selected icon sits in a ring with its name above. Dragging the dial sideways moves the strip with the finger (after 10 pt of mostly horizontal travel; past either end it follows at 35 %) and settles on the nearest mode on release, or one step for a quick short flick; the ring shrinks slightly while dragging and the settle animation is off under reduced motion. Tapping an icon or pressing the left and right arrow keys also changes mode (stopping at the ends; the keys do nothing while the cropper or Info sheet is open, a gallery photo is being read, or focus is in a field), with a light haptic where the browser supports it and a screen-reader announcement. The dial is a radio group. The last-used mode is remembered on the device; with none, or an unknown one, Receipt opens. A `?mode=` link wins and becomes the last-used mode. The Info sheet lists the four modes with a one-line description each.
- Every Scan Mode has a guide of four L-shaped corner brackets, centred at 46% of the screen height and sized as a fraction of the screen (width x height): Receipt 0.52 x 0.64, Product 0.60 x 0.48, Ingredients 0.88 x 0.42, Plate 0.80 x 0.50. It morphs to the new size over 400 ms when the mode changes (no animation under reduced motion). Pressing the guide turns the brackets accent-coloured for 320 ms. There is no shutter button: double-tapping the guide (two taps within 320 ms and 60 pt) takes the Scan, and so do Enter and Space on the guide, which is a focusable button. A tap soon after a dial drag, a single tap, and taps outside the guide do nothing; the guide is inert while a photo is being prepared, a gallery photo is being read, or the camera is not ready; a camera Scan never waits for an earlier one to be read. A Scan flashes the screen white (55 % fading out over 280 ms, gone by 420 ms), flashes the guide's inside (85 % over 420 ms), thickens the brackets from 3.5 to 6 pt for the flash and pulses the guide to 0.965 scale for 360 ms, with a 12 ms haptic where supported; under reduced motion the flash, fill and pulse animations are dropped, while the bracket change to 6 pt (white) and the haptic remain. Choosing a photo from the gallery stays available. A hint pill under the guide gives a one-line instruction per mode; it disappears after the first Scan of the visit (even a failed one). A receipt camera frame is cropped to the guide by mapping it through the feed's cover scaling and is sent at the crop's aspect, at most 512 px wide.
- Info opens a bottom sheet explaining scanning. Tab stays inside the sheet; Escape, a scrim tap or the sheet's button closes it and returns focus to Info. The camera keeps running while it is open.
- Scan Session (ADR 0004). A camera Scan in Receipt (one photo), Product or Ingredients mode joins an in-memory Scan Session at once and the camera stays ready for the next; its photo is read in the background over the Scan Mode's endpoint, in the Scan Mode and Scan Language it was taken in, and reads run 2 at a time in the order the Scans were taken. A Plate Scan joins the Scan Session the same way (gallery Plate photos too): its photo is read for dish guesses, with no Scan Language, and the Review overview card shows them under "Pick the dish" with each guess's confidence. Picking one loads its Ingredients for one serving into the card (the count and chips like any other card), and the card opens the line editor, which adds the lines to the Shopping List. The Plate token behind the guesses lasts an hour; when it has expired the pick fails and the card offers "Read again", which queues the same photo for a new read (a new Plate request). Any other pick error is shown on the card and the guesses stay. Receipt Sections for gallery receipts keep their earlier flow until their own slice. The Scan Session lives in client state only: a reload loses it, and it survives leaving the Scan screen for Review and coming back with the Camera link. The Scan column down the left edge shows one 46 x 60 thumbnail per Scan with its Scan Mode icon, newest at the bottom and the oldest fading under the top bar, with a spinner while it waits or is read and a check once read. A Scan whose read fails is dropped and the reason is shown on the Scan screen (retry and the Scan Cap state are #115).
- Done sits at the right of the top bar with the number of Scans as a badge, amber while any is still waiting or being read; it is disabled with an empty Scan Session and opens `/scan/review` even while reads are running.
- `/scan/review` is the overview: the subtitle reads "N photos · M still reading" or "N photos · all read", the Camera link returns to the camera with the Scan Session intact, and each Scan, in the order the Scans were taken, is a card with its Scan Mode as the eyebrow, a result line (the product name for Product, "N items" otherwise), the items read as chips, and "Check N items" when N lines are low-confidence or Unmatched. A Scan still being read shows "Reading photo…" and cannot be removed; a read card has a remove button. Tapping a read card opens `/scan/review/:scanId`, the existing Review for that Scan. Saving there commits only that card, through the bulk Batch endpoint (Product, Ingredients) or Receipt confirm (Receipt), in the Scan's Scan Language, and removes the card; the Member returns to the overview, or lands on the Pantry when it was the last card. Discarding there removes the card the same way. A card that is gone or still being read sends `/scan/review/:scanId` back to the overview.
- A per-Member daily Scan Cap, from configuration, is enforced in the API before calling the provider. Exceeding it returns a specific error code.

### Shopping

- A Family has one active Shopping List at a time, plus archived ones. A Shopping Item references an Ingredient (or an Unmatched raw name), quantity, unit, checked flag, and zero or more Source Recipe references. The recipe reference is nullable-free in wave 1 because no recipes exist, but the join table is created now.
- Adding an item for an Ingredient already on the list merges into the existing item, summing quantities when units agree and keeping both lines when they don't.
- Reads return items grouped by Aisle in Aisle sort order. The client polls on an interval and refetches on window focus.
- Finish Shopping takes the checked items, returns a proposed list of Batches with Default Expiry and default Location, lets the Member adjust on a Review screen, then creates the Batches, archives the list, and creates a new empty one in a single transaction.

### Dashboard

- Widget layout is per Member, stored as an ordered list of widget instances with type and size, persisted via the API as in retzetar's dashboard table.
- Wave 1 widget types: Use Soon, Shopping, Pantry Stock, Quick Scan, and the placeholder Meal Plan, Budget, and Nutrition widgets with static content. Cook Tonight and Recipe of the Day are wave 2.
- Customise screen uses dnd-kit for reorder, with size toggle, remove, and an add gallery, as in the handoff.

### Settings

- Family Settings hold per-Category Default Expiry overrides and the Stale Threshold, default 3 days. Any Member may edit.
- Member Preferences hold locale and are per Member.

### Internationalisation

- Launch locales are English and Romanian with English as fallback. i18next with react-i18next, JSON resource files per locale, namespaced per page and per shared component. Dates, numbers, and units formatted with the Intl API.
- The API never returns user-facing strings. Errors carry a stable code and structured parameters; the client translates. Validation errors follow the same rule.
- Catalog display names come from the translations table in the requested locale, falling back to English.

### Tooling and process

- GitHub Actions on every pull request: lint, typecheck, test, build. Husky pre-commit with lint-staged formatting and typecheck.
- Work is broken into tracer-bullet tickets on GitHub Issues. Implementation agents use cheaper models, work on branches, and open pull requests. Fable reviews every pull request. Fable merges routine tickets. The user merges the foundation ticket and any pull request touching the database schema or auth.

## Testing Decisions

A good test exercises external behaviour through a stable seam and would survive a rewrite of the internals. Tests do not reach into private state or assert on implementation structure.

Seams, highest first:

- **API HTTP seam.** Integration tests boot the NestJS app against a test Postgres, sign in as a seeded Member, and call endpoints. This is the primary seam for Family rules, Pantry grouping, Shopping merging and Finish Shopping, Scan confirmation, Scan Cap, and admin resolution of Unmatched names. In wave 1 Pantry grouping is the exception: it is client-side and covered by unit and component tests (see [ADR 0002](adr/0002-pantry-rollup-and-search-client-side.md)). The AI provider is replaced at the structured-output service boundary with a fake returning canned structured results.
- **Scan service seam.** The ported scan services keep their retzetar specs, which exercise schema parsing and catalog validation with a fake provider. New tests are added for the matching stage one and for Ingredients and Plate, which retzetar left untested.
- **Web page seam.** Component tests render a page with the API client mocked at the network boundary and assert on what the Member sees and can do: Review screen editing, Finish Shopping review, Customise reorder, locale switching. No tests for the UI package atoms beyond what Storybook will later cover.

Prior art: retzetar's receipt scan service spec and missing-ingredients spec on the API, and its add-pantry page test and photo picker test on the web.

No end-to-end browser tests in wave 1.

## Out of Scope

- Recipes, favourites, Want to Cook, cook confirmation with Pantry deduction, recipe suggestions from Ingredients Scan, user recipes from Plate Scan.
- Alerts and notifications of any kind, in-app or push. The notifications table is not created in wave 1.
- Progressive web app installability, service worker, offline.
- Barcode scanning and external product databases.
- Multiple Families per Member, merging Pantries on join.
- Multiple named Shopping Lists.
- Unit conversions between mass, volume, and count.
- Meal planning, budget tracking, and nutrition as real features. Their Widgets are static placeholders.
- Image storage.
- Deployment and hosting.
- Flutter mobile app.

## Further Notes

- The handoff describes Plate Scan as "logs the meal and takes what you used out of the pantry." That is the wave 2 cook-confirmation flow. In wave 1, Plate Scan follows retzetar and adds the dish's Ingredients to the Shopping List. The Scan screen copy for Plate should describe the wave 1 behaviour.
- The handoff's localStorage data model is a prototype shape, replaced by the API model above.
- Pantry Location was not in `start.md` and comes from the design. It is a Batch field with Category-driven defaults.
- The Catalog seed generation is a one-off task with human review, not application code. It should be its own ticket early, since Pantry, Shopping, and Scan all depend on it.
- The to-tickets step needs the issue tracker configured for this repo via the setup skill before tickets can be published.
