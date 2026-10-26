---
name: seed-recipes
description: "Generate one batch of Catalog Base Recipes with Variants as seed data: plan, fill catalog gaps, write, validate, review, open a PR."
disable-model-invocation: true
---

Run one **batch** (about 5 Base Recipes) of the recipe seed. This session is the orchestrator: it spawns agents, relays between them and the user, and does git bookkeeping. Agents write all seed data; the orchestrator's own edits are the imports in `recipe-seed-data.ts` (step 6).

## Why the bar is high

The recipe seed only inserts (`onConflictDoNothing`) and slugs are permanent. A wrong timer, Allergen or Romanian line that reaches a seeded database stays there; fixing the data file does not fix it. Every stage exists to stop errors before the PR.

## Roles

Spawn each with the Agent tool, `general-purpose`, `model` set explicitly. Each brief is one line pointing at its file plus the batch values; the agent reads the file itself.

| Role | Model | Brief | Count |
| --- | --- | --- | --- |
| Planner | `opus` | [PLANNER.md](PLANNER.md) | one per batch (and once for the backlog) |
| Catalog agent | `sonnet` | [CATALOG.md](CATALOG.md) | one at a time, never alongside another catalog agent |
| Writer | `sonnet` | [WRITER.md](WRITER.md) | one per Base Recipe, in parallel |
| Reviewer | `opus` | [REVIEWER.md](REVIEWER.md) | a fresh one per review round |

The skill's files live in the main checkout: `/home/giu/projects/pocketPantry/.claude/skills/seed-recipes/`. Give agents that absolute path, since the batch worktree may predate the skill. Every brief also carries the batch values: worktree path, notes directory, plan path, and the agent's own scope (which base, which review).

[RULES.md](RULES.md) holds rules every agent follows. Each brief file points at it.

## Batch values

- Batch number `<n>`: one more than the last merged batch on the backlog issue.
- Worktree: `scripts/worktree.sh seed-recipes-<n>` → `.claude/worktrees/seed-recipes-<n>`.
- Notes directory: `/tmp/pp-seed-recipes-<n>/`, holding `plan.md`, `catalog-report.md`, `review-<scope>-<round>.md` and the writers' hand-backs.

## Steps

1. **Backlog.** Find the open issue titled `Recipe seed backlog`: `gh issue list --state open --search '"Recipe seed backlog" in:title' --json number,title`. If there is none, spawn the planner in backlog mode, show the user its list, revise until they approve it, then ask before creating the issue (commands in `docs/agents/issue-tracker.md`). Done when you hold the backlog issue number and its body.
2. **Worktree.** Create the worktree and notes directory. Done when `npm ci` has finished in the worktree.
3. **Plan.** Spawn the planner in batch mode. It writes `plan.md`. Present the plan to the user in full and relay revisions until the user explicitly approves. New Eating Moments need the user's explicit yes, since that list is curated. Done on the user's approval.
4. **Validator default** (only while it is missing). If `findAcceptanceGaps` in `apps/api/src/catalog/seed/recipes/validate-recipe-seed.ts` still skips bases that are not in `BASE_MINIMUMS`, spawn a `sonnet` agent with the `tdd` skill. The rule: every base not in `BASE_MINIMUMS` needs at least 1 Recipe-level Tip, at least 1 step Tip and at least 2 Variants of any kind. Bases listed in `BASE_MINIMUMS` keep their counts. Update the spec case that expects a non-listed base with no Variants to pass. `seed-recipes.ts` calls `assertAcceptance` at seed time, so the rule applies there too. Done when `npm run test:unit -w apps/api` is green and the change is committed as its own commit.
5. **Catalog.** Skip if the plan lists no missing Ingredients and no new registry entries. Otherwise spawn the catalog agent. If it stops on a Synonym promotion, relay the question to the user and resume the agent with the answer (SendMessage). Then run the review loop below with scope `catalog`. Done when the catalog commit exists and its review is clean or escalated.
6. **Write.** Spawn one writer per base, all in parallel. A writer that finds a missing Ingredient reports it and stops. Collect these, run step 5 for just those Ingredients, then resume each blocked writer via SendMessage. When every writer has handed back, add each base's import and entry to `SEED_BASE_RECIPES` in `apps/api/src/catalog/seed/recipes/recipe-seed-data.ts`, in plan order. Done when `npm run typecheck -w apps/api`, `npm run lint -w apps/api` and `npm run test:unit -w apps/api` are all green in the worktree.
7. **Review.** Run the review loop for each base, in parallel, scope `<base-slug>`. Done when every base is clean or escalated.
8. **Cross-links.** Check the batch meets the plan's cross-family Pairings. `findAcceptanceGaps(..., { requireCrossLinks: true })` counts them across the whole seed. Done when every planned cross-link exists or is listed as dropped with a reason.
9. **PR.** Commit order: validator change (if any), catalog, then one commit per base (`feat(catalog): <Base title> recipe with <n> Variants`). Push and open the PR with the `pr` skill. The body has:
   - the bases and Variants
   - every new Ingredient with its Allergen list, one line each, for the user to read in full
   - the reviewers' escalated findings
   - which recipes the user should read in full: every base, every Romanian and Danish recipe, and a suggested sample of Variants

   Tick the batch's bases on the backlog issue only after the user merges. Done when the PR URL is presented with that reading list.

## Review loop

Spawn a fresh reviewer with the scope. It writes `review-<scope>-<round>.md` and only reports.

- **Clean** (no `must-fix` findings): done.
- **Otherwise**: send the `must-fix` findings to the agent that wrote the scope (the catalog agent or that base's writer), resumed via SendMessage. Once it hands back green, spawn a new reviewer for the next round.
- **After round 2**, whatever `must-fix` remains is escalated: listed in the PR body under "Needs your call", not fixed further.

`consider` findings go to the writer once, in round 1, and are never escalated.

## Context hygiene

Keep the agents' hand-backs short (they are told to). Read the plan and review files from the notes directory instead of having agents paste them. The data files are 1,000+ lines each; read them only by line range when relaying a specific finding.
