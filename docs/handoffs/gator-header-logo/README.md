# Gator logo in the header — handoff package (2026-10-25)

- `HANDOFF.md` — the spec: mark, header layout (variant A), tap → refresh sequence, hook, copy, accessibility, tests.
- `prototype.html` — the interactive prototype. Open in a browser; it starts on the chosen variant (A, icon tile). The variant and theme switches, Pantry view and the fetch-length option are there to compare timings.
- `svg/gator-app-icon-static.svg` — the mark at rest (viewBox 0 0 200 200, 5.7 KB, ids suffixed `-app-icon`).
- `svg/gator-app-icon-tap.svg` — the same mark with the Tap animation inside (plays once, 0.9 s, ends at rest; respects reduced motion). Works in `<img>`, `<object>` or inline. Replay in an `<img>` by resetting `src` with a new query string.

The dark-theme rim (no drop shadow, light stroke on the head) is a CSS rule applied to the inline SVG, see HANDOFF §2; the files ship the light-theme look.
