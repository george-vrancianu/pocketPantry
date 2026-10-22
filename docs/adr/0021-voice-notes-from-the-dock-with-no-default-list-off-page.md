# Voice Notes are recorded from the Dock, with no Default List off the Shopping List and the Pantry

Members want to talk to the app from anywhere, not only after opening the Shopping List or the Pantry. The Dock becomes five slots (Home, Shopping, a stacked Camera/Mic button, Pantry, Recipes), and its mic records a Voice Note on every page that shows the Dock. ADR 0017 let the page set the list, and the API silently fell back to the Shopping List. This record amends that rule for pages that have no list.

## Decision

- **The mic lives in the Dock.** The stacked button's camera half opens the camera, as the Scan tab did, and its mic half is the same hold-to-talk, with the same quick-tap hint and status pill. The floating voice button on the Shopping List and the Pantry is removed. The mic is wherever the Dock is, so it is not under `/scan` or on `/customise`. When voice is not configured, the button shows the camera only. At the Voice Cap the mic still responds and shows the cap message.
- **Only the Shopping List and the Pantry set a Default List.** They keep ADR 0017's rule. Every other page sends no Default List. Recipes and Meal Plans give no extra context for now.
- **Off those pages, the Member must be specific.** A Voice Action has a list when the Member names it, when its kind implies one (check, uncheck and setting a quantity mean the Shopping List, and Running low means the Pantry), or when there is a clear cue: a Location or expiry date means the Pantry, and "need" or "buy" means the Shopping List. These cues are spelled out in the read prompt.
- **Otherwise the Member picks the list in Review.** An add or remove with no list gets a list picker, as a Voice Action that needs a Batch already does, and Apply waits until every one is picked. With two or more, a "put all on" choice is offered. The API resolves such an action against both lists up front, so picking is instant and a Pantry removal still shows the Batch it takes. Apply re-resolves as before.
- **The request says so explicitly.** `defaultTarget` is required and accepts `shopping`, `pantry` or `none`. Nothing falls back to the Shopping List by accident.
- **Review and answers open in place,** over whatever page the Member is on, with the usual apply toast and no navigation.
- **Pantry Questions are unchanged.** They need no list and work the same on every page.
- **Assistant Requests keep the Shopping List as their Default List.** The Shortcut cannot ask back, and "Pantry add milk" reads as a shopping add. The difference from in-app Voice Notes is deliberate.

## Alternatives considered

- **Default to the Shopping List everywhere, as Siri does.** Rejected: "got the yogurts" said on Home would quietly land on the wrong list, and Review is easy to skim.
- **Send an action with no list to Didn't understand.** Rejected: it throws away a good read and makes the Member record again for one missing word.
- **Ask for a new resolve when the Member picks a list.** Rejected: it needs a new endpoint and a wait in Review. Resolving both lists up front costs one extra lookup per ambiguous action.
- **Infer the list only from words that name it.** Rejected: "put two yogurts in the fridge" is plainly the Pantry, and asking would feel obtuse.

## Consequences

- Review gains a list picker beside the Batch picker, and the read result carries both resolutions for an action with no list.
- The read prompt gains a no-Default-List branch with its cues. It is tuned with `scan-replay` transcripts recorded off-page.
- The Dock replaces its Scan tab with the stacked button, and gains a Home tab.
