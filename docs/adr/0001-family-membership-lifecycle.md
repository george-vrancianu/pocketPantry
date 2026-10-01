# Family membership: every Member always has a Family, data stays with the Family

## Decisions

- **Every Member has exactly one Family at all times** (`user.family_id` is NOT NULL). Leaving, being removed, and the Family being deleted therefore each create a fresh Household of One for the Member in the same transaction. The Member becomes its Owner.
- **Data belongs to the Family, not the Member.** A departing Member keeps their account, sign-in and Member Preferences (these live on the Member) but takes no Pantry or Shopping data with them: Batches and Shopping Items stay with the Family they left. They start with an empty Household of One. Nothing is merged or copied, in either direction.
- **Joining abandons only a Household of One.** Redeeming an Invite Code is rejected when the redeemer's current Family has other Members. The abandoned Household of One is deleted together with its data. The UI shows a warning with counts (`GET /family/join-preview`) before the Member confirms.
- **A Family that would become empty is deleted.** This only happens when its sole Member joins another Family. Leave and remove always leave the Owner behind, so no other path empties a Family.
- **Deleting a Family deletes everything it owns.** Tables owned by a Family (Batches, Shopping Lists, Shopping Items, Family Settings, ...) must reference `family.id` with `ON DELETE CASCADE`; deleting the Family row is then the whole job and no service code lists them. The join warning counts come from `countFamilyData` in `apps/api/src/family/membership.ts`, which each such table's ticket extends. Until those tables exist it returns zeros.
- **The Owner cannot leave** (including an Owner alone in a Household of One: nothing to transfer to; they can delete the Family instead, which resets it). They transfer ownership first. Ownership transfer demotes the old Owner before promoting the new one, because the one-Owner-per-Family unique index is checked per statement.

## Authorisation and concurrency

- The caller's role is read from the database inside the transaction, never from the session, and every mutation is scoped to the caller's Family (targets outside it get `family.member_not_found`).
- Lock order is fixed: Family rows first (ascending id when more than one), then Member rows. Each mutation locks the caller's Family, so mutations on one Family are serialised. Joining locks the caller's and the target Family together in id order, so two Owners joining each other cannot deadlock. After locking, the Member's Family is re-read and the code re-validated, so a join cannot race a regeneration, an expiry or a deletion, and a Member cannot leave or join twice at once.
