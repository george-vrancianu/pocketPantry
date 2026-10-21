# Worktrees and migration check

## Agent worktrees: `scripts/worktree.sh`

```
scripts/worktree.sh <name> [base]     # create
scripts/worktree.sh --remove <name>   # remove
```

- Creates `.claude/worktrees/<name>` on a new branch `<name>` from `base` (default `origin/main`, after `git fetch origin`).
- Works from the main checkout or from any worktree. It resolves the main checkout from the shared git dir and only runs `git fetch`, `git worktree add/remove` and `git branch` against it. It never runs checkout, stash, reset, pull, commit or `npm ci` there.
- Refuses if the target directory or the branch already exists. `<name>` may not be empty or contain `/` or `..`.
- Copies (never links) `.env`, `.env.local`, `apps/api/.env`, `apps/api/.env.local`, `apps/web/.env` and `apps/web/.env.local` from the main checkout where they exist, then runs `npm ci` in the new worktree.
- `--remove` runs `git worktree remove` (fails if the worktree has uncommitted changes) and then `git branch -d`. An unmerged branch is kept and reported; the script never force-deletes.

## Migration check: `scripts/check-migrations.mjs`

```
npm run check:migrations                      # unit tests, then the real check
node scripts/check-migrations.mjs [dir]       # dir defaults to apps/api/drizzle
```

Exits 1 with a list of problems when:

- two `.sql` files share a numeric prefix (two branches both added `0032_...`);
- a `.sql` file is missing from `meta/_journal.json`, or a journal entry has no `.sql` file;
- a journal entry's `idx` does not match the numeric prefix of its tag.

`scripts/check-migrations.test.mjs` (`node --test`) covers pass, duplicate prefix, both missing directions and idx mismatch, using temp directories. CI runs `npm run check:migrations` before the tests. After merging a branch that adds a migration, run it and renumber the newer migration (with its journal entry and snapshot) if it fails.
