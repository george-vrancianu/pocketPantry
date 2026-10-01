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
  schemas. Not exposed by any controller yet.
- `src/ingredients`: catalog validator and service. Stand-in until ticket #4.
