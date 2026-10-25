# Gator · Soft clay — handoff (2026-10-25)

svg/
  gator-{pose}-static.svg   13 still drawings in the clay finish (no CSS inside)
  gator-{pose}-{variant}.svg  52 self-contained animated SVGs, CSS inside, amplitudes fixed at Balanced
    variants: idle (loops), sig (signature, loops), enter (plays once, 1.2–1.3 s, ends at rest), tap (plays once, 0.9 s)
    poses: shopping, icon, talking, happy, proud, listening, thinking, listkeeper, worried, curious, dapper, hmm, chef

preview.html   the "Gator in Clay" page, all 13 with the variant controls (needs network for the fonts only)
HANDOFF.md     what the finish adds to each file, exact gradient stops, shading shapes, filter, dark-mode rule

Usage
- Drop the animated file in an <img> or inline it. Entrance → Signature on the Listening card and Entrance → Idle on Launch
  are done by swapping files (or inlining and changing data-v on the root <svg> between "enter", "idle", "sig", "tap").
- Every animated file respects prefers-reduced-motion (stays still).
- On the dark-green #1F3A2A disc the drop shadow disappears: replace the claySoft filter with a light rim (see HANDOFF.md).
- Under 32 px use the Lit flat variant (not in this zip; still to be drawn).
