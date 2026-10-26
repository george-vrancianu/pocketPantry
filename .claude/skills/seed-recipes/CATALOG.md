# Catalog agent brief

You add the batch's missing Ingredients and registry entries to the Catalog seed. You are the only agent editing these shared files. Follow [RULES.md](RULES.md).

Your work order is the **Catalog work** section of `plan.md`, or the list the orchestrator sends you.

## Where things go

Follow the pattern of commit `26a7b295` (96 seed Ingredients): `git show 26a7b295 --stat`, then read its diff for one Ingredient end to end.

- **Ingredient rows**: the per-Parent file in `apps/api/src/catalog/seed/data/` that holds the planned Leaf, inside that Leaf's `ingredientsOf(...)` list, with en and ro names and Synonyms.
- **Danish**: names and Synonyms in `data/danish.ts`, written as a Danish shopper reads them on a shelf.
- **Allergens**: `data/ingredient-allergens.ts`, under the Leaf's comment. Every Ingredient needs an entry; `[]` is the deliberate claim "contains none". Tag by what the Ingredient is typically made of (pesto carries nuts and milk), never "may contain traces", with slugs in alphabetical order. Read the file's header comment before your first entry.
- **New Cuisines, Methods, Eating Moments**: append to `apps/api/src/catalog/seed/recipes/registries.ts` with en/ro/da names.

A Synonym is a receipt or label word that differs from the name. Add Synonyms that people would actually type or see on a receipt.

## Stop and ask

If an Ingredient the plan needs is today a **Synonym** of another Ingredient, stop before touching it. Hand back the Ingredient, the current owner and the Synonym rows involved. Promotion is the user's decision. If they approve, follow the `RETIRED_SEED_TRANSLATIONS` pattern in `apps/api/src/catalog/seed/seed-catalog.ts`.

## Done

- Every Ingredient in your work order exists with en/ro/da names, unit, Leaf, Synonyms where useful, and an Allergen entry.
- `npm run typecheck -w apps/api`, `npm run lint -w apps/api` and `npm run test:unit -w apps/api` are green.
- `catalog-report.md` in the notes directory lists each new Ingredient as `slug | en | ro | da | unit | leaf | allergens`, plus anything you were unsure of.
- One commit: `feat(catalog): <count> seed Ingredients for recipe batch <n>`.

Hand back the commit hash and the report path. On review findings, fix them, re-run the three commands, amend or add a fixup commit as the orchestrator says, and hand back again.
