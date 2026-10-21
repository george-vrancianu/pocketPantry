# Codebase map

npm workspaces monorepo (Node >= 24, see `.nvmrc`). Run `npm ci` once per worktree. Read `GLOSSARY.md` for domain terms and `CODING_STANDARDS.md` for review rules.

## Workspaces

| Path | What |
| --- | --- |
| `apps/api` | NestJS on Fastify, Drizzle ORM, Postgres |
| `apps/web` | React + Vite + react-i18next, TanStack Query |
| `packages/ui` | Design system on MUI, Storybook, imported as `@pocket-pantry/ui` |

Which linter each workspace uses: `CODING_STANDARDS.md`.

Root `package.json` fans out `lint`, `typecheck`, `test`, `build` to every workspace. CI (`.github/workflows/ci.yml`) runs lint, typecheck, test, build against a Postgres service. Pre-commit hooks: `.husky/pre-commit`.

## API (`apps/api`)

- One folder per module in `apps/api/src/` (`pantry`, `shopping`, `recipes`, `voice`, ...), each with `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.schemas.ts`. Register new modules in `apps/api/src/app.module.ts`.
- Unit specs sit beside the code as `*.spec.ts`.
- Integration tests live in `apps/api/test/*.int-spec.ts` (real Postgres via `TEST_DATABASE_URL`; config `apps/api/test/jest-integration.json`). Helpers: `apps/api/test/support/`.
- Schema: `apps/api/src/database/schema.ts`. Migrations: `apps/api/drizzle/NNNN_name.sql` plus `apps/api/drizzle/meta/_journal.json` and a snapshot. Generate with `npm run db:generate -w apps/api`; never hand-number a file, because parallel branches collide on the next number.
- Voice: handlers in `apps/api/src/voice/handlers/`, registry in `voice-handlers.registry.ts`.

## Web (`apps/web/src`)

- `pages/<Area>/` holds one feature area each (some areas have several pages), with its own `components/` and `hooks/` for code only that page uses. Page tests sit beside the page.
- `components/` holds anything used by more than one page.
- `lib/` holds non-visual logic: API client (`api.ts`), data hooks, the Voice Note module (`voiceNote.ts`), dates, amounts.
- `test/` holds shared test helpers: `render.tsx` (render with providers), `voice.ts` (fake voice environment), `setup.ts` (vitest setup), plus per-feature helpers (`scan.ts`, `review.ts`, `mealPlans.ts`, `viewport.ts`, `scroll.ts`).
- i18n: `i18n/locales/{en,ro,da}/<namespace>.json`, one file per namespace, same names in all three. Wiring in `i18n/resources.ts`; API error codes map to copy in `i18n/translateApiError.ts`.

## UI package (`packages/ui/src`)

Atomic layout: `atoms/`, `molecules/` (includes `ToastProvider.tsx`), `organisms/`, `templates/`, `theme/`. Public exports go through `src/index.ts`. Stories sit beside components as `*.stories.tsx`; config in `packages/ui/.storybook/`. Test helpers: `packages/ui/src/test/`.

## Commands

Run from the repo root unless noted.

- Typecheck all: `npm run typecheck`; one workspace: `npm run typecheck -w apps/web`.
- Lint all: `npm run lint`; one workspace: `npm run lint -w apps/api`.
- Targeted web or ui test (`cd apps/web` or `cd packages/ui`): `npx vitest run --pool=forks --maxWorkers=2 <path-or-pattern>`. Vitest rejects `--poolOptions.forks.maxForks`. Run the full suite only when a ticket needs it.
- API unit: `npm run test:unit -w apps/api`.
- API integration (needs Postgres, `npm run db:up`): `cd apps/api && npm run test:integration -- --runInBand <pattern>`.
- Storybook: `npm run storybook -w packages/ui`.
- `npm run dev` starts Postgres, migrates, and runs both apps; agents leave it to the human.

## Gotchas

- `SettingsAppearance` and `HealthWidget` tests flake under load; rerun alone before calling a regression.
- Gh quirks are in `docs/agents/issue-tracker.md`.
