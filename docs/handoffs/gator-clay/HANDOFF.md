# Gator · Soft clay finish — developer handoff (2026-10-25)

**Decision:** Gator ships in the **Soft clay** finish everywhere in the app. Under 32 px (Dock capsule, Watch, 24 px glyph) use the Lit flat variant (hard shade shape, no gradients or blur; still to be drawn). The Glossy vinyl option was not chosen.

## Light rule
One key light, top left (10 o'clock). Highlights on the crown, the top of each hat puff and the upper rim of the eyes; darkest under the jaw and on the far side of the snout. Teeth, mouth line, sound arcs, sparkles, thought dots, the sweat drop and blush stay flat: they are signals, not surfaces.

## What the finish adds to each SVG (additive, rig untouched)
- `<defs>` per file, ids suffixed with the pose key (`-happy`, `-chef`, …) so several can be inlined on one screen:
  - `clayBody` radial, cx 32 % cy 28 % r 82 %: #8CC65F → #6FAE48 (55 %) → #56923A
  - `clayBelly` radial, cx 40 % cy 20 % r 90 %: #F4EFCB → #E8E2B0 (70 %) → #D3CB93
  - `claySocket` radial, cx 35 % cy 30 % r 80 %: #78B64F → #528B37 (eye sockets, spikes, tail, feet)
  - `clayHat` radial: #FFFFFF → #F6F1E6 (70 %) → #E4DCCB; hat outline #D9D0BE (was #CFC6B4); `clayBand` linear #F8F3E8 → #E6DECD
  - `clayEye` radial #FFFFFF → #E5E6DA; `clayPupil` radial #4A5A33 → #1F2914; extra glint 1.4 px at (96,50)
  - `claySoft`: `feDropShadow dx 0 dy 6 stdDeviation 5 #2B2418 @ 22 %`; `blur6`, `blur3` Gaussian blurs
  - clip paths: `clipBody` (head silhouette), `clipHat`, `clipJaw` (talking), `clipTorso` (shopping, chef, list keeper)
  - icon only: `tileClay` linear #6C7D37 → #4F5D25 plus a 3 px white stroke at 14 % inset 1.5 px
- Fill swaps: #6FAE48 → clayBody, #E8E2B0 → clayBelly, #5E9A3C → claySocket, eye whites → clayEye, pupils → clayPupil, hat white → clayHat, band → clayBand. Strokes keep their hex.
- Shading shapes inserted right after the head path, clipped to `clipBody`, so they move with `.head`: jaw occlusion `ellipse 140,140 rx 92 ry 16 #2F5A22 @ 42 % blur6`; far-snout `ellipse 200,100 rx 30 ry 34 @ 18 % blur6`; crown sheen `ellipse 78,58 rx 42 ry 22 white @ 16 % blur6`. Hat fold `ellipse 66,38 rx 30 ry 7 #B9AE98 @ 45 % blur3` clipped to the hat. Talking: occlusion goes on the lower jaw (`ellipse 130,146`). Full-body poses: `ellipse` under the head on the torso, #2F5A22 @ 30 %.
- `filter="url(#claySoft-…)"` on `.rig` (on `.head` for the icon, so the tile stays flat). ViewBox grows 8 units each side and 14 at the bottom.

## Motion
No change to the rig or the keyframes: gradients use objectBoundingBox so they follow breathe, hop and squash; the filter sits on the animated group. The 52 animated files in `svg/` carry the motion CSS inside, with `--amp:1` (Balanced) and `--t:1`. Entrance and Tap play once and end at rest; Idle and Signature loop. Budget note: one feDropShadow + two blurred ellipses per Gator; keep one animated Gator per screen (already the rule).

## Dark mode
On #1F3A2A the drop shadow vanishes. Replace `claySoft` with a light rim: body path stroked #9FD36A, 2.5 px, 35 % opacity. Gradients stay as they are.

## Open
- Draw the Lit flat variant for < 32 px (one shade shape #558F3A on the lower body and hat, light patch #8CC65F on the crown, thin contact shadow).
- Update the Chosen-designs canvas and the in-app prototypes with the clay files.
