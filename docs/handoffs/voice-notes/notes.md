# Voice Notes (hold to speak) — prototype notes

## Decision (2026-10-18): Variant B · Thumb button; Apply waits for Batch picks
Handoff: `docs/handoffs/voice-notes/handoff.md` (+ `icons-additions.ts`), also delivered as `voice-notes-handoff.zip` with the prototype and 27 screenshots. Prototype marks B approved. Handoff adds: button states table (blocked, failed dot, cap dimmed), intro shown once per device and its Allow calls getUserMedia so the first hold never meets a prompt, screen-reader toggle mode, error copy for too_long / unsupported_audio, op table incl. uncheck / set quantity / remove-by-amount (not in the prototype), tapping disabled Apply scrolls to the needs-Batch row, Voice Note store shape, strings, tests. Open: mid-list rows under the floating button, SR detection, iOS audio format, wake lock.

## Round 1 (2026-10-16)
Prototype artifact: https://claude.ai/artifact/BUCR2vbWKR5DmyDC6y6BHd
Source: `docs/voice-notes/prototype.html`. Spec: GitHub #378 (ADR 0017; sub-issues #379–#386). Covers the whole flow: button → first use / permission → recording → sending states → Review → Apply.

### Variants (button placement only; everything after the press is shared)
- **A · Header pill**: "Speak" pill in the page header (next to Import / the avatar), language behind a divider in the same pill. Calm, but top of screen is hard to hold one-handed and scrolls away.
- **B · Thumb button (suggested)**: 62 pt round mic button bottom-right above the Dock, language chip to its left. Grows to 1.14 while recording with a 60 s progress ring. Built for basket-in-one-hand.
- **C · Hold strip**: full-width "Hold to speak" bar above the Dock, language chip at its left end, thin progress bar along the bottom. Biggest target, costs 66 pt on every visit.

### Shared flow
- Recording starts on pointer down (no hold delay). Release under 0.3 s = tap → tip "Hold to talk, let go to send", nothing sent or charged.
- Listening card: blinking dot, elapsed / 1:00, live level meter, Scan Language (read-only), which list it goes to + how to name the other.
- Slide 72 pt outside the button → cancel armed (card goes grey, "Let go to cancel", haptic 6 ms). Slide back re-arms.
- 50 s: timer amber "10 s left". 60 s: stops and sends, toast "Stopped at 1 minute".
- Reading pill with Cancel; page stays usable. Failed send: amber pill "Couldn't send · recording kept" + Retry / Discard, amber dot on the button. Silent: "Didn't catch anything, try again · doesn't count". Cap: "That's today's 50 Voice Notes · back tomorrow · Scans still work"; button dims and shows that message instead of recording.
- First use: explainer sheet (examples per page, privacy line: recording turned into text then deleted) → "Allow microphone" → browser prompt. Blocked: sheet with Safari / Chrome steps + "I've allowed it".
- Review (sheet, scrim doesn't close it): collapsed "What I heard" transcript; changes grouped by list, default list first, the other tagged "you named it"; "Couldn't apply" (Not found / Didn't understand) read-only at the bottom. Row = op tile (tick / add / remove / running low) + "Verb **Name**" + detail line. Pantry adds show filled-in defaults with "· usual" / "· default" and a dotted underline. Tap a row → inline editor (heard phrase, amount + unit chips, expiry quick picks, Location, Batch radio list, Change ingredient via catalog search). × drops one.
- Batch needed: row outlined amber, opened by default; Apply disabled "Pick a batch first".
- Discard asks inline ("you'll have to say it again"). Apply → "Applying" → sheet closes, changed rows flash accent-tint, toast "6 applied: 5 on the list, 1 in the Pantry" or "6 applied, 1 skipped: milk no longer in Pantry". No Undo (ADR 0017).
- Language chip is a separate tap target; menu English / Română / Dansk, remembered and shared with the camera chip.
- A11y: screen reader → toggle mode (double-tap start / send); keyboard hold Space, Esc cancels.

### Open questions
- Apply blocked until Batches are picked, or apply the rest and leave it out?
- Variant pick (B suggested). B covers the right end of the last rows; list gets 190 pt bottom padding.
- "Only Didn't understand" Review: transcript expanded, Apply "Nothing to apply", Discard primary (described, not built).
