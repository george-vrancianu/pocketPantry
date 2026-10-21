# Coding standards

Rules reviewers keep flagging. Each has its reason.

- **Toasts and Undo toasts are polite live regions (`role="status"`), not alerts.** `ToastProvider` defaults to `role="alert"`; pass `polite: true` in the toast options to get `status`. An alert interrupts the screen reader mid-sentence; a toast is information, not an emergency.
- **Tests use fake timers (`vi.useFakeTimers`), never real waits or `setTimeout` sleeps.** Real waits make suites slow and flaky under load.
- **Snapshots and date assertions never depend on today's date.** Pin the clock with fake timers or pass fixed dates, or the test breaks the day after it is written.
- **A component used by more than one page lives in `apps/web/src/components`.** Page-local copies drift apart; `pages/<Page>/components` is for single-page code only.
- **Undo reverses only what the action created.** Reversing more deletes Member data the action never touched.
- **New copy goes in en, ro and da, with ro plural forms (`_one`, `_few`, `_other`; `_few` covers CLDR few: 0, 2-19, 101-119), using `GLOSSARY.md` terms.** A missing locale shows raw keys, and without `_few` Romanian counts such as 0 or 12 read wrongly.
- **Lint with the right tool: `oxlint src` in `apps/web` and `packages/ui`, eslint in `apps/api`.** Running the wrong one passes silently or reports nothing; use `npm run lint -w <workspace>`.
