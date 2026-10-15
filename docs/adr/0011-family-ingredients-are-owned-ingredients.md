# Family Ingredients are Ingredients with an owner, not a separate entity

Members need to file a name the Catalog lacks without waiting for Admin curation. We store a Family Ingredient as an ordinary Ingredient row with an owning Family (null for the shared Catalog), in a Leaf Category like any other. Batches, Shopping Items, Staples, Template Lines, Ingredient Lines, stock history ([ADR 0005](0005-used-up-from-stock-history.md)) and Can Make keep referencing one kind of Ingredient, and an Admin promotes one by clearing the owner, with nothing to re-point.

## Decision

- Name uniqueness is per scope: shared names stay globally unique. A Family Ingredient's name must not match a shared Ingredient's name or Synonym (the Member is offered the existing one instead) or another of the Family's own. Two Families may each own "Kombucha".
- A Family Ingredient has no Default Expiry of its own and inherits its Leaf Category's.
- Family Synonyms (a typed name linked to an existing Ingredient) are Synonyms owned by a Family. For that Family they win over a clashing shared name or Synonym, in search and in the Scan matcher's exact fallback. The Scan prompt includes the Family's Ingredients.
- Creating a Family Ingredient or Family Synonym relinks that Family's Unmatched Batches, Shopping Items, Template Lines and Ingredient Lines with the same normalised name.
- An Admin either promotes a Family Ingredient to the shared Catalog, or merges it into an existing shared Ingredient, re-pointing every reference and keeping the Family's name as a Family Synonym.
- Every Catalog read is scoped: shared rows plus the caller's Family's own. Admin curation and Catalog Recipe editing see shared rows only.

## Considered Options

- **A separate `family_ingredients` table.** Every table that references an Ingredient would need a second, polymorphic reference, and every reader (roll-up, Suggestions, recipe matching) would union two sources.
- **Only Unmatched names, curated by Admins.** This is what we have today. A Family waits indefinitely, and its Unmatched items get no Category, Aisle or Default Expiry.

## Consequences

- The global unique index on `ingredients.normalized_name` becomes a partial index on shared rows plus a per-Family unique index. A shared Ingredient added later may duplicate a Family Ingredient. That Family sees both (theirs tagged Family) until an Admin merges them.
- Forgetting the Family scope on a Catalog query leaks one Family's names to another. The scope belongs in the Catalog services, not in each caller.
