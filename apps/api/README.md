# @pocket-pantry/api

NestJS on Fastify, Drizzle ORM on Postgres, better-auth (email and password).
All business logic lives here; clients only render and call endpoints.

## Run it

From the repository root:

```bash
npm install
npm run dev          # copies .env.example to .env if missing, starts Postgres in
                     # Docker, applies migrations, starts the API on :3000
```

Other root scripts: `npm run db:migrate`, `npm run lint`, `npm run typecheck`,
`npm run test`, `npm run build`. `npm run db:up` starts both Postgres services
(dev on `:5432`, tests on `:5433`).

Tests have two layers. `test:unit` runs `src/**/*.spec.ts` with no database.
`test:integration` runs `test/*.int-spec.ts`, which boot the real app against
`TEST_DATABASE_URL` (default `postgresql://postgres:postgres@localhost:5433/pocket_pantry_test`),
apply the migrations, and exercise HTTP endpoints.

Swagger lives at `/api/docs`. better-auth is mounted at `/api/auth/*`
(`sign-up/email`, `sign-in/email`, `get-session`, ...).

## Error convention

The API never returns user-facing strings. Every error response is:

```json
{ "code": "validation_failed", "params": { "issues": [] } }
```

- `code` is a stable machine-readable identifier. Clients map it to their own
  localized copy.
- `params` holds the values that copy may interpolate. It is always an object
  and may be empty.
- There is no `message` field. Exception messages stay in server logs.

Where each shape comes from:

| Source                               | Code                                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ApiException(status, code, params)` | the code you give it, for example `auth.unauthenticated`, `auth.admin_required`                                                                              |
| `ZodValidationPipe`                  | `validation_failed`, with `params.issues: [{ path, code, params }]` (zod issue code plus numeric or enum constraints such as `minimum`, `maximum`, `origin`) |
| Any other Nest `HttpException`       | the lower-cased HTTP status name, for example `not_found`, `bad_gateway`                                                                                     |
| Unhandled error                      | `internal_server_error`                                                                                                                                      |
| better-auth endpoints                | `auth.<better_auth_code>`, for example `auth.invalid_email_or_password`; its English message is dropped                                                      |

`ApiExceptionFilter` (`src/common/api-exception.filter.ts`) is registered
globally from `AppModule`. When adding an error, throw `ApiException` with a
namespaced code (`domain.reason`) rather than a bare `HttpException` with text.

Some copied services (AI and scan) still construct exceptions with English
messages, because their specs assert on them. The filter strips those, so they
never reach a client.

## Layout

- `src/auth`: better-auth wiring, `AuthGuard`, `AdminRoleGuard`.
- `src/database`: Drizzle schema, module, pool. Migrations are in `drizzle/`.
  Change the schema, then `npm run db:generate -w @pocket-pantry/api`.
- `src/ai`: structured-output AI service (`AI_PROVIDER`, `AI_API_KEY`,
  `AI_VISION_MODEL`, `AI_BASE_URL`).
- `src/scan`: Product, Receipt, Ingredients, and Plate scan services and
  schemas. Only `POST /api/scan/product` is exposed so far. The Scan Cap is
  `SCAN_DAILY_CAP` Scans per Member per UTC day (default 30; `0` disables the
  cap); `SCAN_MATCH_CONFIDENCE_THRESHOLD` is the confidence below which a Match
  becomes Unmatched and an image read is flagged low-confidence.
  `POST /api/scan/plate` also returns a short-lived (10 minute) HMAC-SHA256
  token over the Member and the guessed dish titles; `POST /api/scan/plate/ingredients`
  requires it, so that expensive call cannot be made for an arbitrary title and is
  not a second Scan against the cap. It is signed with `SCAN_TOKEN_SECRET` (at
  least 32 characters): required when `NODE_ENV=production`; otherwise a missing one
  becomes a random per-process secret, so tokens do not survive a restart. Each
  signed title can be loaded once per token; that is tracked in memory, so it
  assumes a single API instance (a durable store is needed for several). Never
  log the secret or tokens.
- `src/catalog`: Catalog search (`GET /api/catalog/search`), name normalisation, and the
  starter seed (`npm run db:seed -w @pocket-pantry/api`, idempotent). Outside production
  the seed also signs up the test accounts `alice@test.local` and `bob@test.local`
  (password `password123`, see `src/auth/seed-test-accounts.ts`).
- `src/ingredients`: the scan-facing Catalog snapshot and match validator (Leaf Categories
  are the categories the AI sees).

## Catalog seed

`npm run db:seed -w @pocket-pantry/api` loads the Catalog from
`src/catalog/seed/`. Every row has a fixed id derived from its slug and is
inserted with `ON CONFLICT DO NOTHING`, so re-running is safe and keeps Admin
edits. The seed validates itself first and refuses to run with duplicate names,
ambiguous Synonyms, or dangling references. Slugs are permanent once merged.

- Databases seeded by the #4 starter seed must be reset before re-seeding with
  the full seed: display-name translation ids used to include the name text
  and now do not, so the old rows collide with the new ids.
- Dev databases already seeded with the first full seed (#29) must also be
  reset: this review round renamed slugs (`chicory-drink`, `fruit-syrup`,
  `coffee-3in1`, Leaf `fruiting-vegetables`) and moved Ingredients between
  Leaves, and re-seeding never updates or removes existing rows.
- Seed changes to an existing row's Leaf, Default Expiry, or unit do not reach
  databases that are already seeded (existing rows are never updated). An
  upsert strategy is needed before the first real deployment.
