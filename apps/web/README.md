# @pocket-pantry/web

React 19 + Vite web app. It only renders and calls the API; business logic lives in `apps/api`.

## Run it

`npm run dev` from the repository root starts Postgres, the API on `:3000` and this app on
`http://localhost:5173`. To run only the web app: `npm run dev -w @pocket-pantry/web`.

The API origin defaults to the current hostname on port 3000. Set `VITE_API_URL` to point
elsewhere. The API only accepts browser origins on ports 5173 and 5174 (plus `CLIENT_ORIGIN`).

Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` (all with `-w @pocket-pantry/web`).

## Conventions

- **Pages** live in `src/pages/<Name>/<Name>Page.tsx`. Page-only components go in
  `components/`, hooks in `hooks/`, helpers in `utils/`. Tests sit next to the page.
- **UI** comes from `@pocket-pantry/ui` (Material UI behind our own components, themed with
  the handoff tokens). Do not import `@mui/*` in this app. Add missing primitives to the
  UI package instead.
- **Server state** is TanStack Query. Query keys and API hooks live in `src/lib`.
- **Links** use plain `href` props; `RouterLink` is registered as the UI provider's
  `linkComponent` so they navigate client-side.

## Translations

`react-i18next`, English (fallback) and Romanian. One JSON file per namespace per locale in
`src/i18n/locales/<locale>/<namespace>.json`, loaded automatically. A namespace is a page
(`signIn`, `pantry`, ...) or a shared component (`dock`, `screenHeader`, `languageSwitcher`).

- Every string on screen goes through `t()`. Add the key to both locales: a test fails if
  the two locales differ in namespaces or keys.
- API errors are `{ code, params }`. Codes such as `auth.invalid_email_or_password` resolve
  against the nested `errors` namespace (`translateApiError`). Unknown codes show the generic
  message; add copy for new codes in both locales.
- The chosen locale is stored in `localStorage` for now; it moves to Member Preferences when
  the API has them.
