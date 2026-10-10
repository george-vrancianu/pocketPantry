# Scan screen — design handoff

Status: approved design, ready for implementation. Date: 2026-10-10.
Reference prototype: `docs/handoffs/scan-screen/scan-dial-prototype.html` (self-contained HTML, open in a browser; same file is live at https://claude.ai/artifact/JaaiVPD2ZjipkGp8oBM33i). The prototype is the source of truth for look, timing and gesture feel; the numbers below are copied from it.

## Decisions (2026-10-10)

Settled in a design review against the current app. **These override the body below wherever they conflict.** Terms follow `GLOSSARY.md`: a photo is a **Scan** (not a "capture"); the group of Scans taken before Done is a **Scan Session** (not a "batch" or "queue": Batch is a pantry purchase).

### Modes

- Keep the existing Scan Modes; no Barcode or Shelf mode. The handoff look maps onto them:

  | Scan Mode | Handoff look | Guides (w × h) | Hint |
  |---|---|---|---|
  | Receipt | Receipt | 0.52 × 0.64 | "Lay flat, double-tap to scan" |
  | Product | Label | 0.60 × 0.48 | "Frame the product and its date" |
  | Ingredients | Shelf | 0.88 × 0.42 | "Lay them out, fit them all in" |
  | Plate | new plate/fork icon | 0.80 × 0.50 | "Fit the whole plate" |

- Dial order Receipt, Product, Ingredients, Plate. Default is the last-used mode (stored locally), else Receipt. `?mode=` deep links keep working. No barcode scan line.

### Camera screen

- Mode swipe is on the **dial only**, not the viewfinder (answers the open question in §3).
- Top bar also holds a **torch** button (glass, next to Close; hidden when unsupported) and a **Scan Language chip** (EN/RO/DA) that applies to the next Scans and is stamped on each one; hidden for Plate.
- Use the app's fonts (no Manrope). The `cam-*` colours become an always-dark camera palette in `packages/ui` tokens.
- Request 1080p in every mode so the dial never restarts the stream. Receipt auto-crop and image prep run in the background read, not before enqueue; thumbnails are a cheap crop to the guides.
- A gallery button in the dial area adds picked files to the Scan Session in the current mode (also the fallback when camera permission is denied). `ReceiptCropper` runs in Review.
- Accessibility: browsers can't detect screen readers, so the guides are a focusable `role="button"` that scans on Space/Enter or screen-reader activation, instead of a separate Capture button.

### Scan Session

- Client-side and in-memory, over the existing synchronous `/scan/*` endpoints; no server jobs. Lost on reload. Close with Scans present asks "Discard N photos?".
- At most 20 Scans per Scan Session, 2 reads at a time. One automatic retry on network errors; tapping a failed thumbnail re-sends the same image.
- Hitting the **Scan Cap** is its own failure state ("Daily scan limit reached") and disables scanning.

### Review

- `/scan/review` is the card overview; tapping a card opens the existing line editor for that Scan at `/scan/review/:scanId`. Cards with low-confidence or unmatched lines show "Check N items". Leaving `/scan` pauses the camera; the "Camera" link returns without losing the Scan Session.
- Failed cards don't block "Add to pantry"; they have a ×, are dropped on Add and are not counted in the toast. "Retake" means remove the card and go back to the camera.
- Add commits **per card, in order**, through the existing endpoints (`/pantry/batches/bulk`, `/scan/receipt/confirm`). Saved cards leave; failed cards stay with their error.
- **Plate**: queued like the others; the dish picker lives on the card ("Pick the dish"). Plate token TTL goes to 60 min; if still expired, the card offers "Read again".
- **Receipt Sections** (§10 said long receipts are out of scope; they already exist): each receipt photo is its own card; "Merge with previous" joins adjacent receipt cards (≤ 10 sections, not while reading) into one Receipt Scan with lines merged and merchant/date from the first section; "Split" undoes it.

### Delivery

Vertical slices, each with its own tests and `docs/SPEC.md` update, tracked as GitHub issues. Gesture logic (dial snap/flick/rubber-band, double-tap detection) and the Scan Session reducer are pure functions with unit tests; gesture feel is checked by hand on a phone against the prototype. No feature flag.

Slices: #108 camera shell → #109 dial (tap/keyboard) → #110 dial gestures, #111 guides → #112 double-tap; #113 Scan Language chip (after #108); #114 Scan Session + Review overview (after #112) → #115 failures, #116 add/discard/limits, #117 Plate, #118 Receipt merge, #119 gallery import. Until #118 a long receipt is scanned as separate receipts; until #117 Plate keeps its old flow.

## 1. Summary of the change

The photo-taking screen becomes a full-screen, non-scrolling camera view. Capture is a double-tap inside the positioning guides. Photos are no longer processed synchronously: each capture is pushed to a background queue, shown as a thumbnail with a loading state, and all results are collected on a single Review screen when the user taps Done. Scan modes are picked with an iPhone-camera-style icon dial at the bottom. Help text is hidden behind an info button.

## 2. Screen layout (portrait, full screen, safe-area aware)

Z-order, bottom to top: camera feed → vignette → guides → queue column → dial → top bar → toast → info sheet → review screen.

| Region | Placement | Notes |
|---|---|---|
| Camera feed | fills the screen | no letterboxing; `aspect-fill` |
| Vignette | overlay, non-interactive | radial, transparent to 45 % black at edges, centred at 50 % / 45 % |
| Top bar | safe-area top + 16, 18 px side padding | left: Close (×); right: Info then Done, 8 px gap |
| Guides | centred horizontally, vertical centre at 46 % of screen height | size depends on mode (§4) |
| Queue column | left 14, top ≈ 118 (below top bar), vertical stack, 8 px gap | max height ≈ 400, fades out at the bottom (mask), newest at the bottom |
| Dial | pinned to bottom, 150 tall + safe-area bottom | gradient backdrop, transparent → 50 % black at 35 % → 80 % black |
| Toast | centred, 170 above bottom | transient messages |

Nothing on this screen scrolls. The info sheet and review screen are overlays.

### Top-bar controls

- Close: 40 px circle, glass background `rgba(20,22,20,.55)` + blur 14, 1 px border `rgba(255,255,255,.12)`, × icon 18 px.
- Info: same size, but brighter so it is visible over any feed: background `rgba(255,255,255,.22)`, border `rgba(255,255,255,.45)`, shadow `0 2 10 rgba(0,0,0,.35)`, "i in a circle" outline icon 21 px.
- Done: pill, white `#f4f4f0` on near-black text, 10 × 15 padding, 14 px/800 label "Done", leading count badge (20 px circle, black on white). Disabled (45 % opacity) when the queue is empty. Badge turns amber `#ffcf5a` while any photo is still being read, back to black when all are read.

## 3. Modes and the dial

Modes, in dial order: Receipt, Barcode, Label, Shelf. Icons only in the strip (see the SVGs in the prototype; 26 px, stroke 2.1, round caps).

Dial geometry (390 pt wide reference): items are 84 pt wide and 64 pt tall laid out in a horizontal strip; the selected item is centred under a 64 pt ring (2.5 pt accent border `#9be38f` + 6 pt halo at 14 % accent). Ring top is 58 pt from the top of the dial area. The mode name sits 28 pt from the top of the dial, centred, caps, 12.5 px / 800 / 0.14 em tracking, accent colour, with a text shadow. Edge fade: 24 % black-to-transparent gradient on each side over the strip.

Item states:
- selected: accent colour, scale 1, opacity 1
- others: foreground white, scale 0.82, opacity 0.75
- transitions 250 ms

Gesture model:
- **Horizontal drag** on the dial or on the viewfinder (anything that is not the top bar, queue, sheet or review) moves the strip 1:1 with the finger. Starts after 10 pt of movement with |dx| > |dy|. While dragging the ring scales to 0.94 and strip transitions are off.
- **Release**: snap to the nearest item (round(offset / 84)). If the release velocity is above 0.45 pt/ms and the finger travelled less than 0.6 of an item, treat as a flick and advance exactly one step in the flick direction. Snap animation 420 ms, `cubic-bezier(.2,.8,.2,1)`.
- **Overscroll**: rubber-band past the first/last item at 35 % of the finger displacement.
- **Tap** on any icon selects it directly. A tap that followed a drag is ignored.
- Keyboard (web only): ← / → change mode.
- On mode change: label animates in (320 ms fade/slide up 5 pt), light haptic (≈ 6 ms), guides morph to the new size (§4).
- Horizontal drag must not interfere with double-tap capture; a double-tap that follows a drag is ignored.

Open question for the implementer to flag, not decide: whether viewfinder swiping stays enabled in production or is restricted to the dial area (risk of accidental mode change while framing).

## 4. Positioning guides

Four L-shaped corner brackets (30 × 30, 3.5 pt white stroke, 10 pt outer radius, drop shadow) around an invisible rectangle. Sizes as a fraction of screen width × height:

| Mode | width | height | Extra |
|---|---|---|---|
| Receipt | 0.52 | 0.64 | — |
| Barcode | 0.74 | 0.18 | animated accent scan line, 1.6 s ease-in-out, 22 % → 78 % of the box height |
| Label | 0.60 | 0.48 | — |
| Shelf | 0.88 | 0.42 | — |

Morph between sizes: 400 ms, `cubic-bezier(.2,.8,.2,1)`.

Hint pill below the guides (12.5 px, glass background) until the first capture, then hidden. Per-mode text: "Lay flat, double-tap to capture" / "Fill the strip, double-tap" / "Frame the date or ingredients" / "Step back, fit the shelf".

While a finger is down on the guides the brackets turn accent green for 320 ms ("armed").

## 5. Capture gesture and feedback

- Trigger: two pointer-ups inside the guide rectangle within 320 ms and within 60 pt of each other. The single-tap does nothing.
- Feedback, all at once:
  1. Brackets go to 6 pt white for the duration of the flash.
  2. White fill inside the guides fades from 85 % to 0 over 420 ms.
  3. Full-screen white flash from 55 % to 0 over 280 ms.
  4. Shutter pulse: guides scale to 0.965 and back over 360 ms.
  5. Haptic ≈ 12 ms.
- Capture must never block: take the frame, enqueue, return to the viewfinder immediately. No preview/confirm step.

## 6. Queue

Each capture appends a thumbnail to the queue column: 46 × 60, 11 pt radius, 1.5 pt white-35 % border, crop of the captured frame, pop-in 350 ms with overshoot. The mode icon (12 px, white with shadow) sits at the top of each thumbnail.

States:
- reading: 35 % black scrim + 18 pt spinner (2.5 pt ring, 0.8 s).
- read: scrim removed, 16 pt accent check badge at the bottom-right.
- failed (not in prototype, must exist): amber badge with "!" and a retry on tap; failed photos appear in review with a "Couldn't read, retake" row.

The column holds the newest at the bottom; when it exceeds its height the top fades out (mask) and older items are still reachable in Review. Done's count badge reflects the queue length.

## 7. Review screen

Slides up from the bottom (380 ms). Header: "Review" + subtitle "N photos · M still reading" or "N photos · all read"; "Camera" link on the right returns to the viewfinder without losing the queue.

One card per photo, in capture order: 56 px thumbnail, mode eyebrow in accent caps, result line, item chips. A card still reading shows "Reading photo…" with a spinner instead of a remove button. Each read card has a × to remove it from the batch.

Footer: primary "Add to pantry" (disabled and labelled "Add to pantry (waiting on M)" while any card is still reading), then a ghost "Discard all". After adding or discarding, return to the camera with an empty queue and a toast ("Added results from N photos").

Result line examples by mode (for the result formatter): Receipt → "14 items · €43.20 · Mega Image" + first items as chips; Barcode → product name + storage chips; Label → "Greek yogurt · best before 18 Oct 2026" + allergen chips; Shelf → "9 items spotted on this shelf" + items.

## 8. Info sheet

Bottom sheet over a 45 % scrim, 28 pt top radius, dark `#161816`, grab handle. Content: title "Scanning your pantry", a two-column list of the four modes with one line each (copy in the prototype), and a tip box: "Swipe to change mode, double-tap the frame to shoot. Every photo is read in the background and everything lands in one review when you tap Done." Tap the scrim to dismiss.

## 9. Tokens

```
cam-fg          #f4f4f0
cam-dim         rgba(244,244,240,.62)
cam-glass       rgba(20,22,20,.55)   + backdrop blur 14
cam-glass-strong rgba(20,22,20,.82)
cam-accent      #9be38f
cam-accent-ink  #0c1a0f
cam-warn        #ffcf5a
review-bg       #121412, card #1c1f1c
font            Manrope (system-ui fallback); weights 600/700/800
```

The camera screen is always dark regardless of app theme.

## 10. Accessibility and edge cases

- Respect reduce-motion: drop the flash/shutter animations to an instant state change, keep the haptic.
- The dial items need accessible names (mode names); the selected state must be announced on change.
- Double-tap conflicts with screen-reader double-tap-to-activate: when a screen reader is running, expose a conventional "Capture" button in the dial area.
- Keep the camera running while the info sheet is open; pause it while Review is open.
- If a capture fails to enqueue (storage, permission), show a toast and do not add a thumbnail.
- Long receipts (two-part capture) are out of scope for this pass.
