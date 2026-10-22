# PantryGator intro + Gator moments — design handoff

Status: chosen designs, ready for implementation review. Date: 2026-10-22.
Source of truth: the design canvas **"PantryGator · Chosen designs"** (https://claude.ai/artifact/XJmPwrPC5qmGu4DTdpCpbB, private to the owner until shared). This package is a snapshot of it.

| Folder | What's in it |
|---|---|
| `png/` | Every screen at 2× (360 × 760 pt phones; the wide boards show several states side by side) |
| `screens/` | The same screens as standalone HTML (open in a browser; links between intro screens work) |
| `gator/` | The 13 Gator SVGs used by these screens (§6) |
| `source/` | The canvas's `.dc.html` sources, for exact numbers |

Theme: **Warm** (`docs/themes/handoff.md`). Hex values below are Warm's tokens; use the token names in code. Dock numbers come from `packages/ui/src/theme/dock.ts` on `main` @ 78cfe14.

---

## 1. Summary

| # | Screen | File |
|---|---|---|
| 1 | Launch (Balanced) | `01-launch` |
| 1b | Log in (has an account) | `01b-log-in` |
| 2 | Languages | `02-languages` |
| 3 | Set up or skip | `03-setup-or-skip` |
| 4 | Setup 1 · Snap a photo (teaches the Dock's camera) | `04-setup1-snap` |
| 5 | Setup 1 · Review (the app's own Scan Review, with Gator) | `05-setup1-review` |
| 6 | Setup 2 · Say it (teaches the Dock's mic) | `06-setup2-say-it` |
| 7 | Setup 2 · Listening | `07-setup2-listening` |
| 8 | Setup 2 · What Gator heard (Voice Note Review) | `08-setup2-what-gator-heard` |
| 9 | All set | `09-all-set` |
| — | Pantry health with Gator (Home widget moods + Health sheet) | `10-pantry-health` |
| — | Recipes · Cook tonight with chef Gator | `11-recipes-cook-tonight` |
| — | Voice Notes: Listening card with Gator + reading pill | `12-voice-notes` |
| — | Scan Review: still reading / all read with Gator | `13-scan-review` |

Flow: **Launch → Languages → Set up or skip → (Snap → [app camera] → Review) → (Say it → Listening → What Gator heard) → All set → Home.**
"I already have an account" → Log in → Home. "Skip, take me to the app" → Home with an empty Pantry.
**Skip skips only the current step**: on Snap/Review it goes to Say it; on Say it it goes to All set.
The camera itself is the app's normal Scan screen (scan-screen v3) — no intro-specific camera.

## 2. Shared look

- Phone background `--bg` #F3EDE1 for Launch, Log in, Languages, Set up or skip and the two review screens (they are real app screens).
- **Setup step screens (4, 6, 7, 9) use the olive ground** `--accent` #5F6F2E: speech bubble `--card-bg` #FBF8F1 with `--ink` text, radius 18–20; secondary cards darker olive #4A5722 with #FBF8F1 text; secondary text #EEF0DE (≥ 4.5:1 on olive). Primary nav buttons on olive are butter `--butter` #F0C96B / `--butter-ink` #4A3608. Skip is #FBF8F1 15/600.
- Progress: two 6 pt bars (radius 3, gap 6) + "1 of 2" / "2 of 2" 14/600. Filled = butter, empty = rgba(251,248,241,.28) on olive (on cream screens: #5F6F2E / #D6C9B2).
- Type: display Fraunces 600 (titles 26–36), body Instrument Sans.
- No Dark-mode version of the intro (decided).

## 3. Screens

### 3.1 Launch
Gator shopping buddy (`gator-shopping-buddy.svg`, 280 × 242) centred 96 pt from top; "PantryGator" display 36; subtitle 16 `--muted` "Know what's in your kitchen. / Buy only what you need."; bottom: primary "Get started" (52 pt, radius 12, `--shadow-btn`) → Languages; link "I already have an account" 15/500 → Log in.

### 3.1b Log in
Back link; app icon 64; "Welcome back" display 32; "Your Pantry, lists and family are waiting."; Email + Password fields (labels 14/600, 50 pt fields, `--field-bg`, 1 pt `--line-strong`, radius 12); "Forgot password?" right-aligned; primary "Log in" → Home; "New here? Get started" → Languages. Uses the existing better-auth email/password flow.

### 3.2 Languages
- Back link; app icon 44 + "Your languages" display 28.
- **App language**: `radiogroup`, three 50 pt rows (radius 14, 2 pt border): English / Română / Dansk in their own names with `lang`. Selected: `--accent-tint` fill, `--accent` border, 24 pt check disc. Preselected from the phone's language; caption "Picked from your phone's language" 12.5 `--muted`.
- **Also used for** (one card, rows divided): Voice Notes "What you say to Gator", Receipts & labels "What the camera reads", Grocery names "How items are named in your lists". Each row shows a value chip: "Same · {App language}" (default, neutral chip) or the chosen language (accent-tint chip, `--accent-on-tint`). Tap opens a menu: Same as app / English / Română / Dansk.
- Caption: "Shopping abroad? Set Receipts & labels to that country's language. You can change all of these later in Settings."
- Primary "Continue" → Set up or skip.
- **Spec impact** (see §8): Voice Notes language and Grocery names language are new Member preferences.

### 3.3 Set up or skip
Shopping buddy Gator on an accent-tint panel (236 pt tall, radius 24); title "Fill your Pantry with Gator?" display 28; body "Two quick tries and your kitchen is already in the app. About two minutes." Two choice cards (radius 16):
- "Show me how" (2 pt `--accent` border) with "1 · Snap a photo" (camera icon) and "2 · Say it" (mic icon), chevron disc → Snap.
- "Skip, take me to the app" / "Start with an empty Pantry" (1 pt `--card-line`) → Home.

### 3.4 Setup 1 · Snap a photo (olive)
- Talking Gator (`gator-talking.svg`, 132 × 100) beside a speech bubble (15.5/600): Ingredients: "Put some food on the counter and snap it. I'll work out what it all is." · Receipt: "Snap the receipt from your last shop. I'll put the whole shop away."
- "What's in front of you?" (12/700 caps) and a `radiogroup` of two cards: **Ingredients (default)** "Fruit, veg, packets and tins on the counter", **Receipt** "The receipt from your last shop, laid flat". Selected: #FBF8F1 fill, 3 pt butter border, ink text, check disc; other: #4A5722 fill, cream text. The bubble follows the pick.
- The **real Dock** at its real position, used as the teaching surface (§4): camera half lit → opens the app's Scan screen in the picked mode (`/scan?mode=ingredients|receipt`).
- Callout: "Tap the camera to start" / "It's always here, in the middle of the menu".

### 3.5 Setup 1 · Review
The app's Scan Review for the single photo, opened straight on its line editor. Top row: "‹ Camera", "1 of 2", Skip. Title "Review", subtitle "1 photo · Ingredients · all read". Olive banner with happy Gator (96 × 78): "**I spotted 6 things!** Check the one I wasn't sure about. Tap any line to fix it." Lines as Review today (low-confidence line on `--soon-bg`, "Check this" `--soon-fg`, alternative chips). Footer: "Retake" (secondary) + "Add {n} to Pantry" (primary) → Say it.

### 3.6 Setup 2 · Say it (olive)
- Status pill (#4A5722, 32 pt): butter check disc + "{n} things in your Pantry".
- Talking Gator + bubble "Now just tell me what's in the cupboard, or what to buy."
- Two example cards (#4A5722, radius 12): "“We have rice and two tins of tomatoes”" / "Goes straight to the Pantry"; "“Put milk on the list”" / "Adds it to the Shopping List".
- The real Dock with the **mic half lit** and the Scan Language chip above the capsule (§4). Callout: "Hold the mic, talk, let go" / "Your phone will ask for the microphone. The recording is deleted once I've read it." First hold triggers the existing microphone permission flow.

### 3.7 Setup 2 · Listening
Same as the app's recording state (§5.3) over the olive Say it screen: scrim rgba(20,24,8,.5); coach line 20/700 cream "Keep holding while you talk. / Let go when you're done."; Listening card with Gator; Dock above the scrim, mic half recording; chip locked (60 %). Letting go → What Gator heard.

### 3.8 Setup 2 · What Gator heard
The app's Voice Note Review sheet (top 112, radius 28 top) with happy Gator (88 × 71) beside "Here's what I heard" display 22 + "0:07 · English"; the transcript in italic 14 `--muted`; groups "Pantry · 2" and "Shopping List · 1" with "Add" tags; "Nothing is saved until you say so. Tap a line to change it."; "Discard" (→ Say it) / "Do these {n}" (→ All set).

### 3.9 All set (olive)
Bubble (centred, max 280) "You're all set! I'll keep an eye on your kitchen." over the **proud Gator** (`gator-proud.svg`, 270 × 189). Two stat tiles (#4A5722, radius 16): "{n} in your Pantry", "{m} on your Shopping List" (numbers Fraunces 30). Tips with butter icons: receipt "After each shop, snap the receipt. It ticks off your list too."; mic "The camera and mic are always in the middle of the menu." Butter primary "Go to my kitchen" → Home. Counts are real (what was added during setup; 0 is fine if a step was skipped — hide a tile at 0).

## 4. Teaching the Dock (screens 4, 6, 7)

The steps have **no Open camera / Record buttons of their own**; they show the app's Dock (`AppDock` → `Dock` + `DockCapsule`) at its real position so people learn where the buttons live.

- Dock as on main: Home · Shopping · [capsule] · Pantry · Recipes. Bar 76 pt high, `bottom: 28`, 16 pt side margins, padding 8, `--dock-bg`, 1 pt `--line`, radius `--r-dock` 22, `--shadow-float`; grid `repeat(2, 1fr) 66px repeat(2, 1fr)`, gap 4. Capsule 62 wide, `--accent` fill, overhangs the bar 18 pt top and bottom (top −26 / bottom −26 from the centre slot), camera 22–24 pt on top, 1 pt hairline (white 35 %, 12 pt inset), mic 24–26 pt below.
- **Disabled parts**: the four tabs and the other capsule half at opacity ~.4, `aria-disabled="true"`, not focusable, no navigation.
- **Lit half**: butter fill #F0C96B, icon #4A3608, a pulse ring `box-shadow 0 0 0 0 rgba(240,201,107,.75) → 0 0 0 16px transparent`, 1.6 s ease-out, infinite. No pulse under `prefers-reduced-motion`.
- **Callout**: #FBF8F1 card, radius 16, padding 10 14, centred, title 15/700 + line 12.5 `#5C5243`, a 12 pt pointer centred above the capsule. Snap: bottom 150. Say it: bottom 202 (above the chip row at bottom 128).
- **Intro-only deviation**: the capsule's ring is #FBF8F1 3 pt instead of the page colour (an olive ring on an olive ground would make the capsule disappear).
- Implementation suggestion: a `teach?: 'camera' | 'mic'` prop on `AppDock` (or an onboarding wrapper) that disables everything else and lights that half; the real camera link / `VoiceButton` stay the live controls.

## 5. Gator in the app

### 5.1 Pantry health (Home widget + Health sheet) — `10-pantry-health`
Per `docs/health-widget/handoff.md`, with Gator's face following the band:

| Band | Gator | Widget line |
|---|---|---|
| < 10 Batches (no score) | curious (`gator-health-curious.svg`) + "?" | Ring "4/10", "Getting to know your kitchen", "Add 6 more things to get a score", "Scan your next receipt" button; note "I'm still learning what you've got. One more shop and I can tell you how your Pantry is doing." |
| ≥ 85 | dapper (`gator-health-dapper.svg`, monocle + bubble pipe) | "In good shape / Nothing to do"; note "Splendid. Everything's in date, stocked and accounted for." |
| 65–84 | raised eyebrow (`gator-health-hmm.svg`) | "A few things to sort / 3 to do · Use 3 by Friday"; note on `--soon-bg` |
| < 65 | worried (`gator-worried.svg`) | "Needs attention / 5 to do · Toss 2 expired"; note on `--urgent-bg` |

Health sheet (48, needs attention): worried Gator beside "**48 · Needs attention.** Fix the first two and we're back over 65." on `--urgent-bg`. Lines are factual, never guilt-trippy. Check the pipe (soap bubbles, not smoke) against the store age rating before shipping.

### 5.2 Recipes · Cook tonight — `11-recipes-cook-tonight`
Accent-tint card (radius 20, 150 pt): "Cook tonight" display 22 `--accent-on-tint`, "{n} recipes use what goes off soon.", link "See them"; chef Gator stirring a pot (`gator-chef.svg`, 160 × 140) bleeding 14 pt off the right edge. Recipes tab active in the Dock.

### 5.3 Voice Notes — `12-voice-notes`
- **While held (Listening card, variant A)**: scrim; Dock above the scrim; the **capsule's mic half** in `--rec` (= `--urgent-fg` #A8431C) with the 60 s bar along its bottom (as `VoiceButton` on main); Scan Language chip above. Listening card at `pillBottom` (186): listening Gator (`gator-listening.svg`, 112 × 85) at the left, then "● Gator's listening" + "0:18 / 1:00", level meter, "EN · to your Shopping List".
- **After you let go**: status pill at the same height: thinking Gator (`gator-thinking.svg`, 88 × 71), "Gator's reading your note…", "0:18 · English · keep shopping", Cancel. Capsule back to normal.
- Gator appears only once the mic is pressed; the rest state is the plain mic.

### 5.4 Scan Review — `13-scan-review`
- **Still reading**: a card still being read shows the list-keeper Gator (`gator-list-keeper.svg`, 110 × 96) on `--accent-tint`: eyebrow "Receipt", "Gator's reading this one…", "Long receipt, nearly there". A failed card shows the worried head with "Couldn't read, retake", the reason line, and "Retake". Footer "Add all (waiting on {n})" disabled.
- **All read**: olive banner with happy Gator (104 × 84): "**All read! 23 items.** Check the 2 I wasn't sure about, then add them." Add all enabled.

## 6. Gator assets (`gator/`)

| File | Used on |
|---|---|
| `gator-shopping-buddy.svg` | Launch, Set up or skip |
| `gator-app-icon.svg` | Log in, Languages (and app icon) |
| `gator-talking.svg` | Snap, Say it (small jaw drop; animate speech by moving the lower jaw 0–5°) |
| `gator-happy.svg` | Setup Review banner, What Gator heard, Scan Review all read |
| `gator-proud.svg` | All set (chin up, eyes closed in a grin, blush, butter sparkles) |
| `gator-listening.svg` | Listening card (setup and app) |
| `gator-thinking.svg` | "Gator's reading your note…" pill |
| `gator-list-keeper.svg` | Scan Review card still being read |
| `gator-worried.svg` | Failed scan card, Health < 65, Health sheet |
| `gator-health-curious.svg` / `-dapper` / `-hmm` | Health bands (§5.1) |
| `gator-chef.svg` | Cook tonight |

Colours inside the art: gator #6FAE48 / #5E9A3C, belly #E8E2B0, outline/mouth #3E6B2E, pupils #2E3A1F. Every Gator `<img>` gets an `alt` that names the mood (the prototypes' alts are fine to reuse) or `alt=""` when the text beside it already says it. Still open: a simplified head for 24 pt / Watch.

## 7. Strings (en; new)

Intro: "Get started", "I already have an account", "Welcome back", "Your Pantry, lists and family are waiting.", "Forgot password?", "New here? Get started", "Your languages", "App language", "Picked from your phone's language", "Also used for", "Voice Notes" / "What you say to Gator", "Receipts & labels" / "What the camera reads", "Grocery names" / "How items are named in your lists", "Same · {{language}}", "Shopping abroad? Set Receipts & labels to that country's language. You can change all of these later in Settings.", "Continue", "Fill your Pantry with Gator?", "Two quick tries and your kitchen is already in the app. About two minutes.", "Show me how", "1 · Snap a photo", "2 · Say it", "Skip, take me to the app", "Start with an empty Pantry", "{{step}} of 2", "Skip", "What's in front of you?", "Ingredients" / "Fruit, veg, packets and tins on the counter", "Receipt" / "The receipt from your last shop, laid flat", the two Snap bubbles (§3.4), "Tap the camera to start", "It's always here, in the middle of the menu", "I spotted {{count}} things!", "Check the one I wasn't sure about. Tap any line to fix it.", "Add {{count}} to Pantry", "{{count}} things in your Pantry", "Now just tell me what's in the cupboard, or what to buy.", the two example phrases + results, "Hold the mic, talk, let go", "Your phone will ask for the microphone. The recording is deleted once I've read it.", "Keep holding while you talk.", "Let go when you're done.", "Say \"Pantry\" or \"list\" so I know where it goes", "Here's what I heard", "Nothing is saved until you say so. Tap a line to change it.", "Do these {{count}}", "You're all set! I'll keep an eye on your kitchen.", "in your Pantry", "on your Shopping List", "After each shop, snap the receipt. It ticks off your list too.", "The camera and mic are always in the middle of the menu.", "Go to my kitchen".
Gator in app: "Gator's listening", "Gator's reading your note…", "Gator's reading this one…", "All read! {{count}} items.", "Check the {{count}} I wasn't sure about, then add them.", plus the health lines in §5.1.
All need ro and da (`few` plurals where counts appear). Gator's lines must describe real features (Staples, Use soon, Can make, Health To-dos), never invented habits.

## 8. Spec / API impact

- **Voice Notes language**: today Voice Notes reuse the stored Scan Language (voice-notes handoff §2.4). A separate one is a new Member preference.
- **Grocery names language**: ADR 0003 ties Ingredient names to the UI locale. A separate setting is a new Member preference and an API param on catalog/scan reads.
- **Scan Language** is set initially from the intro; it stays changeable on the camera/mic chips.
- An **onboarding-done flag** per Member (show the intro once; Settings could offer "Show the intro again").
- Setup Review opens the per-Scan line editor directly (one photo) instead of the overview.

## 9. Accessibility

- Choices are real `radiogroup`s with `aria-checked`; language names carry `lang`.
- Disabled Dock parts: `aria-disabled`, out of the tab order; the lit half keeps its normal accessible name ("Camera" / "Hold to record a Voice Note").
- Pulse, Gator animations and screen transitions off under reduced motion.
- Text on olive uses #FBF8F1 / #EEF0DE (≥ 4.5:1); butter buttons use #4A3608.

## 10. Open questions

1. Should the camera open in the mode picked on Snap (Ingredients / Receipt)? Suggested yes (`?mode=`). The Receipt branch's Review isn't mocked separately.
2. Should the two review screens in setup also go olive? Currently they stay the real (cream) screens.
3. Health widget: animate Gator's face change across bands; pipe vs age rating.
4. A simplified Gator head for 24 pt icon / Watch.

Code touched (proposed): new `apps/web/src/pages/Onboarding/` (Launch, Languages, SetupChoice, SetupSnap, SetupVoice, SetupDone + `useOnboarding`), `AppDock` `teach` prop, `components/voice/ListeningCard.tsx` and the status pill (Gator image), `pages/Review` (Gator banner/cards), Dashboard Health widget (mood images), Recipes Cook tonight card, `packages/ui` Gator image atoms, `i18n/locales/{en,ro,da}/onboarding.json` + `gator.json`; API: Member Preferences (`voiceLanguage`, `catalogLanguage`, `onboardedAt`).

---

## 11. Decisions (review, 2026-10-22)

These override the sections above where they differ. Terms are in `GLOSSARY.md` (Gator, Intro, Setup, Cook Tonight).

- **Rename what users see only**: title, manifest, `appName`, voice/Siri copy, Siri's spoken reply, better-auth `appName`, Swagger, README. Package names, `PocketPantry*` identifiers, DB names, the seed-id salt and `pocket-pantry.*` storage keys stay.
- **Icons**: favicon, PWA and apple-touch icons rendered from `gator-app-icon.svg` (none exist today). No simplified 24 pt head yet.
- **§8 is superseded by ADR 0022**: the four Languages rows are UI, Spoken, Scan and Catalog Language. "Same · {language}" stores nothing. No `voiceLanguage`; ADR 0022 is built first, as its own slice.
- **Sign-up**: the existing `/sign-up` page, restyled, sits between Languages and Set up or skip; Languages are kept on the device until the account exists. Launch is the signed-out landing; `/sign-in` is the restyled Log in, and a signed-out deep link returns to its page after Log in.
- **No "Forgot password?"** (no reset flow or email sender exists); tracked separately.
- **Intro once per Member**, stored on the server, set when the Member reaches the Dashboard by any route. Existing Members are backfilled as done. No "Show the intro again". Leaving mid-Setup resumes at Set up or skip.
- **Snap** opens `/scan?mode=ingredients|receipt` (already supported). Receipt uses the same Setup Review. Setup counts against the Scan and Voice Caps. Both Setup reviews stay cream.
- **Say it**: the Default List during Setup is the Pantry.
- **Cook tonight card (Recipes)** reuses `GET /recipes/cook-tonight`: n = cards with `canMake && expiringCount > 0`, hidden at 0; copy says "expires soon"; "See them" scrolls to the "You can make this" strip, expiring first.
- **Health**: no pipe. The dapper Gator keeps the monocle and gets a gleaming tooth (one star glint, played once on appear, not under reduced motion). Face changes crossfade. The health handoff is `docs/handoffs/pantry-health-widget-handoff/`.
- **Gator's voice** only where Gator is drawn (`CODING_STANDARDS.md`).
- **Siri**: Shortcuts "Pantry add", "Gator needs", "Gator got" (checks a Shopping Item, ADR 0023) and "Gator, do we have". Spoken replies name the app, PantryGator.
