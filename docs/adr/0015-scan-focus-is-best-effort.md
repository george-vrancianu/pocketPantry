# Focus before a Scan is best-effort

> Amended by Scan screen v3 (2026-10-22): the hold moved from the mode dial to the shutter. A tap on the shutter scans at once; holding it focuses, and letting go scans.

Holding the shutter focuses before the Scan is taken. Browsers differ on whether a page may ask the camera to focus, so we do what each one allows and never let focus block a Scan.

## Decision

- Where the video track's `getCapabilities().focusMode` includes `single-shot` (mostly Chrome on Android), a hold sets `pointsOfInterest` to the centre of the guide and runs one single-shot focus pass. It waits up to about 1 s, and afterwards always puts the camera back to `continuous`, including when the hold is cancelled.
- Everywhere else, including iOS Safari, the hold is a steady pause of about 400 ms before the Scan. Nothing is focused, which is why holding looks like it does nothing on an iPhone.
- Support is detected from the track's capabilities, the same way as `torchSupported`.
- A Scan is always sent once the timeout runs out. A focus failure or a refused constraint never blocks it.

## Considered Options

- **Require real focus control and hide the hold where it is missing.** This would leave iOS without the gesture; the pause still gives a steadier frame.
- **Tap-to-focus on the guide for every browser.** No such API exists outside `single-shot` and `pointsOfInterest`.

## Consequences

- The hold behaves the same everywhere; only whether the camera visibly refocuses differs.
- `applyConstraints` resolving does not prove the lens settled, so the 1 s ceiling is a bound, not a promise of sharpness.
