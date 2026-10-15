# Settings page — design handoff

Status: approved (variant C · You / Family tabs), ready for implementation. Date: 2026-10-14.
Reference prototype: `prototype.html` (self-contained, open in a browser; live at https://claude.ai/artifact/HweSrNENRnBbDe4CcA6Jah). It opens on variant C; A and B are kept for reference only. The top bar simulates the phone's dark mode, the Admin and Owner roles, and an expired invite code. The prototype is the source of truth for look and spacing and paints with the approved tokens from `docs/handoffs/themes/themes.ts`.

Depends on: `docs/handoffs/themes/` (`handoff.md` for tokens and the Appearance picker §4.1, `themes.ts`, `icons.tsx`), `expiry/` (quick picks, days-left tag ladder), `row-gestures/` (deferred delete + Undo, ADR 0009).

Code touched: `apps/web/src/pages/Settings/SettingsPage.tsx` (rewritten), `pages/Settings/components/*` (new: `SettingsTabs`, `AppearanceSection`, `LanguageSection`, `AccountSection`, `CatalogLink`, `FamilyCard`, `ExpiringSoonSection`, `DefaultExpirySection`, `DefaultExpirySheet`; `FamilySettingsSection.tsx` removed), `pages/Settings/hooks/useSettingsScreen.ts` (new), `lib/settings.ts` (debounced threshold save), `packages/ui/src/atoms/icons.tsx` and `packages/ui/src/index.ts` (5 new icons, §8), `i18n/locales/{en,ro,da}/settings.json`. **No API change.**

---

## 1. Summary of the change

Today Settings is one form-like column: Family Settings first (Stale Threshold field + Save, override list + category select + Save), then Member Preferences (language), Catalog link, Account.

The new page splits settings by **who a change reaches**, as two tabs:

| Tab | Holds | Stored |
|---|---|---|
| **You** (default) | Appearance (first), Language, Catalog (admins), Account | Theme: Member Preference (follows the Member, ADR 0010). Match system: this device. Language: Member Preferences (follows the Member). |
| **Family** | Family card (members, invite code), Expiring soon, Default expiry | Family Settings and Family; shared, any Member edits. |

Every change saves on its own. All Save buttons go away.

## 2. Page structure

Route stays `/settings`, reached from the Dashboard header icon (`sliders`).

| Part | Spec |
|---|---|
| Header | `AppScreenHeader`: back link "Home" (chevron-left 18, `--accent`, 14/600) + title "Settings" in the display face 30, `--display-w`, `--display-ls`. |
| Tabs | `SegmentedControl` used as tabs, full width, padding 2 16 8, **sticky** under the header with `--bg` behind it. Two equal buttons 38 pt, 14/600; selected `--seg-on` / `--seg-on-ink` 700 + `--shadow-seg`. `role="tablist"` / `tab` / `tabpanel`; ←/→ switch tabs. |
| Body | Scroll view, padding 6 16 48, 20 pt between sections. |
| Section | Label row 12/700 caps .07 em `--muted`, padding 0 4; optional **scope caption** on the right (11.5/600, no caps, 13 px icon): `phone` "This phone", `user` "Only you", `info` "Admins". Then the content, 8 pt below. |
| Tab intro | First line of each tab, 12.5 `--muted`, padding 0 4. You: "Only you see these. Your theme and language follow you. Match system is set per phone." Family: under the family card, "Everyone in the family shares these. Any member can change them." |

Initial tab: **You**. `?tab=family` opens Family (used by links from Pantry/expiry contexts later); switching tabs replaces the query (`replace: true`) so Back still leaves Settings. Each tab keeps its own scroll offset while the page is mounted.

## 3. You tab

### 3.1 Appearance (first)

Scope caption on the section: "Only you" (the Theme follows the Member). The Match system row carries its own "This phone" caption, because it is stored per device.

Storage (ADR 0010): the Theme is a Member Preference saved through the Member Preferences endpoint, with the server as source of truth. Match system is stored on the device under `pp.appearance`. A Theme change applies and caches at once, then saves; if the save fails, the toast "Theme saved on this phone. We'll sync it when you're online." shows and the chosen tile stays selected.

Exactly the themes handoff §4.1 picker inside a card (`--card-bg`, `--card-line`, `--r-card`, `--shadow-card`, padding 14 16):

- Three tiles in a 3-column grid, 8 pt gap, `role="radiogroup"` labelled "Theme". Tile: `--surface`, 2 px `--line` border (`--accent` when selected), radius `--r-ctl` + 3, padding 5 5 8. Preview 72 pt, radius `--r-ctl`, painted with **that theme's** `bg`; inside: "Aa" in that theme's display face 19, a 78 % `ink` bar and a 52 % `muted` bar (5 pt, radius 3), and a `primary` button block (38 % × 12, radius `r-ctl`/2) at the bottom left. Selected: 20 pt circle top right, that theme's `accent` with a `check` in `accent-ink`. Name 13/700; note 11.5 `--muted`.
- Notes: with Match system on, Dark-first shows "Used in dark mode" and the selected light tile shows "Used in light mode".
- Under a `--divider`: row "Match system" 15/600 + hint 12.5 `--muted` "Dark-first when the phone is in dark mode, your light theme otherwise", and a `Toggle` (`role="switch"`).
- Behaviour (`resolveTheme` unchanged):
  - Tap a light tile → `theme` = it. If Match system is on **and** the phone is dark, nothing visibly changes, so show the toast "{name} shows when the phone is in light mode."
  - Tap Dark-first while Match system is on → `{ theme: 'dark', matchSystem: false }` and the toast "Dark-first everywhere. Match system is off."
  - Turn Match system on while `theme` is `dark` → `theme` = `warm`.
  - Theme applies immediately with the 200 ms colour transition (none under reduce-motion). Arrow keys move the selection between tiles and apply it.

### 3.2 Language

Section label "Language" + scope "Only you". The existing `LanguageSwitcher` (`SegmentedControl`, en / ro / da) at full width, labels in each language's own name: **English · Română · Dansk** (`lang` attribute on each). On change: `changeLocale` + `useSaveLocale` as today, then the toast "Language saved" (in the new language). A failed save shows the existing `localeSaveFailed` alert under the control.

Scan Language is not here; it stays on the camera chip (ADR 0003).

### 3.3 Catalog (admins only)

Shown when `session.user.role === 'admin'`. Label "Catalog" + scope "Admins". A list card with one row: 36 pt lead tile (`--chip`, `pantry` icon), "Curate the Catalog" 15/600, subline "{n} unmatched names waiting" (12.5 `--muted`; omit the subline when the count isn't already loaded — do not add a request for it), chevron-right. Links to `/admin`.

### 3.4 Account

Label "Account". Card: 40 pt avatar (initials, `--accent-tint` / `--accent-on-tint`), name 15/600, email 12.5 `--muted`. Below, a full-width secondary button "Sign out" with the `logout` icon.

Tapping it swaps the button for an inline confirm strip (`--subtle`, radius `--r-ctl`, padding 10 12): "Sign out of this phone?" + ghost "Cancel" + danger "Sign out" (36 pt). Confirm → `useSignOut`, then `/sign-in` (replace) as today. No browser dialog.

## 4. Family tab

### 4.1 Family card

Card padding 14 16:
- Title "Your family" (display 21; the Family has no name field) + subline "You are the Owner · {n} members" / "{n} members". Member avatars on the right (30 pt, overlap −8, 2 px `--card-bg` ring; fills cycle `--accent-tint`, `--butter`, `--chip`), at most 4 then "+{n}".
- **Invite code** strip (`--subtle`, radius `--r-ctl`, padding 8 8 8 14): caption "Invite code · expires in {n} days" (12.5 `--muted`; "expires today" on the last day), the code in the display face 19 with .12 em tracking, grouped 4 + 4, `tabular-nums`. Secondary button 38 pt "Copy" (`copy` icon) → `navigator.clipboard.writeText(code)` (raw 8 characters, no space) → toast "Invite code copied". If the clipboard rejects, select the code text instead.
- **Expired** code: the `Expired` urgent tag, then "Generate a new code to invite someone." with a secondary "New code" button that opens `/family` (Owner), or "Ask the Owner to generate a new code." with no button (Member). Generating stays on `/family` with its warning.
- Row "Members and invites" (`--accent` 15/600, chevron) → `/family`. Leave / remove / transfer / delete stay there.

Data: `useFamily()` (already cached by the Family page). Days left from `inviteCodeExpiresAt` against the device's local date.

### 4.2 Expiring soon (Stale Threshold)

Label "Expiring soon". Card:
- Row: "Expiring soon" 15/600 + hint "Batches turn amber this many days before they expire", and a stepper on the right: − / + buttons 38 pt (`--chip`, radius `--r-ctl`, `minus` / `plus` 18), value in the display face 20 tabular with "day/days" 11/600 `--muted` under it, `aria-live="polite"`. Range **1–30** in the UI (the API keeps 1–365; a stored value above 30 shows as-is and + is disabled). Buttons disable at the ends.
- **Preview** under it: 2 × 2 grid of sample rows (`--subtle`, radius `--r-ctl` − 2, 13/600): Milk · today, Spinach · 2 days, Feta · 4 days, Eggs · 9 days, each with its tag from `expiryTagFor` (expiry handoff ladder) at the **unsaved** value, so the colours move as you tap. Sample names come from `settings.json` (translated), not the Pantry.
- Saving: debounced **600 ms** after the last tap (`useSetStaleThreshold`), then the toast "Saved". On error: revert to the saved value and show the translated error in the toast. Tags elsewhere re-colour on the next render (no change from today).

### 4.3 Default expiry (overrides)

Label "Default expiry". Card padding 4 16 14:
- One row per override (`useFamilySettings().expiryOverrides`), min-height 52, `--divider` between: name 15/600, subline "{parent} · Catalog {n} d" (whole-aisle overrides: "{parent} · every category without its own"), value in the display face 16 + "d" 12 `--muted`, and a 32 pt `close` icon button labelled "Use the Catalog default for {name}". Tap the row (or Enter) → the sheet in edit mode (§4.4).
- Remove: row disappears at once, toast "{name} uses the Catalog default" with **Undo** for 5 s; the delete request is sent when the toast closes (same deferred pattern as ADR 0009).
- Empty: "Catalog defaults are used for every category. Add one to set your own." (13 `--muted`).
- After the list: dashed row (1 px dashed `--line-strong`, radius `--r-ctl`, 46 pt, `--accent` 14/600, `plus` icon) "Set a category" → sheet in pick mode.

### 4.4 Default expiry sheet

Uses the `Sheet` molecule (scrim, max 88 % height, `--surface`, top radius `--r-card`, grab handle, Escape and scrim close it, focus returns to the opener).

**Pick mode** — title "Pick a category" (display 22) + "Its expiry pre-fills new batches", close button. Search field (46 pt, `search` icon, `--field-bg`, focus ring) filters by category or parent name (normalised as in `lib/normalizeName.ts`). List grouped by parent (`useCategoryOptions`), section labels in caps; first row of each group "All {parent}" with subline "Every {parent} category without its own", then the leaves. Right side: "Set · {n} d" `acc` tag when overridden, otherwise "Catalog {n} d" `--muted` (omit when the category has no Catalog default). No match: "No category matches “{q}”."

**Days mode** — reached by picking (with a back chevron to pick mode) or by tapping a row (no back). Title = category name, subline "{parent} · Catalog default {n} days".
- Quick picks: 5 equal tiles, 54 pt, `--field-bg` + `--line`, number in the display face 17 with the unit 10.5 under it: **3 d · 5 d · 1 wk · 2 wk · 1 mo** (= 3, 5, 7, 14, 30 days). The one equal to the value is filled `--accent` / `--accent-ink` (`aria-pressed`).
- Strip under it (`--subtle`): "{n} days · Catalog says {m}" + − / + 38 pt buttons for any other value (1–3650, the API limit).
- Initial value: the existing override, else the Catalog default, else 7.
- Footer: ghost "Use Catalog default" (edit mode only; same as the × with Undo) on the left, primary pill "Save" on the right → `useSetExpiryOverride`, close, toast "{name}: {n} days". Error: keep the sheet open, show the translated error above the footer.

## 5. Strings

Replace `settings.json` (en shown; ro/da to translate). Keep existing keys that are still used (`localeSaveFailed`, `signOut`, `family.overrideRow_*`); delete `preferences`, `preferencesPrivate`, `family.title`, `family.staleThreshold*`, `family.saveThreshold`, `family.saveOverride`, `family.category`, `family.chooseCategory`, `family.days`, `family.saved`.

```json
{
  "title": "Settings",
  "tabs": { "you": "You", "family": "Family" },
  "scope": { "device": "This phone", "you": "Only you", "admins": "Admins" },
  "youIntro": "Only you see these. Your theme and language follow you. Match system is set per phone.",
  "familyIntro": "Everyone in the family shares these. Any member can change them.",
  "appearance": { "...": "as in the themes handoff §4.1", "usedInLight": "Used in light mode", "syncedOnDevice": "Theme saved on this phone. We'll sync it when you're online.",
    "lightOnlyToast": "{{name}} shows when the phone is in light mode.",
    "darkEverywhereToast": "Dark-first everywhere. Match system is off." },
  "language": "Language", "languageSaved": "Language saved",
  "catalog": { "title": "Catalog", "open": "Curate the Catalog", "waiting_one": "{{count}} unmatched name waiting", "waiting_other": "{{count}} unmatched names waiting" },
  "account": { "title": "Account", "signOutConfirm": "Sign out of this phone?", "cancel": "Cancel" },
  "familyCard": { "title": "Your family", "youOwner": "You are the Owner", "members_one": "{{count}} member", "members_other": "{{count}} members",
    "inviteCode": "Invite code", "expiresIn_one": "expires in {{count}} day", "expiresIn_other": "expires in {{count}} days", "expiresToday": "expires today",
    "copy": "Copy", "copyLabel": "Copy invite code", "copied": "Invite code copied", "newCode": "New code", "manage": "Members and invites" },
  "expiringSoon": { "title": "Expiring soon", "hint": "Batches turn amber this many days before they expire", "fewer": "One day fewer", "more": "One day more",
    "samples": { "milk": "Milk", "spinach": "Spinach", "feta": "Feta", "eggs": "Eggs" }, "saved": "Saved" },
  "defaultExpiry": { "title": "Default expiry", "catalogDays": "{{parent}} · Catalog {{count}} d", "wholeParent": "{{parent}} · every category without its own",
    "useCatalog": "Use the Catalog default for {{name}}", "removed": "{{name}} uses the Catalog default", "undo": "Undo",
    "empty": "Catalog defaults are used for every category. Add one to set your own.", "add": "Set a category",
    "pickTitle": "Pick a category", "pickHint": "Its expiry pre-fills new batches", "search": "Search categories", "all": "All {{parent}}",
    "noMatch": "No category matches “{{q}}”.", "set": "Set · {{count}} d", "catalog": "Catalog {{count}} d",
    "catalogDefault": "Catalog default {{count}} days", "catalogSays": "Catalog says {{count}}", "useCatalogButton": "Use Catalog default",
    "save": "Save", "savedToast": "{{name}}: {{count}} days" }
}
```

`family.json` keys `expired`, `expiredOwnerPrompt`, `expiredMemberPrompt` are reused for the expired code.

## 6. Accessibility and edge cases

- Tabs: `tablist`; theme tiles: `radiogroup` with roving tabindex; Match system: `switch`; quick picks: `aria-pressed`; stepper value `aria-live="polite"`. Focus rings `--accent`, 2 px offset.
- The sheet is a dialog: focus goes to the search field (pick) or the selected quick pick (days); returns to the opener on close.
- Reduce-motion: no theme fade, no sheet slide, no button press scale.
- Offline / errors: Appearance never fails (local). Language and Family Settings errors use `translateApiError` in the toast or under the control as described.
- Loading: Family tab shows skeleton rows in each card while `useFamily` / `useFamilySettings` load; the You tab renders immediately.
- A Member removed from the Family while on the Family tab: the next `useFamily` refetch returns the new Household of One; the card just updates.

## 7. Tests

- Page seam (`SettingsPage.test.tsx`): opens on You; `?tab=family` opens Family; Appearance tile applies the theme and persists `pp.appearance`; Dark-first with Match system turns it off; language change calls the preferences endpoint; Sign out needs the inline confirm.
- Family tab: stepper debounces to one request for several taps; preview tags follow the unsaved value; override remove shows Undo and sends the delete only after the toast closes; Undo sends nothing; sheet search filters; Save creates/updates the override; expired code shows the Owner / Member copy.
- Remove `FamilySettingsSection` tests that assert on the old Save buttons.

## 8. Icons

Five new icons on the themes grid (24 px, stroke 2, round caps, `currentColor`). Register them in `ICON_NODES` in `packages/ui/src/atoms/icons.tsx` and export them from `packages/ui/src/index.ts`. The SVGs are in `icons/` next to this file. Registered in this ticket: `copy`, `logout`, `user`, `phone`, `minus`. `users` is in the handoff but not registered yet: the existing `PeopleIcon` covers Family contexts until a ticket needs the handoff glyph.

| name | path | used for |
|---|---|---|
| `logout` | `<path d="M14 4h5v16h-5"/><path d="M10 8l-4 4 4 4M6 12h10"/>` | Sign out |
| `copy` | `<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>` | Copy invite code |
| `users` | `<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>` | Family contexts |
| `user` | `<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>` | "Only you" scope |
| `phone` | `<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18.5h2"/>` | "This phone" scope |

Also needed and missing from the set: `minus` (`<path d="M5 12h14"/>`) for steppers. It replaces the lucide `MinusIcon` placeholder. (`globe` and `clock` in the prototype belong to variant B only; not needed.)

## 9. Defaults taken — flag if wrong

- Expiring soon stepper capped at **30** in the UI (API allows 365).
- Whole-aisle overrides ("All produce") **kept**, as today.
- Threshold saves **600 ms** after the last tap.
- Opens on **You**, not on the last tab used.
