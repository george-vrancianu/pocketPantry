# The screen header holds only the screen's add action; the Dock carries navigation

The Pantry, the Shopping List and Recipes each put their add button somewhere different: the Pantry's `+` was the header action, Shopping's `+` sat in the summary card with Import in the header, and Recipes' `+` menu sat in the header's trailing slot. Every sub-screen header also carried a Home button on the left and, since #531, a Settings gear on the right. The Dock (ADR 0021) already has a Home tab, so the header Home button repeats it, and three buttons crowd a phone header.

## Decision

- **A sub-screen header holds the title and at most one button: the screen's add action.** On the Pantry, the Shopping List and Recipes it is the same accent `+`, in the same place.
- **An add with more than one way in opens a menu** from that same `+` (Recipes: New recipe, From link). `ScreenHeaderAction` takes `items` for this.
- **No Settings gear on sub-screens.** Settings is reached from the Dashboard's gear only.
- **No Home button where the Dock shows.** Screens without the Dock (Customise, and the camera and Review under `/scan`) keep Home so they are never a dead end. Back links are unchanged.
- **Shopping's Import moves into the summary card,** where the `+` was. It is left out while the Start your list block shows its own Import tile, which is an empty list with at least one template.

## Considered options

- **Keep the gear on every sub-screen (#531).** Rejected: Settings is rarely needed mid-task, and the gear competed with the add button for the rightmost spot.
- **Give Recipes a plain `+` to New recipe and move From link elsewhere.** Rejected: it hides a common way in for the sake of uniformity; a menu behind the same `+` looks identical.
- **Hide the card's Import on every empty list.** Rejected: with no templates the Import tile is hidden too, and the sheet's Manage link would have no way in.

## Consequences

- Getting to Settings from a sub-screen takes two taps (Home in the Dock, then the gear).
- A future header button needs a reason to break the one-button rule; search and share stay possible as the single action on screens that add nothing.
- A Recipe editor (New, Variant, Edit) adds nothing, so its single header button is Save. It has no Dock and no Home button: Back is its exit.
