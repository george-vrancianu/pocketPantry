# Promo Codes gate signup and replace the Welcome Grant while they do

Open signup gives every stranger 100 Credits of real AI spend, and the only way to add Credits on purpose was a database script. We add Promo Codes: single-use codes an Admin issues, each worth a set number of Credits (100 by default, possibly none). A deploy flag makes creating a new Family at signup require one.

## Decision

- **While the flag is on, creating a Family at signup needs a Promo Code, and its Credits replace the Welcome Grant.** The Member's `welcome_grant_at` is never set, so they never get a Welcome Grant later either. While the flag is off, the Welcome Grant is paid as in ADR 0032, and a Promo Code entered at signup adds its Credits on top.
- **An Invite Code is enough to join a Family at signup, even with the flag on.** The Owner who shares it vouches for the new Member. While the flag is on, a Member who joins brings no Credits.
- **Joining at signup skips the Household of One.** The Member goes straight into the Family. A bad Invite Code or Promo Code refuses the whole signup, so no account, Family or Credit entry is left behind.
- **A Promo Code is redeemed once, ever,** by one Member into their Family, either at signup or later in Settings by any Member. The redemption and its Credit entry are written in one transaction under a row lock. An unused code can be revoked; a redeemed one cannot, and codes never expire.
- **The flag is an environment variable,** changed by redeploying, like the Caps and Credit Prices.
- **Admin now means the app-operator role,** catalog curation plus issuing Promo Codes, rather than a second role.
- **The Promo Code record is not owned by a Family.** It keeps the redeeming Family's id with no foreign key, so it survives that Family's deletion as an audit trail and stays outside ADR 0001's rule that every foreign key to `family` cascades.

## Considered options

- **Keep the Welcome Grant beside Promo Codes.** Rejected: a new Member would start with 200 Credits, and the code would no longer set what they get.
- **Drop the Welcome Grant for good.** Rejected: once the flag is off, signups without a code would get nothing to try the app with.
- **Require a Promo Code to join a Family too.** Rejected: the Invite Code already gates joining, and asking a partner to find a second code adds friction without stopping abuse.
- **Shareable codes, usable once per Family.** Rejected: a code posted anywhere would reopen signup to everyone who sees it.
- **A runtime switch in the Admin screen.** Rejected: it would store app settings in the database for a single boolean that rarely changes.
