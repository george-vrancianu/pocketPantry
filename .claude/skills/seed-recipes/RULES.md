# Rules for every seed-recipes agent

- Work only in the batch worktree you were given. The main checkout is read-only to you (you may read the skill files there).
- Report only through your hand-back to the orchestrator: a few lines, with details in the notes file your brief names.
- No `db:*` commands, no dev servers, no GitHub writes, no commits unless your brief says to commit.
- Slugs are permanent once shipped. Never rename or remove an existing slug, Ingredient, Recipe or registry entry.
- Seed data stays within the facts a careful home cook would stand behind. When you are unsure of something (a temperature, an origin, a Romanian or Danish word), say so in your hand-back rather than guessing in the data.
- Romanian uses comma-below ș and ț (U+0219, U+021B), never cedilla ş and ţ.
- Helper scripts, run from anywhere (`<api>` is the worktree's `apps/api`, `<skill>` the skill directory):
  - `npx tsx <skill>/scripts/dump-catalog.ts <api> [ingredients|leaves|recipes]`: the catalog as TSV, for grep.
  - `npx tsx <skill>/scripts/check-recipe.ts <api> <data file>`: one base file against the seed validator.
- Repo facts: `docs/agents/codebase-map.md`. Domain terms: `GLOSSARY.md` (Recipe section). Guidance rules: `docs/adr/0008-recipe-guidance.md`. Allergen tagging: the header comment of `apps/api/src/catalog/seed/data/ingredient-allergens.ts`.
