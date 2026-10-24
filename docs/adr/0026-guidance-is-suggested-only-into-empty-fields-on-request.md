# Guidance can be suggested, but only into empty fields and only on request

Members and Admins want a Recipe's Guidance (Pairings, Nutrition Note, Eating Moments) filled in without writing it all by hand, most of all right after Recipe from Link, which leaves it empty. Suggest Guidance is the separate, explicit action ADR 0024 left for later. It amends ADR 0008's "written by hand" to "chosen by a Member or Admin". Agreed in a grilling session on 2026-10-24.

## Decision

- **An action on the Recipe page, not a step of reading.** Suggest Guidance is offered on the New and edit Family Recipe pages, including a Recipe from Link draft, and on Catalog Recipe editing for Admins. Recipe from Link itself still never invents anything (ADR 0024).
- **It reads what the page currently holds**, saved or not: Ingredient Lines, Steps, Cuisine, Method and Servings.
- **Guidance only.** Tips, Servings, Cuisine and Method are never suggested.
- **Only empty fields are filled.** A Recipe with any Pairing, a Nutrition Note, or any Eating Moment keeps that field as it is. When all three are filled there is nothing to suggest. A field with nothing worth proposing stays empty and says so.
- **Suggestions land in the form**, each marked as suggested until it is edited or saved, and nothing is stored until Save. Once saved it is ordinary Guidance, with no stored record that it was suggested. The Nutrition Note keeps its fixed disclaimer.
- **Links point only at real things.** A suggested Pairing links to a Catalog Ingredient, or to a Recipe the Recipe may already link to under ADR 0008, and is otherwise an unlinked label. No new Recipes are proposed.
- **Family Recipes avoid the Family's Allergies.** Suggested Pairings never contain a Member's Allergy or a Family Allergy, since Pairings carry no Allergy Warning.
- **Catalog Recipes are filled one locale at a time**, the one the Admin is editing. Family Recipes use the Recipe's own language.
- **A separate Guidance Cap** of 20 requests per Member per day, counting only requests that return something usable. Admins have no cap.

## Considered Options

- **A checkbox on Recipe from Link, done in the same AI call.** One call instead of two, but it would work from the raw page rather than the matched, converted draft, and it would put reading and inventing back in one step.
- **Suggesting Tips, Servings, Cuisine or Method too.** A made-up Tip sits beside Steps the source wrote, and Servings drive scaling, Can Make and the Plan Forecast, so a wrong guess costs more than a wrong Pairing.
- **Replacing or topping up existing Guidance.** It would overwrite or mix in with what a Member wrote.
- **Marking saved Guidance as AI-written.** Whoever saves it stands behind it, as with a Recipe from Link draft. A permanent badge would need storage and would mean little once edited.
- **Counting it against the Link Cap.** The action isn't tied to links.

## Consequences

- Guidance on a Recipe can no longer be assumed to be hand-written, only reviewed and saved by a person.
- Running Suggest Guidance again on a Recipe whose Guidance is all filled does nothing; the Member has to clear a field first.
