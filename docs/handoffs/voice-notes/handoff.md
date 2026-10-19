# Voice Notes (hold to speak) — design handoff

Status: approved (button placement **B · Thumb button**; Apply waits for Batch picks), ready for implementation. Date: 2026-10-18.
Reference prototype: `prototype.html` in this folder (self-contained, open in a browser; live at https://claude.ai/artifact/BUCR2vbWKR5DmyDC6y6BHd). It opens on B. A · Header pill and C · Hold strip stay in the file for comparison only. The left panel switches the page (Shopping List / Pantry), microphone permission (Not asked / Allowed / Blocked), what the next send returns (Heard / Silent / No signal / Cap reached) and whether Apply meets a clash; **Jump to** plays each state without holding. The prototype is the source of truth for look, timing and gesture feel; the numbers below are copied from it.

Spec: GitHub **#378** (Voice Notes), ADR 0017, glossary Voice section. Sub-issues: #379 Scan Cap by kind, #380 shared Match pipeline, #381 tracer, #382 Shopping add, #383 other Shopping ops, #384 Pantry, #385 both lists + Voice Cap + stale rows, #386 replay set. This handoff covers the web UI only; behaviour, API and errors are as the spec says, and every screen below maps to a spec user story.

Files in this folder:

| File | What it is |
|---|---|
| `handoff.md` | This spec |
| `prototype.html` | Interactive reference (all states, three themes, three placements) |
| `notes.md` | Design notes: the round-1 variants and the decision log |
| `icons-additions.ts` | Icons the flow needs that `icons.tsx` may not have yet (§12) |
| `screenshots/` | 27 PNGs of every state (Warm theme, variant B unless named; fonts fall back to system faces in the captures) |

Screenshots: `01-shopping-rest`, `02-pantry-rest`, `03-first-use`, `04-permission-prompt`, `05-microphone-blocked`, `06-recording`, `07-slide-to-cancel`, `08-cancelled-toast`, `09-last-10-seconds`, `10-reading`, `11-failed-send`, `12-nothing-heard`, `13-voice-cap`, `14-tap-hint`, `15-language-menu`, `16-review-shopping`, `17-review-what-i-heard`, `18-review-edit-pantry-add`, `19-review-change-ingredient`, `20-review-discard-confirm`, `21-applied-shopping`, `22-review-pantry-needs-batch`, `23-review-pantry-couldnt-apply`, `24-applied-pantry-skipped`, `25-recording-dark`, `26-review-dark`, `27-review-minimal`.

Tokens are the theme tokens from `themes/` (`--accent`, `--card-bg`, `--r-card`, `--r-ctl`, `--shadow-float`, …). One new semantic alias: **`--rec` = `--urgent-fg`** (recording colour). Sizes in pt = CSS px.

Code touched (proposed): new `apps/web/src/lib/microphone.ts` (the Microphone module seam from the spec), new `apps/web/src/features/voice/` (`VoiceButton.tsx`, `ListeningCard.tsx`, `VoiceStatusPill.tsx`, `VoiceLanguageMenu.tsx`, `MicIntroSheet.tsx`, `MicBlockedSheet.tsx`, `VoiceReviewSheet.tsx`, `VoiceActionRow.tsx`, `voiceNoteStore.ts`), mounted on `pages/Shopping/ShoppingPage.tsx` and `pages/Pantry/PantryPage.tsx`; `i18n/locales/{en,da,ro}/voice.json`; `packages/ui` icons (§12).

---

## 1. Summary

| Step | What the Member sees |
|---|---|
| Rest | A round mic button bottom-right above the Dock, the Scan Language chip to its left (§2) |
| First press ever | "Say what you did" explainer, then the browser's microphone prompt (§3) |
| Hold | Button grows and turns the recording colour with a 1-minute ring; a Listening card opens above it (§4) |
| Slide off | Card goes grey, "Let go to cancel" (§4.3) |
| Let go | Reading pill with Cancel; page stays usable (§5) |
| Result | Review sheet over the page (§6), or a status pill for failure / silence / Voice Cap (§5) |
| Apply | Sheet closes, changed rows flash, toast with the count and anything skipped (§7) |

The voice button is **hidden** (not disabled) when the API reports voice is not configured.

## 2. Voice button (variant B)

### 2.1 Placement
- Wrapper `position: absolute` in the page frame (above the scroll area, below sheets), `right: 18`, `bottom: 100` (Dock 72 + 12 + 16 air), plus `env(safe-area-inset-bottom)` and `-right`. Flex row, gap 8, `align-items: center`: language chip, then the button. z-index above the list and the Dock, below sheets, toasts and the status pill.
- Shown on **Shopping** and **Pantry** only (spec: no other page, no global button).
- The pages' scroll containers get `padding-bottom: 190` so the last row can scroll clear of the button.

### 2.2 Button
- 62 × 62 circle, `--accent` fill, mic icon 27 px stroke 2.1 in `--accent-ink`, `--shadow-float`. `button` with `aria-label` "Hold to record a Voice Note", `aria-pressed` while recording.
- `touch-action: none`, `user-select: none`, `-webkit-touch-callout: none`, `contextmenu` prevented (long press must never open a menu or select text).
- Press scale and colour transitions: 180 ms `cubic-bezier(.2,.8,.2,1)`.
- Never shows "+": it must not read as another Add.

### 2.3 Language chip
- 30 pt tall pill, min-width 40, padding 0 9, `--surface` fill, 1 pt `--line-strong` border, `--shadow-card`, text = the Scan Language code ("EN" / "RO" / "DA") 12/800, letter-spacing .06 em. `aria-label` "Scan Language: English. Change".
- Separate tap target, never part of the hold area. Tap opens the language menu (§2.4); tap again or outside closes it.

### 2.4 Language menu
- Popover anchored above the chip: `right: 16`, `bottom: 172`, 220 wide, `--card-bg`, radius `--r-ctl`, `--shadow-float`, padding 6. `role="menu"`, items `menuitemradio`.
- Eyebrow "Scan Language" (11.5/700 caps, .07 em, `--muted`), then **English / Română / Dansk** in their own names (`lang` attribute on each), 14.5/600, code on the right in `--muted`, check icon 16 `--accent` on the current one. Item padding 9 10, radius 8, hover `--subtle`.
- Choosing: saves through the **existing stored Scan Language** (the camera chip's value, ADR 0003), closes, toast "Scan Language: Danish" / "Used for Voice Notes and the camera." Focus returns to the chip. Escape closes.

### 2.5 Button states

| State | Look | Press does |
|---|---|---|
| Ready | as §2.2 | starts recording (§4) |
| Microphone not asked yet | as Ready | opens the intro sheet (§3.1) instead |
| Microphone blocked | mic-off icon, 55 % opacity | opens the blocked sheet (§3.3) |
| Recording | §4.1 | — |
| Reading (§5.1) | as Ready | tip "Still reading your last note" |
| Send failed (§5.2) | Ready + 12 pt dot `--soon-fg` with 2 pt `--card-bg` ring at top-right | tip "Retry or discard the last note first" |
| Voice Cap reached today | 55 % opacity | shows the cap pill (§5.4); does not record |

The cap state is learned from a `voice.cap_reached` answer and lasts until the Member's local midnight or a page reload.

## 3. Microphone permission

### 3.1 Intro sheet (first press ever)
Shown when the Microphone module reports permission `prompt` (never asked). Short sheet (`Sheet` size `content`), radius 28 top, `--bg`.
- Hero: 76 pt circle `--accent-tint` with mic 34 px `--accent-on-tint`; title display 22 "Say what you did".
- 14 `--muted` centred: "Hold the button, speak, let go. You check every change before anything is saved."
- Three example cards (`--card-bg`, radius `--r-ctl`, padding 9 12): phrase 14/600 in quotes + 12 `--muted` result. Examples depend on the page:
  - Shopping: “Got the bread, take milk off” · Ticks bread, removes milk / “Add two litres of milk” · Adds milk, 2 l / “Put two yogurts in the fridge, they expire Friday” · Goes straight to the Pantry.
  - Pantry: “Two yogurts in the fridge, they expire Friday” · Adds a batch of 2 pcs / “We finished the milk” · Removes the milk expiring soonest / “Running low on rice” · Marks rice running low.
- Privacy paragraph 14 `--muted`: "**Pocket Pantry needs your microphone** to hear Voice Notes. Your browser will ask next. The recording is turned into text to read your changes, then deleted; nothing is kept." (matches the spec: no recordings or transcripts stored).
- Footer: ghost "Not now" (closes) + primary "Allow microphone" (mic icon) → `microphone.requestPermission()` → the browser's own prompt (screenshot 04 is a mock of it).
- Granted: close the sheet, toast "Microphone on" / "Now hold the button and speak." Do **not** start recording automatically.
- Denied: swap to the blocked sheet (§3.3).
- The intro is shown once per device (until permission is decided); if the browser already granted permission, skip it.

### 3.2 Mid-hold permission
Browsers that only prompt on `getUserMedia` (iOS Safari) will show their prompt on the first press. Because the intro sheet's "Allow microphone" calls `getUserMedia` (and stops the tracks straight away), the first real hold never meets a prompt.

### 3.3 Blocked sheet
Shown when permission is `denied`, from the intro or any later press.
- Hero circle `--urgent-bg` with mic-off `--urgent-fg`; title "The microphone is blocked"; 14 `--muted` "Voice Notes need it. Allow it for Pocket Pantry in your browser, then come back and hold the button again."
- Card with two short step lists, eyebrows "iPhone, Safari" and "Android, Chrome":
  - Tap **aA** in the address bar → **Website Settings** → **Microphone** → **Allow**.
  - Tap the lock next to the address → **Permissions** → **Microphone** → **Allow**.
  Show only the one for the detected browser when detection is reliable; both otherwise.
- Footer: ghost "Close" + primary "I've allowed it" → re-check permission; granted → close + toast "Microphone on"; still denied → keep the sheet and shake the hero once (no motion under reduce-motion).

## 4. Recording

### 4.1 Start
- Recording starts on **pointer down**, with no hold delay, so the first word isn't clipped. `setPointerCapture` on the button.
- Haptic 10 ms (where `navigator.vibrate` exists).
- Button: scale 1.14, fill `--rec`, icon `--card-bg`. A ring around it (inset −7, 4 pt wide) shows progress over 60 s: `conic-gradient(--rec 0 → elapsed/60, --rec 18 % after)`, masked to a ring. Ring fades in 150 ms.
- Page scrim: `--ink` at 16 % over the page (not the button), 180 ms fade, `pointer-events: none`.
- Microphone module: `start()` → `MediaRecorder` with the browser's default type (webm/opus on Chromium, mp4/aac on iOS Safari), plus an `AnalyserNode` on the same stream for the level meter only (no live transcription, spec out of scope).

### 4.2 Listening card
Above the button: `left: 16`, `right: 16`, `bottom: 184` (+ safe area), `--card-bg`, radius `--r-card`, `--shadow-float`, padding 14 16 13, column gap 10. Enters with 200 ms fade + 8 pt rise + scale .98 → 1. `role="status"`.
- **Top row** (gap 9): 10 pt dot `--rec` blinking (opacity 1 → .25 → 1, 1.1 s); "Listening" 15/700; on the right the elapsed time in the display face 22 `tabular-nums` ("0:07") + 12/600 `--muted` "/ 1:00".
- **Level meter**: 30 bars, gap 3, height 38, each bar `flex: 1`, radius 2, `--rec`, height `3 + level × 35` pt, updated every ~90 ms, newest on the right (the meter scrolls left). Level = RMS of the analyser frame, smoothed.
- **Bottom** (12.5 `--muted`, wraps): Scan Language pill (11.5/700 on `--chip`, read-only here), "Let go to send · slide off to cancel", and on its own line which list it goes to:
  - Shopping: "Goes to your Shopping List. Say “in the pantry” to add stock."
  - Pantry: "Goes to your Pantry. Say “on the list” for the Shopping List."

### 4.3 Slide to cancel
- Cancel arms when the pointer is more than **72 pt outside the button's box** in any direction; it disarms when the pointer comes back inside that margin. Haptic 6 ms on each change.
- Armed: button scale .9, fill `color-mix(--ink 55 %, --card-bg)`; card background `--subtle`, the dot is replaced by a 22 pt `--ink` circle with × in `--card-bg`, title "Let go to cancel", meter bars `--line-strong` and flat, bottom line "Slide back to keep recording".
- Letting go while armed: discard the recording (`microphone.cancel()`), nothing sent or charged, toast "Cancelled. Nothing was sent."
- `pointercancel` (e.g. a system gesture or incoming call) also cancels.

### 4.4 Quick tap
Released less than **0.3 s** after press: treated as a tap. Discard the audio, nothing sent or charged, and show a tip above the button for 1.8 s: "Hold to talk, let go to send" (`--toast-bg` / `--toast-ink`, 13/600, padding 8 12, radius 10).

### 4.5 Time limit
- From **50 s**: the time and its suffix turn `--soon-fg`, suffix reads "{n} s left".
- At **60 s**: stop and send what was recorded (spec), haptic 14 ms, toast "Stopped at 1 minute" / "Sending what you said."

### 4.6 Let go
Stop (`microphone.stop()` → blob + MIME type), haptic 14 ms, close the card, send (§5). The duration is kept for the reading pill and Review.

### 4.7 Keyboard and screen readers
- Focused button: **Space or Enter down** starts, **up** sends (same 0.3 s tap rule); **Escape** cancels while recording.
- With a screen reader (VoiceOver / TalkBack can't hold-and-release), the button acts as a **toggle**: activate to start (announce "Recording"), activate again to send, Escape or the two-finger scrub / back gesture to cancel. Detect via the platform setting where available; otherwise offer the toggle behaviour when the button is activated by a click without a preceding pointer down (assistive activation).
- The Listening card is a polite live region; announce "Recording", "Let go to cancel", "10 seconds left" once each, not every tick.

## 5. Sending and status pill

One pill, in the same place as the card: `left: 16`, `right: 16`, `bottom: 178`, `--card-bg`, radius `--r-ctl`, `--shadow-float`, padding 11 12 11 14, gap 11. Leading 30 pt round icon; text 14/600 with a 12 `--muted` second line; actions on the right (34 pt pill buttons, 13/700). Enters with the card's 200 ms rise.

### 5.1 Reading
- Icon: 18 pt spinner (`--accent-on-tint` on `--accent-tint`). "Reading your note" / "0:09 of speech · English". Action: "Cancel".
- The page stays usable underneath; the button follows §2.5. Cancel aborts the request (the Voice Cap charge is refunded server-side only if the provider wasn't reached; that's the spec's rule, the UI just says "Cancelled. Nothing was saved.").
- On success the pill closes and Review opens (§6).

### 5.2 Failed send (no signal, `voice.provider_unavailable`, network error)
- Icon wifi-off on `--soon-bg` / `--soon-fg`. "Couldn't send" / "No connection. Your recording is kept." Actions: "Discard" + primary "Retry". `role="alert"`.
- The pill stays until acted on. The recording stays in the in-memory Voice Note store (spec: reload drops it). Button shows the amber dot (§2.5).
- Retry re-sends the same blob → back to §5.1. Discard → toast "Recording discarded".

### 5.3 Nothing heard (`voice.nothing_heard`)
- Icon ear on `--accent-tint`. "Didn't catch anything, try again" / "Hold the button and speak close to the phone. This one doesn't count." Auto-closes after 3.6 s. No Review.

### 5.4 Voice Cap (`voice.cap_reached`)
- Icon clock on `--urgent-bg` / `--urgent-fg`. "That's today's 50 Voice Notes" / "Voice is back tomorrow. Scans still work." Action "OK". The number comes from the error payload (the cap is configurable). `role="alert"`.
- Button switches to the cap state (§2.5).

### 5.5 Other errors
- `voice.too_long`: should not happen (client stops at 60 s); show the failed pill with "That recording was too long. Try a shorter one." and Discard only.
- `voice.unsupported_audio`: pill "This browser's recording format isn't supported" + Discard; log it.
- `voice.not_configured`: hide the button and drop the note silently.

## 6. Review sheet

Spec: "a sheet over the current page". Tall sheet: `top: 7 %` to the bottom, radius 28 top, `--bg`, `role="dialog"` `aria-modal`, labelled by its title. **The scrim does not close it** and swipe-down is off, so a stray tap with full hands can't lose the note; it closes only by Discard or Apply.

### 6.1 Header
Grab handle; title "Review" (display 22); subline 13 `--muted`: "{n} changes · nothing is saved until you Apply", or "{n} changes on both lists · …" when both lists are touched, or "Nothing to apply · …".

### 6.2 What I heard
First block of the body. Card (`--card-bg`, `--card-line`, radius `--r-card`, `--shadow-card`); the header is a `button` with `aria-expanded`:
- 30 pt tile (`--chip`, radius 9) with a quote icon 16 `--muted`; "What I heard" 14/700; under it the transcript's first line, 12.5 `--muted`, ellipsis; chevron 18 rotating 180° when open (220 ms).
- Open: the full transcript in the display face 16/500, line-height 1.45, `lang` = the Scan Language, padding 0 16 14 55; under it 12/600 `--muted` "English · 0:09".
- Collapsed by default. Expanded by default when every Voice Action is "Didn't understand" (§6.7).

### 6.3 Groups
- One group per list, **the page's default list first**, then the other. Group label 12/700 caps .07 em `--muted` with the list icon 15 (basket / pantry), name "Shopping List" / "Pantry", and the count on the right. The non-default group gets a small pill "you named it" (11.5/600, `--chip`, not caps), because the Member said it in the sentence.
- Each group is one card of Voice Action rows, `--divider` between rows.
- Last group, "Couldn't apply", holds `notFound` and `notUnderstood` entries (§6.6).

### 6.4 Voice Action row
- Header `button` (min-height 60, padding 9 52 9 12, gap 11, `aria-expanded`): **op tile** 34 pt radius 10 with an 18 px icon, then two lines:
  - Line 1, 15: verb in `--muted` 600 + Ingredient name 700, one line, ellipsis.
  - Line 2, 12.5 `--muted`, `tabular-nums`, wraps; amounts in `--ink` 600.
- **Drop** button: 36 pt circle × (17 px) at `right: 8`, `top: 12`, `aria-label` "Drop this change". Drops it from this Review only.

| Voice Action | Tile (bg / icon) | Line 1 | Line 2 |
|---|---|---|---|
| Shopping check, on list | `--accent-tint` / check | Tick **Bread** | On your list · **1 pcs** |
| Shopping check with quantity | same | Tick **Milk** | **2 l**, list said 3 l |
| Shopping check, not on list | same | Add, ticked **Sausages** | Not on your list, so it's added ticked |
| Shopping add | `--ok-bg` / plus | Add **Eggs** | **12 pcs** or No amount; Unmatched adds "· not in the catalog, saved as said" |
| Shopping add from Running low | same | Add **Butter** | No amount · no butter in the Pantry, so it goes on the list |
| Shopping uncheck | `--chip` / minus-in-box (use `minus`) | Untick **Eggs** | Back on your list |
| Shopping remove | `--urgent-bg` / minus | Remove **Spinach** | Comes off your list · 200 g |
| Shopping set quantity | `--chip` / equals | Change **Eggs** | **12 pcs**, list said 6 pcs |
| Pantry add | `--ok-bg` / plus | Add **Greek yogurt** | **2 pcs** · Fridge · expires Fri 23 Oct (defaults marked, below) |
| Pantry remove (one) | `--urgent-bg` / minus | Remove **Milk** | Takes **1 l** · Sat 17 Oct, expiring soonest |
| Pantry remove all | same | Remove all **Eggs** | Takes all 2 batches · **16 pcs** |
| Pantry remove amount | same | Use **Rice** | Takes **500 g** from 2 batches, soonest first |
| Pantry remove, needs Batch | same + 2 pt `--soon-fg` ring on the tile | Use **Greek yogurt** | 300 g doesn't fit batches counted in pcs · pick one (in `--soon-fg` 600) |
| Running low | `--butter` / battery-low | Running low **Olive oil** | Shows in Suggestions until a new batch arrives |

**Defaults on Pantry adds** (spec: "the defaults that will be used … shown on each Pantry add"): a Location or expiry the Member didn't say gets a 1 pt dotted `--line-strong` underline and a suffix in `--muted`: "Fridge · usual" (Catalog default Location) and "expires Thu 22 Oct · default" (Default Expiry). "no expiry" when the Member said so. Dates: "Fri 23 Oct", with the year when it isn't this year.

### 6.5 Editing a row
Tap the row header to open it in place (one open at a time; opening another closes the first). Open row: `--subtle` background, chevron flips; the editor sits under the header with padding 2 14 14 57 (aligned with the text), column gap 12:
1. **Heard**: 12.5 `--muted` "Heard: “put two yogurts straight in the pantry, they expire Friday”" (the spoken phrase for this action, so a mishearing is easy to spot).
2. **Amount** (adds, checks, set quantity): eyebrow; a number field 80 × 40 (`inputmode=decimal`, 16/700, `tabular-nums`, radius `--r-ctl`, focus ring `--accent` + 3 pt `--accent-tint`), placeholder "–", then unit chips **g · kg · ml · l · pcs** (34 pt, radius `--r-chip`, selected = `--accent` fill). Empty = no amount. Reuse the `amount-slider/` field if it fits the row width.
3. **Expires** (Pantry adds): quick-pick chips **Tomorrow · 3 d · 1 wk · 2 wk · 1 yr · No expiry** (from the `expiry/` quick picks), then 12.5 `--muted` "**Fri 23 Oct** · from what you said" / "· Default Expiry for this Ingredient". A spoken date that isn't a quick pick shows as its own selected chip. A "Pick a date" link opens the existing `ExpirySheet`.
4. **Location** (Pantry adds): chips **Fridge · Freezer · Cupboard · Spices**; when not said: 12.5 `--muted` "Not said, so the usual place for this Ingredient". Choosing one clears the "usual" mark.
5. **Batch** (Pantry removes, one or by amount): eyebrow "Batch to remove" (or "Which batch did you use up?" when needed), then a radio list in a card: radio 20, index circle 22 (`--chip`, 11/700, as `pantry-batches/` batch rows), "**1 pcs** · Sat 17 Oct · description" 14/700 + `--muted`, and the expiry tag. Order: soonest first, undated last. Picking a batch sets the action to ready. `role="radiogroup"`.
6. **Ingredient**: "Ingredient **Greek yogurt**" with an "Unmatched" pill when not in the catalog, and a "Change" link (search icon) that swaps in the **shared `CatalogSearch`** (`catalog-search/`) prefilled with the current name, focused and selected. Picking a result replaces the Match (and clears Unmatched); no result keeps it as said.
7. **Done** pill (34 pt) closes the row.

Edits are client-only until Apply (spec: nothing is saved before Apply). After an edit, line 2 updates at once.

### 6.6 Couldn't apply
Read-only rows (not buttons), in the last group:
- Tile 34 transparent with 1.5 pt dashed `--line-strong`, icon `--muted` (search for Not found, alert for Didn't understand).
- Line 1 wraps: `--muted` "Not found: " or "Didn't understand: " + the spoken phrase in quotes, 600.
- Line 2: the reason from the API ("No cheddar in your Pantry.", "Voice can't change Staples. Do it from the Pantry.").
- The × dismisses it from view (no effect on Apply).

### 6.7 Only "Didn't understand"
Spec: Review still opens. "What I heard" starts expanded; the subline reads "Nothing to apply"; the footer shows only **Discard** as the full-width primary.

### 6.8 Footer
Sticky, padding 12 16 20 + safe area, 1 pt `--line` top, gap 10.
- Ghost "Discard" (48 pt, 1 pt `--line-strong`) + primary "Apply {n} change(s)" with check icon (48 pt, `flex: 1`). n = actionable Voice Actions not dropped.
- **While any action needs a Batch: primary disabled, label "Pick a batch first"** (decided 2026-10-18; Apply never skips them). The needs-Batch row opens by default when Review opens and is the first focus target; tapping the disabled button scrolls that row into view and focuses its batch list.
- Discard asks once, in place of the footer buttons: 14/600 "Discard this Voice Note?" + 12.5 `--muted` "Nothing changes, and you'll have to say it again.", then ghost "Keep reviewing" + danger "Discard" (`--urgent-fg` fill, `--card-bg` text). Confirm → close, toast "Voice Note discarded" / "Nothing was changed."
- While applying: both disabled, primary shows a spinner + "Applying".

## 7. Apply

- `POST /voice/apply` with the Voice Actions as edited (spec API contract).
- On success: close the sheet; invalidate the Shopping List and Pantry queries; rows the result touched get a one-off **flash** (background `--accent-tint` held 30 % of 1.8 s, then fading to none; none under reduce-motion).
- Toast (5.2 s, no Undo, ADR 0017):
  - all applied, one list: "5 applied";
  - both lists: "6 applied: 5 on the list, 1 in the Pantry" (page's list named first);
  - skipped: "6 applied, 1 skipped: milk no longer in Pantry"; several skipped: "5 applied, 2 skipped: milk no longer in Pantry, eggs already removed" (reasons from the response, first two, then "+{n}").
  - Already-satisfied actions count as applied (spec). If the response flags them, add a second line: "Bread was already ticked, so that one counts as done."
- On error: an `Alert` at the top of the sheet body; the sheet stays open with every edit kept.
- Finish Shopping between proposal and Apply needs nothing in the UI (spec: actions land on the new active list).

## 8. Voice Note store

Small in-memory module store (like the Scan Session store, ADR 0004) shared by the button, pill and Review:

```
type VoicePhase = 'idle' | 'recording' | 'reading' | 'failed' | 'review' | 'applying';
interface VoiceNoteState {
  phase: VoicePhase;
  page: 'shopping' | 'pantry';         // default target
  recording?: { blob: Blob; mimeType: string; seconds: number; scanLanguage: ScanLanguage };
  proposal?: { transcript: string; actions: VoiceActionDraft[] };   // from POST /voice, then edited
  error?: VoiceErrorCode;
}
```
- Review is modal, so the Member can't change page while it's open. A failed recording does survive moving between Shopping and Pantry and shows its pill on either page.
- Dropped on reload (spec).

## 9. Motion and haptics

| What | Duration / easing |
|---|---|
| Button grow / shrink, colour | 180 ms `cubic-bezier(.2,.8,.2,1)` |
| Ring and scrim fade | 150 / 180 ms |
| Card and pill enter | 200 ms, opacity 0 → 1, translateY 8 → 0, scale .98 → 1 |
| Rec dot blink | 1.1 s ease-in-out, infinite |
| Meter update | every 90 ms, bar height transition 90 ms linear |
| Sheet enter | 300 ms `cubic-bezier(.2,.8,.2,1)` (existing `Sheet`) |
| Row flash after Apply | 1.8 s ease-out |
| Haptics | start 10 ms · cancel arm/disarm 6 ms · send / auto-stop 14 ms |

Reduce motion: no blink, no card/pill rise, no flash, no button scale; colours and the meter still change (the meter is information).

## 10. Strings (`voice.json`, en)

`button.label` "Hold to record a Voice Note", `button.langLabel` "Scan Language: {{language}}. Change", `tip.hold` "Hold to talk, let go to send", `tip.busy` "Still reading your last note", `tip.failedFirst` "Retry or discard the last note first",

`lang.title` "Scan Language", `lang.saved` "Scan Language: {{language}}", `lang.savedHint` "Used for Voice Notes and the camera.",

`intro.title` "Say what you did", `intro.body` "Hold the button, speak, let go. You check every change before anything is saved.", `intro.privacy` "<b>Pocket Pantry needs your microphone</b> to hear Voice Notes. Your browser will ask next. The recording is turned into text to read your changes, then deleted; nothing is kept.", `intro.notNow` "Not now", `intro.allow` "Allow microphone", `intro.examples.shopping.*` / `intro.examples.pantry.*` (§3.1), `mic.on` "Microphone on", `mic.onHint` "Now hold the button and speak.",

`blocked.title` "The microphone is blocked", `blocked.body` "Voice Notes need it. Allow it for Pocket Pantry in your browser, then come back and hold the button again.", `blocked.safari` "iPhone, Safari", `blocked.safariSteps` …, `blocked.chrome` "Android, Chrome", `blocked.chromeSteps` …, `blocked.close` "Close", `blocked.retry` "I've allowed it",

`rec.listening` "Listening", `rec.of` "/ 1:00", `rec.left` "{{count}} s left", `rec.hint` "Let go to send · slide off to cancel", `rec.toShopping` "Goes to your Shopping List. Say “in the pantry” to add stock.", `rec.toPantry` "Goes to your Pantry. Say “on the list” for the Shopping List.", `rec.cancelArmed` "Let go to cancel", `rec.slideBack` "Slide back to keep recording", `rec.cancelled` "Cancelled. Nothing was sent.", `rec.stopped` "Stopped at 1 minute", `rec.stoppedHint` "Sending what you said.",

`send.reading` "Reading your note", `send.readingMeta` "{{duration}} of speech · {{language}}", `send.cancel` "Cancel", `send.cancelled` "Cancelled. Nothing was saved.", `send.failed` "Couldn't send", `send.failedHint` "No connection. Your recording is kept.", `send.retry` "Retry", `send.discard` "Discard", `send.discarded` "Recording discarded", `send.nothing` "Didn't catch anything, try again", `send.nothingHint` "Hold the button and speak close to the phone. This one doesn't count.", `send.cap` "That's today's {{cap}} Voice Notes", `send.capHint` "Voice is back tomorrow. Scans still work.", `send.tooLong` "That recording was too long. Try a shorter one.", `send.unsupported` "This browser's recording format isn't supported",

`review.title` "Review", `review.count_one/other` "{{count}} change(s)", `review.bothLists` "on both lists", `review.nothing` "Nothing to apply", `review.notSaved` "nothing is saved until you Apply", `review.heard` "What I heard", `review.list.shopping` "Shopping List", `review.list.pantry` "Pantry", `review.namedIt` "you named it", `review.couldnt` "Couldn't apply", `review.notFound` "Not found:", `review.notUnderstood` "Didn't understand:",

`op.check` "Tick", `op.addChecked` "Add, ticked", `op.add` "Add", `op.uncheck` "Untick", `op.remove` "Remove", `op.removeAll` "Remove all", `op.use` "Use", `op.setQuantity` "Change", `op.runningLow` "Running low",

`detail.onList` "On your list", `detail.listSaid` "list said {{amount}}", `detail.notOnList` "Not on your list, so it's added ticked", `detail.backOnList` "Back on your list", `detail.comesOff` "Comes off your list", `detail.noAmount` "No amount", `detail.unmatched` "not in the catalog, saved as said", `detail.lowToList` "no {{name}} in the Pantry, so it goes on the list", `detail.usual` "usual", `detail.default` "default", `detail.expires` "expires {{date}}", `detail.noExpiry` "no expiry", `detail.takes` "Takes {{amount}} · {{date}}", `detail.soonest` "expiring soonest", `detail.takesAll_one/other` "Takes all {{count}} batch(es)", `detail.takesFrom_one/other` "Takes {{amount}} from {{count}} batch(es), soonest first", `detail.needsBatch` "{{amount}} doesn't fit batches counted in {{unit}} · pick one", `detail.lowHint` "Shows in Suggestions until a new batch arrives",

`edit.heard` "Heard:", `edit.amount` "Amount", `edit.expires` "Expires", `edit.fromSpeech` "from what you said", `edit.defaultExpiry` "Default Expiry for this Ingredient", `edit.location` "Location", `edit.locationDefault` "Not said, so the usual place for this Ingredient", `edit.batch` "Batch to remove", `edit.whichBatch` "Which batch did you use up?", `edit.ingredient` "Ingredient", `edit.change` "Change", `edit.done` "Done", `edit.drop` "Drop this change",

`footer.discard` "Discard", `footer.apply_one/other` "Apply {{count}} change(s)", `footer.pickBatch` "Pick a batch first", `footer.applying` "Applying", `footer.confirm` "Discard this Voice Note?", `footer.confirmHint` "Nothing changes, and you'll have to say it again.", `footer.keep` "Keep reviewing", `footer.discarded` "Voice Note discarded", `footer.discardedHint` "Nothing was changed.",

`result.applied_one/other` "{{count}} applied", `result.split` "{{count}} applied: {{here}} {{hereList}}, {{there}} {{thereList}}", `result.skipped_one/other` "{{count}} applied, {{skipped}} skipped: {{reasons}}", `result.already` "{{name}} was already {{state}}, so that one counts as done."

Ro and Da need `few` plurals where `_one/_other` appear. Units (g, kg, ml, l, pcs) follow the existing unit strings.

## 11. Accessibility
- Voice button: name, `aria-pressed`, keyboard and screen-reader toggle mode (§4.7). Language chip has its own name and focus stop; the menu is `menu` / `menuitemradio` with arrow keys.
- Listening card and pills are live regions (polite; failure and cap are `alert`).
- Review: `dialog` labelled "Review"; focus goes to the title on open, or to the needs-Batch row's batch list when there is one. Row headers are buttons with `aria-expanded`; the batch list is a `radiogroup`; drop buttons are named "Drop this change: Remove Spinach".
- State is never colour-only: every op has a verb and an icon; defaults have the words "usual" / "default".
- After Apply or Discard, focus returns to the voice button.
- Hit targets ≥ 44 pt except the language chip (30 pt tall, padded to 44 with an invisible hit area).

## 12. Icons
`icons-additions.ts` lists the lucide icons to add if `packages/ui` doesn't have them yet: `MicIcon`, `MicOffIcon`, `WifiOffIcon`, `EarIcon`, `QuoteIcon`, `ClockIcon`, `EqualIcon`. Existing ones reused: `CheckIcon`, `PlusIcon`, `MinusIcon`, `CloseIcon`, `SearchIcon`, `ChevronDownIcon`, `WarningIcon`, `BasketIcon`, `PantryIcon`, the battery-low Running low icon from `pantry-batches/`, `LockIcon` from `meal-plan-pages/`.

## 13. Tests (web, per the spec's Testing Decisions; microphone module mocked)
- Button: hidden when voice isn't configured; visible on Shopping and Pantry only; chip shows the stored Scan Language and changing it updates the camera's.
- Permission: not asked → intro sheet, Allow → granted toast, Block → blocked sheet; blocked → press opens blocked sheet; "I've allowed it" re-checks.
- Hold: pointer down starts (mock `start` called), release after ≥ 0.3 s sends with the right `defaultTarget`, `scanLanguage`, `locale`, `today`; release < 0.3 s shows the tip and sends nothing; moving 72 pt out arms cancel, back in disarms, release while armed sends nothing and shows the toast; fake timers: amber at 50 s, auto-send at 60 s; Space/Escape.
- Sending: reading pill + Cancel; failure keeps the recording, Retry re-sends the same blob, Discard drops it; `nothing_heard` pill; `cap_reached` pill and dimmed button that no longer records.
- Review: transcript collapsed and expandable; groups ordered default-first with "you named it"; every op's line 2; defaults marked; edits to amount, unit, expiry, Location, Batch and Ingredient reach the apply body; drop removes; Couldn't apply rows read-only; needs-Batch disables Apply with "Pick a batch first" until picked; only-Didn't-understand variant; Discard confirm.
- Apply: body shape; success closes, invalidates both queries, toast wording for one list, both lists and skips; error keeps the sheet and edits.
- Snapshots in the three themes: rest, recording, slide-to-cancel, Review (Shopping), Review (Pantry with needs-Batch).

## 14. Open questions for the implementer to flag
- **Bottom padding**: the floating button covers the right end of the last visible rows; 190 pt of scroll padding fixes the end of the list, but mid-list rows can still sit under it while scrolling. If row trailing content (amounts, tags) gets hidden in practice, consider fading the button to 60 % while the list scrolls.
- **Screen-reader detection** for the toggle mode has no reliable web API; confirm the fallback in §4.7 works with VoiceOver and TalkBack.
- **iOS Safari audio**: the spec's unverified provider details (mp4/aac acceptance, max size) also decide whether the client must transcode; if it must, the reading pill's wait grows.
- **Wake lock**: a 60 s hold won't normally hit auto-lock, but the reading wait can; request a screen wake lock from press until Review opens if testing shows the phone sleeping.
