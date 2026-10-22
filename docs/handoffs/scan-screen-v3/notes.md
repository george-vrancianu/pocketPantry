# Scan screen redesign — prototype notes

## Round 3 (2026-10-22) — iPhone-style camera
Prototype: https://claude.ai/artifact/JKda641iQ2zBhryANgFuKC (source: `prototype.html` in this folder)

Decisions (user answers):
- **Shutter only.** Double-tap on the guide is removed; corner brackets are only a framing aid. Space key also shoots on desktop.
- **Shutter row (iOS layout):** left = photo stack (last 3 Scans fanned, count badge: amber + spinner while any is reading, green once all read; tap opens Review). This replaces the left Scan column AND the Done button. Right (iOS flip-camera slot) = **Import from photos**: 50 pt glass circle with a photo icon and a 20 pt accent "+" badge at the top-right, so it reads as importing, not as a gallery page. Adds library photos to the Scan Session in the current mode, read in the background like camera Scans (SPEC gallery behaviour unchanged; still the path when camera permission is denied). A first version dropped this button as redundant with the stack; it came back once it was clear it imports photos rather than showing them.
- **Modes:** the same 4, as text labels in caps: RECEIPT · PRODUCT · INGREDIENTS · PLATE. Selected label centred in cam-accent green, others cam-dim, strip fades at the edges.
- **Review:** after the last card, two dashed buttons side by side: "Take more" (back to the camera, Scan Session intact) and "Add from photos" (same import, stays in Review; new cards appear as reading).

Layout:
- Feed is full-bleed behind both bars. Top and bottom bars are glass: `cam-glass` rgba(20,22,20,.55) + blur 14.
- Top bar: Close (left). Right: torch (yellow `cam-warn` when on), Scan Language chip (globe + EN/RO/DA, opens a small menu; hidden in Plate), Info.
- Footer, top to bottom: shutter row (104 pt; shutter 78 pt white ring, 62 pt disc, scales to 0.88 when pressed), mode slider (40 pt), home indicator (34 pt).
- Small zoom pill (1× / 2) floats just above the footer, iOS-style.
- Guide is now centred in the clear area between the bars (not at 46 % of screen height) and sized as a fraction of that area: Receipt .56w × .78h, Product .62 × .56, Ingredients .88 × .50, Plate .80 × .60.

Behaviour:
- Mode change: swipe on the slider or the viewfinder (10 pt threshold, 35 % rubber band, quick flick = one step), tap a label, ←/→. Guide morphs over 400 ms, 6 ms haptic, screen-reader announcement.
- Capture: same flash/fill/pulse/12 ms haptic as before, then the cropped photo flies into the stack (460 ms) and the stack pops. Shutter disabled while a photo is prepared.
- Review: cards, Add to pantry waits on reads, Discard all, plus Take more / Add from photos at the end of the list.

Spec impact: see `spec-amendments.md`. Double-tap capture, Scan column, top-bar Done and the gallery button's position all change; the screen-reader "Capture" fallback is no longer needed since the shutter is a real button.

### Handoff (2026-10-22)
- Packaged as `scan-screen-v3/` (handoff.md, spec-amendments.md, prototype.html, icons-additions.ts, notes.md, 16 screenshots).
- Decided in the handoff: retrying a failed read moves from the (removed) thumbnail to a "Read again" button on the failed Review card; the stack badge shows amber "!" while any Scan has failed; Review "Add from photos" uses the last-used Scan Mode; zoom pill only where the track supports `zoom`.
- Prototype fix: sheets focus with `preventScroll` so the camera root doesn't scroll while a sheet slides in.

### Design review (2026-10-22, grilling against the glossary, ADRs and code)
- Barcode stays on the slider. Order: RECEIPT · INGREDIENTS · PRODUCT · BARCODE · PLATE. The slider picks camera modes, not Scan Modes.
- Hold-to-focus (ADR 0015) moves from the dial to the shutter: a tap scans, a hold focuses and scans on release.
- A language pick overrides the Scan Language for the Scan Session and is not saved (ADR 0022). It survives Review → Take more and is used by Add from photos. Fixed order EN/RO/DA. Blocked by #473.
- The add-Batch camera gets the same chrome (no stack).
- Viewfinder swipe stays, behind a flag. Zoom is deferred to a follow-up.
- In Barcode: a non-interactive ring replaces the shutter, guide 0.80 × 0.30, Import and the chip hidden, frozen frames fly to the stack.
- Add from photos falls back to Product when the last-used mode is Barcode.
- The stack badge counts every card. The label names photos and barcodes, never "items".
- A failed Barcode card offers "Look up again" in Review, for retryable errors only.
- Delivery: a prefactor of the shared camera chrome first (part of #427). #468/#473 are updated for the per-Session override.

## Round 2 (2026-10-10) — decision: Variant B with an icon dial
Prototype: https://claude.ai/artifact/JaaiVPD2ZjipkGp8oBM33i

- Mode picker is an iPhone-camera-style dial at the bottom: icons only, selected icon centred inside an accent ring with its name in caps above it; neighbours dimmed and scaled to 0.82; strip fades at both edges.
- Swipe left/right on the dial or on the viewfinder scrolls the strip live and snaps to the nearest icon on release; a quick flick advances exactly one step; rubber-band at the ends; tap any icon to jump; ←/→ keys on desktop. 6 ms haptic on mode change.
- Guides morph to the new mode in 400 ms so the swipe is visible in the frame.
- Done moved top-right beside the info button so the bottom belongs to the dial. Queue is a vertical column on the left; each thumbnail carries its mode icon, spinner → green check.
- Double-tap capture, flash, review screen, amber "still reading" badge unchanged from round 1.

## Round 1 (2026-10-09)
Prototype artifact (3 variants): https://claude.ai/artifact/6SWDF5oC15VZqG3kKGmRTb

### Requirements agreed
- Mobile: full-screen camera, no scrolling.
- Help text hidden behind a subtle "i" button (bottom sheet).
- Scan modes: Receipt / Barcode / Label / Shelf.
- Capture = double-tap inside the positioning guides; guides flash (corners thicken to white, brief white fill + short full-screen flash, shutter scale pulse, 12 ms haptic).
- Guides change shape per mode (receipt tall, barcode wide strip with scan line, label square-ish, shelf wide).
- Photos go into a non-blocking queue with thumbnails + spinner → check when read.
- "Done" opens a review screen that gathers every result; items still reading show a spinner and "Add to pantry" waits for them. Each card can be removed.

### Variants shown
- A · Side rail: modes right edge, queue filmstrip bottom-left, Done bottom-right.
- B · Dial: modes at the bottom, queue column top-left, Done top-right. **Chosen.**
- C · Fused stack: icon rail left, photo pile welded to the Review button.

## Open questions (round 2)
- Should swiping on the viewfinder stay enabled, or only on the dial (risk of accidental mode change while framing)?
- Auto-hide the queue column while the finger is down?
- Long receipts: two-part capture flow not designed yet.
