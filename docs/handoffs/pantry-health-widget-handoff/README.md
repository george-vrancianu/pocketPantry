# Pantry health widget — handoff package

Approved 2026-10-15 (variant D · Sheet).

| File | What it is |
|---|---|
| `handoff.md` | The spec: closed card, sheet, to-do catalogue, score, actions and API, accessibility, strings, tests, open questions. Start here. |
| `prototype.html` | Self-contained clickable prototype. Open it in a browser; variant D is selected. Use "Pantry state" to switch between a messy pantry, two to-dos and all in order. Needs internet only for the Google fonts. |
| `health.ts` | Reference `lib/health.ts`: score, verdict, to-dos and gain, as pure functions with types. Ported from the prototype; adapt the input types to the app's queries. |
| `icons-additions.ts` | SVG paths for the new icons (`pulse`, `cook`, `hourglass`) plus `calendar` and `low` for completeness. |

Depends on earlier handoffs (in the project's `docs/`): `themes/` (tokens and icon grid), `expiry/` (`ExpirySheet` and the days-left Tag), `pantry-batches/` (the Running low flag), ADR 0009 (deferred delete, used for Undo).

Needs a decision before merge: the `batches.checked_at` column (handoff §6.3).

Live prototype: https://claude.ai/artifact/2SdiZhK5XNswosQWdqjzgJ
