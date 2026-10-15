# Meal Plans are saved, owned by the Family, never overlap, and are forecast against the Pantry

A Family can see what it Can Make tonight but can't plan ahead, or learn on Monday that Thursday's dinner will be short of eggs. We store a Meal Plan as a saved schedule of 1 to 7 days, owned by the Family, and work out a Plan Forecast at read time. Agreed in a grilling session on 2026-10-15 (#324), with the schema approved in review the same day.

## Decision

- A Meal Plan belongs to the Family, not to a Member. Any Member can create, edit and delete it. There is no created-by column.
- Plans never overlap. A plan's dates must not intersect any other plan of the same Family, and a plan that only touches another at the edges (one ends Tuesday, the next starts Wednesday) is allowed.
- A Family keeps at most `MEAL_PLAN_CAP` plans (default 10), past ones included. Plans are never deleted automatically.
- Slots store a day number relative to the plan's start date (0 to 6), not a date. Only filled slots are stored: an empty slot is no row. Moving a plan changes only its start date, so slots never need rewriting and can't trip a unique index on the way. A slot's date is the start date plus its day number.
- Overlap is checked in the service under the existing Family lock, on create, on moving the start date and on lengthening. There is no `btree_gist` exclusion constraint.
- Past days are read-only. A day is past only once its date is before the client's `today`, which falls back to UTC like Cook Tonight.

**Plan Forecast** is derived at read time, never stored, and lives in a pure module beside Recipe pantry matching, reusing its comparable-unit and expiry logic ([ADR 0007](0007-recipe-pantry-matching.md)).

- Slots are used in order: by date, then Breakfast, Lunch, Dinner. Each slot uses up what it needs from a working copy of the stock, scaled to the slot's effective Servings. The forecast carries on across consecutive plans.
- Within an Ingredient the soonest-expiring Batch is used first, and Batches with no expiry date last.
- Expiry is judged by the slot's day. A Batch counts only if it isn't Expired on that day, so a Batch that expires on that day still counts.
- Units are compared within one dimension, as in ADR 0007.
- When Batches exist but none can be compared, the first use is covered and uses nothing up. Later uses of that Ingredient are **uncertain**: shown on the line ("amount unknown"), never as a bar colour, and never making the slot short.
- A slot whose Recipe has since been archived is **unavailable**. It is left out of the forecast, the plan tag and Add missing, and is shown as "No longer available" rather than dropped without a trace.
- The Shopping List is never stock. It only turns a short slot into "on list", never into covered.
- Add missing sums shortfalls per Ingredient in g, ml or pcs and shows them as kg or l at 1000 or more. Ingredients already on the Shopping List, uncertain lines, Pantry Basics, optional lines and unavailable slots are left out. It runs on the server, which works out the forecast again, so the client never sends amounts.

**Fill** picks Recipes for empty slots only and never overwrites a slot the Member chose.

- Each Base Recipe group puts forward its best member, ranked by ADR 0007's order.
- Mealtimes map to Eating Moments by their stable keys, not their display names. Breakfast prefers Recipes marked Good for Morning or Brunch, Lunch prefers Good for Light lunch, and Dinner has no preference. "Prefers" means ranked first, before ADR 0007's order. A Recipe marked Avoid for a Mealtime's mapped Eating Moment is never placed there.
- Variety: no Base Recipe group (a Base Recipe and its Variants) on the same day or within 2 days of another use, counting the slots the Member filled. If nothing passes, the slot stays empty.
- "Only what I have" places only Recipes with no short or missing required line in the forecast, and never turns a slot that was covered into a short one, so a Member's own picks keep their ingredients.

## Alternatives rejected

- **AI generation in version one.** It adds cost and a failure mode, and the Pantry-ranked Fill covers the need. A later version can reuse the existing structured-output AI service.
- **A "Cooked" state** that takes stock out of the Pantry. It needs cook-time deduction, which is a feature of its own. Today's slots count all day, and the forecast speaks only about what is still ahead.
- **A picker before Add**, to choose which lines to add. Add missing instead adds everything not already on the list, with an Undo snackbar, so a mis-tap is cheap to reverse.
- **Overlapping or draft plans for the same dates.** Two dinners for one Tuesday make the forecast ambiguous, so the Family names the other plan and moves or deletes one.
- **Plans owned by Members.** Planning is a Family activity, and a Member leaving would take the plan with them or orphan it.
- **Dates on slots.** The first design stored a date per slot, with a unique index on (Family, date, Mealtime) doubling as an overlap guard. Moving a plan then rewrote every slot, and the move could collide with itself mid-update. A day number removes both.
- **A `btree_gist` exclusion constraint for overlap.** It needs an extension and a range column kept in step with the start date and length, and its error would still have to be turned into `meal_plan.overlap` with the other plan's details. The Family lock already serialises Family writes.
- **Counting the Shopping List as stock.** Items on the list aren't in the kitchen yet, as in ADR 0007.

## Consequences

- Overlap safety rests on every plan write going through the service under the Family lock. A write that skips it can create overlapping plans, since the database does not check.
- A slot's day number being inside the plan's length is also enforced in the service, not by a constraint.
- Shortening a plan deletes the slots past the new end. The client asks for confirmation first.
- The forecast stays right as the Pantry, the Shopping List and the plan change, at the cost of recomputing it on every read.
- The forecast can be optimistic when Batches lack quantities. Uncertain lines show where it is guessing.
- Archiving a Recipe never breaks a plan: its slots turn unavailable and the Member decides what replaces them.
