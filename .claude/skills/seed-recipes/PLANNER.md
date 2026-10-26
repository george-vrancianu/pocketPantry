# Planner brief

You plan Catalog Base Recipes for the seed. You write no seed data. Follow [RULES.md](RULES.md).

Your brief says which mode: **backlog** or **batch**.

## What makes a good base

- **Everyday staples first**: dishes a normal home pantry can cook on a weeknight (pasta with tomato sauce, rice pilaf, lentil soup, pancakes, roast chicken, stir-fry). This is what makes Explore and Cook Tonight useful.
- **A deliberate slice of Romanian and Danish home cooking** (ciorbă, sarmale, mămăligă, frikadeller, smørrebrød), because those are the app's users.
- **A light preference for Ingredients already in the catalog**, including the seafood.
- Different from every seeded base: a new base is a dish of its own, not a Variant of an existing one. Check with `dump-catalog.ts <api> recipes`.

## Backlog mode

Propose about 40 bases in priority order. For each: slug, English title, and one line on why it earns a place. Mark the Romanian and Danish ones. Group them into batches of about 5, each batch mixing staples with at least one Romanian or Danish dish. Write the list to the path in your brief. Done when every base is distinct from the seeded ones and from each other.

## Batch mode

Take the next ~5 unticked bases from the backlog issue (the orchestrator passes its body). For each base, write into `plan.md`:

- **Base**: slug, export name (camelCase of the slug), title en/ro, servings, difficulty.
- **Variants**: 2 or 3, each with slug (`<base>-<cuisine-or-method>`), title en/ro, and exactly one Cuisine or Method. A Variant has to really be that Cuisine or Method, recognisably different in ingredients or technique, not the base with a garnish. Prefer existing Cuisines and Methods in `apps/api/src/catalog/seed/recipes/registries.ts`; list each new one with slug and en/ro/da names.
- **Key Ingredients** per recipe, each resolved against `dump-catalog.ts <api>` (search the names and Synonyms, not just slugs): the slug if present, `MISSING` if not.
- **Cross-links**: at least 3 Pairings in the batch that link a Recipe of another base (seeded or in this batch), as `from-slug → to-slug: reason`.

Then a **Catalog work** section:

- Every `MISSING` Ingredient with proposed slug, en/ro/da names, unit and Leaf (from `dump-catalog.ts <api> leaves`).
- Any needed Ingredient that today exists only as a **Synonym** of another Ingredient, listed separately as a question for the user. Promoting a Synonym changes how existing Batches match, so it is the user's call.
- Any new Cuisine, Method or Eating Moment. Eating Moments are a curated list, so propose one only when no existing moment fits, and flag it.

Done when every key Ingredient is resolved to a slug or listed under Catalog work, every slug in the plan is unique across the seed, and every base has 2–3 Variants.

Hand back the plan path and a three-line summary.
