# Scan screen v3 (iPhone-style camera) — design handoff

Status: approved, ready for implementation. Date: 2026-10-22.
Reference prototype: `prototype.html` in this folder (self-contained, open in a browser; live at https://claude.ai/artifact/JKda641iQ2zBhryANgFuKC). It is the source of truth for look, timing and gesture feel; the numbers below are copied from it. The prototype shows Review as a sheet for convenience; in the app it stays the `/scan/review` page (§7).

This **amends `scan-screen/`** (2026-10-10). Everything not mentioned here (Scan Session, reads, Plate picks, Scan Cap, receipt crop, 20-Scan limit, line editor, Add all / Discard all) is unchanged. `spec-amendments.md` has replacement text for the SPEC.md Scan screen bullets.

**Revised after the design review (2026-10-22, see `notes.md`):** five camera modes (Barcode kept, Ingredients moved second), shutter hold-to-focus (ADR 0015), a Scan Language override for the Scan Session instead of saving (ADR 0022), Barcode on the shutter row (§5.5), the add-Batch camera gets the same chrome (§13), and the zoom pill is deferred. Where this file and the prototype disagree, this file wins.

Files in this folder:

| File | What it is |
|---|---|
| `handoff.md` | This spec |
| `prototype.html` | Interactive reference |
| `spec-amendments.md` | Drop-in replacement text for the SPEC.md bullets this changes |
| `notes.md` | Design notes and decision log (rounds 1–3) |
| `icons-additions.ts` | Icons the screen needs that `packages/ui` may not export yet (§10) |
| `screenshots/` | 16 PNGs (390 × 844 unless named; fonts fall back to system faces in the captures) |

Screenshots: `01-receipt-rest-reading`, `02-product`, `03-ingredients`, `04-plate-no-language-chip`, `05-swiping-modes`, `06-torch-on`, `07-language-menu`, `08-capture-flash`, `09-capture-flying-to-stack`, `10-stack-all-read`, `11-info-sheet`, `12-imported-toast`, `13-review-reading`, `14-review-end-take-more-add-from-photos`, `15-stack-empty`, `16-narrow-360pt`.

Tokens: the existing `cam-*` palette (unchanged, in `pages/Scan/components/glass.ts`). Sizes in pt = CSS px. The screen stays always-dark.

Delivery order: first a prefactor that extracts the shared camera chrome (`CameraTopBar`, `ModeSlider`, `ShutterButton`, footer shell) for both `ScanPage` and `CameraOverlay` (part of #427); the language menu (§2.3) waits for #473.

Code touched (proposed), all in `apps/web/src/pages/Scan/`:
- `components/ModeDial.tsx` → becomes the text mode slider (§4). Keep the file or rename to `ModeSlider.tsx`.
- `components/SessionStrip.tsx` → replaced by a new `components/PhotoStack.tsx` (§5.2).
- new `components/ShutterButton.tsx`, `components/ImportButton.tsx`, `components/CameraFooter.tsx`, `components/CameraTopBar.tsx`.
- `components/Viewfinder.tsx` → guide is no longer a button; double-tap removed; guide geometry per §3.
- `components/ScanLanguageChip.tsx` → opens a menu instead of cycling (§2.3).
- `CameraOverlay.tsx` (add-Batch camera) → same chrome, Product + Barcode only (§13).
- `hooks/useScanScreen.ts` → capture from the shutter; import moved; Done removed.
- `pages/Review/…` overview → end-of-list actions (§7).
- Tests: `ScanDoubleTap.test.tsx` is retired; `ScanDial*.test.tsx`, `ScanGuides`, `ScanGallery`, `ScanShell`, `ScanLanguageChip` need updating (§11).

---

## 1. Summary of the change

| Was (v2) | Now (v3) |
|---|---|
| Top bar: Close + torch left; language chip, Info, gallery, Done right | Top bar on glass: Close left; torch, language chip, Info right |
| Icon dial with ring, name above the selected icon | Text mode slider at the very bottom: RECEIPT · INGREDIENTS · PRODUCT · BARCODE · PLATE |
| No shutter; double-tap the guide, or double-tap / hold the dial | Round shutter button above the slider: tap scans, hold focuses then scans on release. **Double-tap removed** |
| Scan column down the left edge | Photo stack left of the shutter (last 3 Scans fanned + count badge) |
| Done in the top bar | Tap the photo stack → `/scan/review` |
| Gallery button in the top bar | Import button right of the shutter (photo icon + green "+") |
| Guide centred at 46 % of the screen | Guide centred in the clear area between the two bars |
| — | 1× / 2 zoom pill above the footer: **deferred** to a follow-up (§3.3) |
| — | Review overview ends with "Take more" and "Add from photos" |

## 2. Top bar

### 2.1 Bar
- `position: absolute; top: 0; left: 0; right: 0`, z above the feed and guide.
- Background `cam-glass` rgba(20,22,20,.55) + `backdrop-filter: blur(14px) saturate(1.2)`; bottom border 1 pt rgba(255,255,255,.06).
- `padding-top: env(safe-area-inset-top)`; content row 52 pt tall, padding 0 12, `space-between`.
- The feed runs **under** the bar (full-bleed), so the bar is see-through.

### 2.2 Controls
- **Left:** Close, 40 pt round hit area, × icon 22 pt, stroke 1.9, `cam-fg`, no fill. Pressed: rgba(255,255,255,.12) fill. Behaviour unchanged (asks "Discard N photos?" when the Scan Session has Scans).
- **Right**, gap 4, in this order:
  1. **Torch**: 40 pt, bolt icon 22 pt outline. On: icon filled and stroked `cam-warn` #ffcf5a. `aria-pressed`, `aria-label` "Torch on / off". Hidden when the track has no torch (unchanged).
  2. **Scan Language chip**: 28 pt tall pill, min-width 44, padding 0 10, margin 0 4, 1.5 pt border rgba(244,244,240,.75), globe icon 13 pt + code 12.5/800, letter-spacing .06 em. Opens the menu (§2.3). Hidden in Plate and Barcode, which have no Scan Language (fades out 200 ms, removed from tab order). Locked while a photo is being prepared (unchanged).
  3. **Info**: 40 pt, "i in a circle" 22 pt outline. Opens the Info sheet (§8).
- All icon buttons are transparent (no circle backgrounds); the glass bar gives contrast.

### 2.3 Language menu
- Popover under the chip, right-aligned to it (prototype: top 100, right 56), min-width 150, `cam-glass-strong` + blur 18, 1 pt rgba(255,255,255,.12) border, radius 16, padding 6. Opens with scale .92 → 1 + fade, 180 ms, origin top-right.
- `role="menu"`, items `menuitemradio`: **English / Română / Dansk** in this fixed order, in their own names (`lang` attribute), 14/600, code on the right 11/800 `cam-dim`, the current code in `cam-accent`. Item padding 10 12, radius 10, hover rgba(255,255,255,.07).
- The chip starts at the Member's Scan Language Preference (#473). Picking **overrides it for the rest of the Scan Session** and does not change the Preference (ADR 0022). Then the menu closes, focus returns to the chip, and a toast reads "Reading in Română". The override survives going to Review and back ("Take more"), applies to Review's "Add from photos", and is dropped when the Scan Session ends (Close, Discard all, Add all). Escape or a tap outside closes. Opening focuses the checked item.
- Blocked by #473 (Scan Language as a Member Preference). Until then, ship the chip as it is.

## 3. Viewfinder and guide

### 3.1 Clear area
The **clear area** is the part of the screen between the bottom of the top bar and the top of the footer:
`top = safe-top + 52`, `bottom = screenHeight − (max(safe-bottom, 20) + 104 + 40)` (the 20 pt floor is a §12 decision).

### 3.2 Guide
- Same four L-shaped brackets as v2 (30 pt arms, 3.5 pt stroke, 10 pt outer radius, white 92 %, drop-shadow 0 1 3 rgba(0,0,0,.35)).
- Centred horizontally; vertical centre at `clear.top + (clear.height − 28) / 2` (14 pt above the middle, leaving room for the zoom pill).
- Size = fraction of **screen width** × fraction of **clear-area height**:

| Mode | w | h |
|---|---|---|
| Receipt | 0.56 | 0.78 |
| Product | 0.62 | 0.56 |
| Ingredients | 0.88 | 0.50 |
| Plate | 0.80 | 0.60 |
| Barcode | 0.80 | 0.30 |

- Morphs over 400 ms `cubic-bezier(.3,.7,.2,1)` on mode change; none under reduced motion.
- While the mode slider is being dragged the guide scales to .985.
- **The guide is no longer interactive**: not a button, not focusable, `pointer-events: none`. Double-tap, Enter/Space on the guide and the "armed" press colour are removed.
- The receipt crop still maps the guide rect through the feed's cover scaling (unchanged; the rect is now computed from §3.2).

### 3.3 Zoom pill (deferred)
**Not in this delivery**; tracked as a follow-up issue. Spec kept for it:
- Centred, `top = clear.bottom − 50`. Pill with 3 pt padding, gap 4, rgba(0,0,0,.28); two 32 pt round buttons rgba(0,0,0,.35), 11.5/800: "1×" and "2". Selected one: 38 pt wide, text `cam-accent`. `aria-pressed`.
- Sets `MediaStreamTrack.applyConstraints({ advanced: [{ zoom }] })` with 1 and 2 (clamped to the track's `zoom` capability). **Hide the pill when the track has no zoom capability.** Do not fall back to a digital crop (the receipt crop would no longer match).

## 4. Mode slider

- Last row of the footer, 40 pt tall, full width, `overflow: hidden`, mask `linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)` so the edges fade.
- Strip: horizontal flex, gap 26, the labels **RECEIPT · INGREDIENTS · PRODUCT · BARCODE · PLATE** (from i18n, uppercased with `text-transform`, not in the string), 13/800, letter-spacing .09 em, padding 8 0.
  - Selected: `cam-accent` #9be38f. Others: `cam-dim`. Colour transition 200 ms.
  - The strip is translated so the **selected label's centre** sits at the horizontal centre of the screen. Measure label centres after fonts load (labels differ in width and in each locale).
- The slider picks a **camera mode**: the four Scan Modes plus Barcode, which is not a Scan Mode (ADR 0016). Barcode stays right after Product. The order lives in `CAMERA_MODES`.
- `role="radiogroup"` `aria-label="Scan mode"`, each label `role="radio"`, `aria-checked`, roving tabindex.
- **Gestures** (same numbers as v2's dial, now applied to the slider):
  - Drag on the slider **or the viewfinder** (anywhere except the top bar, the shutter row and open sheets): starts after 10 pt of mostly horizontal travel (|dx| > 1.3 × |dy|); the strip follows the finger 1:1; past either end at 35 %.
  - Release: settle on the label whose centre is nearest the middle; a quick flick (< 250 ms, 18–80 pt) moves exactly one step. Settle animation 300 ms `cubic-bezier(.25,.8,.25,1)`, none under reduced motion.
  - A click right after a drag is ignored (as v2).
- Tap a label, or ←/→ (not while a sheet or the language menu is open, or focus is in a field): change mode, stopping at the ends.
- On change: 6 ms haptic, live-region announcement "Product mode", guide morph, language chip hide/show for Plate and Barcode, Import hide/show for Barcode, shutter ↔ Barcode ring (§5.5). Changing mode also forgets the last accepted barcode (ADR 0016). Last-used mode and `?mode=` rules unchanged.

## 5. Footer

### 5.1 Bar
- `position: absolute; bottom: 0; left: 0; right: 0`, same glass as the top bar, top border 1 pt rgba(255,255,255,.06), `padding-bottom: max(env(safe-area-inset-bottom), 20px)` (34 pt on the reference phone; at least 20 pt, §12).
- Top to bottom: **shutter row** (104 pt) → **mode slider** (40 pt) → safe area (at least 20 pt).
- Shutter row: CSS grid `1fr auto 1fr`, `align-items: center`, padding 0 30. Left cell: photo stack (justify start). Centre: shutter. Right cell: import (justify end).

### 5.2 Photo stack (replaces the Scan column and Done)
- 54 × 54 box.
- **Empty Scan Session:** 1.5 pt dashed rgba(255,255,255,.3) rounded square (radius 12), `aria-disabled`, does nothing.
- **With Scans:** up to the last 3 Scans as layers, newest on top: each layer radius 12, 2 pt rgba(255,255,255,.85) border, the photo `cover`. Second layer rotated 6° and shifted +3 pt x, 85 % opacity; third rotated −8°, shifted −3 / +1 pt, 75 %. New top layer pops in (scale .6 → 1, 350 ms `cubic-bezier(.3,1.6,.5,1)`).
- **Badge** at top −7, right −9: min 22 × 22, radius 11, padding 0 6, 12/800 `tabular-nums`, ring 0 0 0 2 rgba(20,22,20,.9). Number = **cards** in the Scan Session: Scans and Barcode Lookups, the same count as the 20-card limit (a merged receipt still counts each Scan).
  | State (first match wins) | Badge |
  |---|---|
  | any Scan waiting or being read | `cam-warn` fill, `cam-accent-ink` text, 9 pt spinner before the number |
  | any gallery receipt still needs crop | `cam-warn`, no spinner |
  | any Scan failed | `cam-warn`, "!" before the number |
  | all read | `cam-accent` fill, `cam-accent-ink` text |
- Tap → `/scan/review` (works while reads run, as Done did). `aria-label` built from parts: "Review 3 photos and 2 barcodes, 1 still reading" / "…, all read" / "…, 1 couldn't be read"; the barcode part is left out when there are none, the photo part when there are no photos. Never "items" (Shopping Item).
- **Retry moved:** with no thumbnails on the camera, a failed read or lookup is retried from its card in Review (§7.2).

### 5.3 Shutter
- 78 pt circle, 4 pt white border, inner white disc 62 pt. Pressed: disc scales to .88 and turns #e9ebe6, 120 ms.
- `button`, `aria-label` "Take photo". Disabled (`aria-disabled`, disc 55 % white) while a photo is being prepared, while the camera is not ready, at the 20-Scan limit, and while the Scan Cap blocks scanning; a press then shows the same toast the limit/cap shows today.
- Enter/Space activate it like any button. Optional desktop shortcut: Space when focus is on no control.
- **Hold to focus (ADR 0015, moved from the dial):** a tap scans at once. Holding the shutter (300 ms, 10 pt slop) runs the best-effort focus pass, and letting go scans. The pressed look stays on while it is held. Without `single-shot` focus, the hold is the ~400 ms steady pause, as today. Cancelling the hold (sliding off) takes no Scan and puts focus back to `continuous`.
- **Capture feedback** (unchanged numbers, now triggered by the shutter): screen flash 55 % → 0 over 280 ms; guide fill 85 % → 0 over 420 ms; brackets to 6 pt for 300 ms; guide pulse to .965 over 360 ms; 12 ms haptic. Reduced motion: no flash/fill/pulse; brackets and haptic remain.
- **Fly to stack:** the cropped photo is drawn at the guide rect and animated to the stack's rect (translate + scale, radius 10 → 40, 460 ms `cubic-bezier(.5,0,.2,1)`), then removed and the stack pops. The Scan joins the Scan Session at shutter time (don't wait for the animation). No fly under reduced motion.
- The screen-reader "Capture" fallback from v2 §10 is no longer needed.

### 5.4 Import
- 50 pt circle, rgba(255,255,255,.14) fill, photo icon 24 pt (stroke 1.9) in `cam-fg`.
- **"+" badge**: 20 pt circle at top −3, right −3, `cam-accent` fill, 2 pt rgba(20,22,20,.9) ring, plus 12 pt stroke 2.4 in `cam-accent-ink`. It must read as "add photos", not "open a gallery".
- `aria-label` "Import from photos". Opens the file picker (`accept="image/*"`, `multiple`). Behaviour is the v2 gallery button's: one Scan per file, in the current Scan Mode, read in the background, Member stays on the camera, works with camera permission denied, receipts need crop in Review, 20-Scan cap. Toast "2 photos added · Receipt".
- When camera permission is denied, the import button is the main action: keep it fully visible and enabled while the shutter is disabled.
- **Hidden in Barcode** (fades out 200 ms, removed from tab order; the grid cell stays, so the shutter does not move), as the gallery button is today.

### 5.5 Barcode on the shutter row
- Barcode reads continuously (ADR 0016), so there is nothing to shoot. The shutter turns into a **non-interactive ring**: the same 78 pt white ring with no disc and a 28 pt barcode glyph (the dial's barcode icon) in `cam-fg`, `aria-hidden`, not focusable. Crossfade 200 ms with the shutter.
- Each accepted code keeps ADR 0016's haptic and live-region announcement, and its frozen frame does the §5.3 **fly to stack** from the Barcode guide rect (none under reduced motion). No flash.
- The Scan Cap does not affect Barcode; the 20-card limit does (same message).

## 6. Feed
- Aspect-filled, full-bleed behind both bars; radial vignette unchanged (transparent → 42 % black, centred 50 % / 46 %).

## 7. Review overview (`/scan/review`)

### 7.1 End-of-list actions (new)
- After the last card, inside the scrolling list: a row of two equal buttons, grid `1fr 1fr`, gap 10.
- Each: min-height 56, radius 16, 1.5 pt dashed rgba(255,255,255,.22), transparent, `cam-accent` text 14/800, icon 20 pt + gap 9, centred. Hover/pressed rgba(255,255,255,.04).
  - **Take more** (camera-plus icon): goes to `/scan` with the Scan Session intact (same as the header Camera link).
  - **Add from photos** (photo icon with a "+" outside its top-right corner): opens the file picker; files join the Scan Session in the **last-used camera mode if it is a Scan Mode, otherwise Product** (when it is Barcode), read in the Session's Scan Language (with its override), and appear as new cards at the end, "Reading photo…". The Member stays on Review. Same limits and crop rules as §5.4.
- The header "Camera" link stays.
- Shown whenever the Scan Session is not empty (the overview redirects to `/scan` when it is).

### 7.2 Retry from Review (moved from the camera)
- A failed card whose error a retry can change gets a **"Read again"** button next to "Retake" (reads the same photo again; same as tapping the failed thumbnail did in v2). Cards for errors a retry cannot change keep only Remove/Retake.
- A failed **Barcode card** gets **"Look up again"** for errors a retry can change (network, Lookup Limit). A code that was not found already gives a card with one empty line and needs no retry.

## 8. Info sheet
Content updated for the shutter. Title "Scanning your pantry"; intro "Pick a mode, frame it inside the corners, tap the shutter."; the five camera modes in slider order, Barcode with "Point at a barcode; each one is added on its own", the other four (copy in the prototype, Plate in wave 1 wording per SPEC Further Notes); tip "Every photo is read in the background. Keep shooting, then tap the stack at the bottom left to review everything at once." Button "Got it". Focus handling unchanged. **Implementation note:** focus the sheet with `focus({ preventScroll: true })`, otherwise browsers scroll the `overflow: hidden` camera root while the sheet is still off-screen.

## 9. Strings (`scan.json`, en; new or changed)
`modes.receipt` "Receipt", `modes.ingredients` "Ingredients", `modes.product` "Product", `modes.barcode` "Barcode", `modes.plate` "Plate" (shown uppercased),
`shutter.label` "Take photo",
`stack.empty` "No photos yet", `stack.label_one/other` "Review {{count}} photo(s)", `stack.labelBarcodes_one/other` "Review {{count}} barcode(s)", `stack.labelBoth` "Review {{photos}} and {{barcodes}}", `stack.reading` "{{count}} still reading", `stack.allRead` "all read", `stack.failed` "{{count}} couldn't be read", `stack.needsCrop` "{{count}} receipt(s) to crop",
`import.label` "Import from photos", `import.added_one/other` "{{count}} photo(s) added · {{mode}}",
`torch.on` "Torch on", `torch.off` "Torch off",
`language.read` "Reading in {{language}}",
(`zoom.label` "Zoom" comes with the zoom follow-up.)
`info.intro` "Pick a mode, frame it inside the corners, tap the shutter.", `info.tip` "Every photo is read in the background. Keep shooting, then tap the stack at the bottom left to review everything at once.", `info.ok` "Got it",
`review.takeMore` "Take more", `review.addFromPhotos` "Add from photos", `review.readAgain` "Read again", `review.lookUpAgain` "Look up again", `info.barcode` (copy in §8).
Remove: `done.*`, the double-tap hint strings, the screen-reader capture fallback string. Ro and Da need `few` plurals where `_one/_other` appear.

## 10. Icons
`icons-additions.ts` lists the lucide icons to add if `packages/ui` doesn't export them yet: `ZapIcon` (torch), `GlobeIcon` (language chip), `InfoIcon`, `ImageIcon` (import button), `ImagePlusIcon` (Review "Add from photos"), `CameraIcon` with a plus overlay or lucide `Camera` (Review "Take more"). Existing: `CloseIcon`, `PlusIcon`.

## 11. Tests
- Retire `ScanDoubleTap.test.tsx`.
- Shutter: click takes a Scan (Scan Session +1, stack shows it); disabled while preparing, camera not ready, at 20 cards, under the Scan Cap; Enter/Space activate it. Hold runs the focus pass and scans on release; cancelling takes no Scan and restores `continuous` (move the ADR 0015 cases from `ScanDialScan`).
- Barcode: the shutter is a non-interactive ring; the language chip and Import are hidden; accepted codes still add cards under the Scan Cap.
- Guide: not focusable, double-tap does nothing; size and centre follow §3.2 per mode.
- Mode slider: tap, ←/→, drag past threshold, flick one step, rubber band at the ends, click-after-drag ignored, radio semantics, order RECEIPT · INGREDIENTS · PRODUCT · BARCODE · PLATE, Plate and Barcode hide the language chip.
- Stack: empty is disabled; badge counts Scans and Barcode cards; label names photos and barcodes; the four states in §5.2 order; tap navigates to `/scan/review` with reads running.
- Import: picks several files, one Scan each in the current mode, toast; works with camera denied; receipts marked needs-crop.
- Language menu: opens, picks, overrides for the Scan Session without saving the Preference, survives Review → Take more, Escape closes, focus returns.
- Review: Take more → `/scan` with the session intact; Add from photos adds cards at the end in the last-used Scan Mode (Product after Barcode); Read again / Look up again on retryable failed cards only.
- Add-Batch camera: v3 chrome, two labels, empty stack cell (§13).
- Reduced motion: no flash/fill/pulse/fly/settle animations.

## 12. Settled questions
- **Swipe on the viewfinder** stays. Put it behind one flag so it can be limited to the slider if device testing shows accidental mode changes while framing.
- **Zoom** is deferred to a follow-up issue.
- **Stack badge with several states at once** follows the order in §5.2. Still check how it reads with a failed Scan and reads still running.
- **Room under the mode slider** (2026-10-24): the footer's bottom padding is at least 20 pt (`FOOTER_MIN_BOTTOM`), because with no safe area the slider sat on the screen's edge. It is a floor, not added to a home indicator's inset; the clear area (§3.1) uses the same floor.

## 13. Add-Batch camera (`CameraOverlay`)
- The camera the add-Batch form opens for Prefill (`FORM_CAMERA_MODES`: Product, Barcode) gets the same chrome: glass top bar (Close, torch, language chip in Product, Info), the shutter (hold to focus) and the slider with its two labels, and the Barcode ring.
- It has no Scan Session, so the stack cell on the left stays empty. The right cell keeps the overlay's current gallery option, if any. A Scan or a read code closes the overlay as today.
