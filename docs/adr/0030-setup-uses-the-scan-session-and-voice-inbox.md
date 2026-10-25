# Setup uses the real Scan Session and Voice Inbox

Setup allowed one Scan and one Voice Note, each reviewed at once, so the Intro stayed short. In the app a Member takes several photos and records several Voice Notes and reviews them when ready (ADR 0004, ADR 0025). A new Member's first pantry rarely fits in one photo, and teaching one flow in Setup and another in the app costs more than it saves. Setup now uses the real Scan Session and Voice Inbox. This replaces ADR 0025's "Setup keeps one Voice Note" clause.

## Decision

- **Snap keeps shooting.** The shutter no longer opens one Scan's editor. The Setup Review at `/intro/review` is the real Review overview in the Intro's frame, outside the app shell. Opening a card edits it at `/intro/review/:scanId`, and saving it goes back to the overview. Add all works as in the app. Only the Ingredients and Receipt modes are offered, so a receipt can be scanned in several Receipt Sections.
- **Say it uses the Voice Inbox** with its strip, "ready" nudge, single Review and Review all. Nothing opens by itself. Every Setup Voice Note keeps the Pantry as its Default List (ADR 0021).
- **A step moves on by itself once it is empty and saved something.** When the last card or Voice Note is saved, applied or discarded and at least one save happened in that step, Snap goes on to Say it and Say it goes on to All set. If everything was discarded, the Member stays and can try again.
- **"Next" leaves early, and leftovers go into the app.** While something is unsaved, the Setup top row shows Next beside Skip. Unsaved cards and Voice Notes stay in the Scan Session and the Voice Inbox, which live in memory, and are waiting in the app after the Intro.
- **Skip drops what the step holds,** after a confirm when something would be lost.
- **Snap no longer clears the Scan Session when it opens,** so going back to the camera keeps the stack.
- **There is no Setup-only limit.** The Scan Cap, the Voice Cap and the Voice Inbox's limit of 5 apply as usual.
- **The Intro hosts the camera and the Voice Note itself, with settings.** The Intro has its own camera route, which renders the shared camera with the Intro's settings: the Scan Modes offered, no Import, and where the shutter, the photo stack and Close go. The Review and the Voice Note host take their Setup behaviour as settings too. The shared Scan and Voice code never asks whether the Member is in Setup, and the app's Scan routes are no longer allowed mid-Intro.

## Considered options

- **Keep one of each.** Rejected: it teaches a flow the app no longer has.
- **Drop leftovers when the Member moves on.** Rejected: photos and recordings that were already read, and counted against the caps, would be thrown away.
- **Open each Setup Voice Note as soon as it is read.** Rejected: that is a separate flow to keep alive next to the Voice Inbox's.
- **Keep the app's camera route and tell it about Setup through a flag or React context.** Rejected: Setup checks would stay spread through the shared code, and the Intro would still need an exception to use an app route.
