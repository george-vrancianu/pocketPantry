# Themes & icons — design handoff

Status: approved, ready for implementation. Date: 2026-10-13.
Reference prototype: `prototype.html` (self-contained, open in a browser; live at https://claude.ai/artifact/VpCCvB3hRmkC4PBQJ1b4VP). Switch themes at the top; "Compare" shows the three phones side by side. The prototype is the source of truth for look and spacing; `themes.ts` and `icons.tsx` in this folder were generated from the same data it renders, so the numbers match.

Code touched: `packages/ui/src/theme/*` (new `themes.ts`, `ThemeProvider`), `packages/ui/src/icons/*` (new), `apps/web/src/pages/Settings/*` (Appearance section), the `Button`, `Chip`, `Tag`, `Card`, `Field`, `SegmentedControl`, `Toggle`, `Checkbox`, `Snackbar` and `Dock` atoms, every place that imports an icon, `apps/web/src/i18n/locales/{en,da,ro}/settings.json`. No API change; the preference is per device (see §2).

---

## 1. Summary of the change

The app stops being light-only with one fixed look. Users pick one of **three themes** under Settings → Appearance, and can let the phone's dark mode switch to the dark theme automatically.

| id | Name | Scheme | Character |
|---|---|---|---|
| `warm` | Warm editorial | light | Oat paper, olive accent, paprika for warnings, Fraunces serif display, soft warm card shadows, round FAB. **Default for new installs.** |
| `minimal` | Minimal crisp | light | Chalk-white, hairlines, no shadows, tight radii; ink-black primary buttons so green only ever means state. Schibsted Grotesk + Figtree. |
| `dark` | Dark-first | dark | Moss background, elevated borderless cards, mint accent on dark ink. Sora + Albert Sans. The target of "Match system" in dark mode. |

The current sage/white look (`tokens.ts`, Bricolage Grotesque + DM Sans) is retired once the three themes ship. Every existing screen (Pantry, Shopping, Recipes, Scan review, Templates, Staples) renders through the tokens, so a screen needs no per-theme code unless it hard-codes a colour, radius or font; those are the migration work (§6).

The app's icons are also replaced by the **set in `icons.tsx`** (20 icons, §5).

## 2. Theme model

- Preference stored on the device (`localStorage` key `pp.appearance`, mirrored to the native settings store if the app is wrapped): `{ theme: 'warm' | 'minimal' | 'dark', matchSystem: boolean }`. Default `{ theme: 'warm', matchSystem: true }`.
- Resolution (`resolveTheme` in `themes.ts`): `matchSystem` off → `theme`. On → `dark` when `prefers-color-scheme: dark`, otherwise the chosen light theme; if the chosen theme is `dark` and the system is light, fall back to `warm`.
- `applyTheme(id)` writes every token as a CSS custom property on `<html>` (`--bg`, `--accent`, …), sets `data-theme="<id>"` and `color-scheme`. Components read only the custom properties; nothing imports a hex value.
- Apply **before first paint**: an inline script in `index.html` reads the stored preference and sets the properties, so there is no flash of the wrong theme. React's `ThemeProvider` then takes over and listens to `matchMedia('(prefers-color-scheme: dark)')`.
- Theme switch animates background and surface colours over 200 ms (`transition: background-color .2s, color .2s` on `html`, `body`, cards); instant under reduce-motion.
- `<meta name="theme-color">` follows `--bg` of the active theme.

## 3. Tokens

All three themes define the **same 51 keys** (`ThemeTokens` in `themes.ts`). Naming keeps the existing `--bg / --surface / --ink / --muted / --line / --divider / --chip / --accent / --accent-tint / --butter / --urgent-* / --soon-* / --ok-* / --box / --scrim` family and adds:

| Token | Why |
|---|---|
| `--primary`, `--primary-ink` | Primary button colour, separate from `--accent` (Minimal uses ink-black buttons with a green accent). |
| `--accent-ink`, `--accent-on-tint` | Text on an accent fill / on the accent tint (differs in dark). |
| `--line-strong` | Secondary button and dashed-row borders where `--line` is too faint. |
| `--card-bg`, `--card-line` | Cards can differ from `--surface` (dark: elevated, `transparent` line). |
| `--field-bg` | Inputs (dark fields are darker than cards). |
| `--seg-on`, `--seg-on-ink` | Selected segment (Minimal inverts to ink). |
| `--toast-bg`, `--toast-ink`, `--toast-action` | Snackbar (dark theme uses a light toast). |
| `--dock-bg`, `--bezel`, `--star` | Dock glass, prototype bezel (ignore in app), starred staple. |
| `--r-card`, `--r-ctl`, `--r-chip`, `--r-fab`, `--r-dock`, `--r-box` | Radii: card / control (buttons, fields, segmented) / chip / Add button / dock / checkbox. |
| `--bw`, `--bw-field` | Border widths (1 px everywhere; field 1.5 px in Warm). |
| `--shadow-card`, `--shadow-btn`, `--shadow-float`, `--shadow-seg` | Elevation: card / primary button / sheet, dock, toast, popover / selected segment. `none` where a theme is flat. |
| `--display`, `--body`, `--display-w`, `--display-ls` | Font stacks, display weight and tracking. |

Full values per theme: `themes.ts` (or the Color sheet in the prototype, which shows hex values).

### 3.1 Key values at a glance

| | warm | minimal | dark |
|---|---|---|---|
| bg / surface | `#F3EDE1` / `#FBF8F1` | `#FAFAF8` / `#FFFFFF` | `#0F1512` / `#19211C` |
| ink / muted | `#2B2418` / `#766A58` | `#141614` / `#6B716B` | `#ECF2EC` / `#97A69B` |
| accent (on tint) | `#5F6F2E` (`#4A5722`) | `#1E7A4E` (`#176040`) | `#8FE0A8` (`#A9EDBD`) |
| primary / ink | `#5F6F2E` / white | `#141614` / white | `#8FE0A8` / `#0B1A10` |
| urgent fg / soon fg | `#A8431C` / `#704E00` | `#B33A1E` / `#7A5600` | `#FFA27E` / `#F2CF72` |
| radius card / control / chip | 16 / 12 / 999 | 12 / 10 / 8 | 18 / 14 / 999 |
| card edge | hairline + warm shadow | hairline, no shadow | no border, shadow + 1 px inner highlight |
| display / body | Fraunces 600 (SOFT 50) / Instrument Sans | Schibsted Grotesk 700 / Figtree | Sora 600 / Albert Sans |

Contrast: every ink/muted-on-bg and accent-ink-on-accent pair is ≥ 4.5:1; `--muted` on `--subtle` is the tightest (≈ 4.6:1 in Warm). Keep `--muted` for 13 px+ text only.

## 4. Components

Mapping from token to atom. Sizes are unchanged from the shopping handoff unless listed.

- **Button** (`packages/ui/src/atoms/Button`): height 46, padding 0 18, radius `--r-ctl`, 14.5/700. Variants: `primary` (`--primary` / `--primary-ink`, `--shadow-btn`), `secondary` (`--surface`, `--line-strong` border), `tonal` (`--accent-tint` / `--accent-on-tint`), `ghost` (transparent, `--accent` text, tint on hover), `danger` (`--urgent-bg` / `--urgent-fg`). `size="sm"` 36 pt, 13.5. `shape="pill"` → radius 999 (Done, Move N to Pantry). Press: scale .97 / 80 ms. Disabled: opacity .45. The **Add button** (52 × 52) is `--accent` / `--accent-ink`, radius `--r-fab` (round in Warm, 12 in Minimal, 16 in Dark).
- **Chip** (suggestions, template chips): 36 pt, radius `--r-chip`, `--surface` + `--line`; leading icon `--accent`; `on` state `--accent-tint` / `--accent-on-tint` with no border; the dismiss × sits after a 1 px `--divider`.
- **Tag**: 11/700, radius 999; `acc` (On list / Staple), `ok` (In Pantry), `soon`, `urg` colour pairs from the tokens.
- **SegmentedControl**: `--chip` track, radius `--r-ctl`, 4 pt padding; selected `--seg-on` / `--seg-on-ink` + `--shadow-seg`.
- **Field**: 50 pt, radius `--r-ctl`, `--field-bg`, `--bw-field` `--line` border; focus `--accent` border + 3 px `--accent-tint` ring. Unit chip inside: `--chip`, radius `--r-ctl` − 5.
- **Toggle**: 46 × 28, track `--box` → `--accent`, white knob. **Checkbox**: 24 pt, radius `--r-box`, 2 px `--box`; checked `--accent` fill with `--accent-ink` check.
- **Card**: `--card-bg`, `--bw` `--card-line`, radius `--r-card`, `--shadow-card`, padding 14 16. Three uses in the prototype: stat card (label 12/600 muted, value display 26, progress bar), media card (image area radius `--r-card` − 6, title display 17, meta 13, tags), list card (padding 4 16, rows separated by `--divider`). Summary card and aisle lists on Shopping are cards.
- **Snackbar**: `--toast-bg` / `--toast-ink`, radius `--r-ctl`, `--shadow-float`, action text `--toast-action`.
- **Dock**: `--dock-bg` with 12 px blur, `--line` border, radius `--r-dock`, `--shadow-float`; active tab `--accent-tint` / `--accent-on-tint`.
- **Progress bar**: track `--chip`, fill `--accent`.
- **Section label**: 12/700 caps, .07 em tracking, `--muted`.
- **Dashed save row**: 1 px dashed `--line-strong`, radius `--r-card`.

### 4.1 Appearance picker (Settings)

A card titled "Appearance":
- Three option tiles in a row (`role="radiogroup"`): a 72 pt preview painted with that theme's own `bg`, `ink`, `muted`, `primary` (two bars + a button block), the theme name 13/700, and a `check` icon on the selected one. 2 px border `--line`, `--accent` when selected. Tapping applies the theme immediately.
- Below, a row "Match system" with the hint "Dark-first when the phone is in dark mode, your light theme otherwise" and a Toggle. When on, the tiles still show which light theme is chosen; the dark tile is marked "Used in dark mode" (12.5 `--muted`).
- Strings (`settings.json`): `appearance.title` "Appearance", `appearance.warm` "Warm editorial", `appearance.minimal` "Minimal crisp", `appearance.dark` "Dark-first", `appearance.matchSystem` "Match system", `appearance.matchSystemHint`, `appearance.usedInDark` "Used in dark mode".

## 5. Icons

`icons.tsx` exports `Icon` (`<Icon name="basket" size={20} />`), one component per icon (`BasketIcon`), `ICON_PATHS` and the `IconName` type. The `icons/` folder has the same 20 as plain SVG files for native splash/notification use.

Grid 24 px, stroke 2, round caps and joins, `currentColor`, no fill except `star-fill` and the dots of `more`. Sizes in use: 24 dock, 22 dock when 4+ tabs, 20 field/leading, 18 list actions and chips, 16 inline in pill buttons, 14 chevrons inside chips.

| name | used for |
|---|---|
| `plus` | Add button, add chips, add result |
| `close` | clear search, dismiss chip, remove item, close sheet |
| `check` | checkbox, selected appearance tile, done states |
| `search` | search fields |
| `chevron-down` / `-right` / `-left` | unit chip, row disclosure, back links |
| `star` / `star-fill` | staple toggle off / on (`--star` when on) |
| `bookmark` | save as template |
| `template` | template rows and chips |
| `basket` | Shopping tab, Move N to Pantry |
| `pantry` | Pantry tab, "In Pantry" contexts |
| `recipes` | Recipes tab |
| `scan` | Scan tab, scan modes |
| `info` | help / info buttons |
| `trash` | destructive delete in editors |
| `more` | overflow menus |
| `sliders` | Settings, filters |
| `undo` | snackbar Undo |

Replace the current icon imports one-to-one; where an old icon has no equivalent (e.g. a filled tab icon), use the outline and the `--accent-tint` active background instead of a filled variant. Any icon still needed after the sweep: add it to `ICON_PATHS` with the same grid and stroke, and add it to the prototype's `ICONS` map so the sheet stays complete.

## 6. Migration

1. Add `themes.ts`, `ThemeProvider`, the pre-paint script, and the Appearance section. Ship with `warm` default.
2. Load fonts per theme: `THEME_META[id].fonts.google` is the Google Fonts query string; prefer self-hosting the six families with `@fontsource-variable/*` and loading only the active theme's two. Subset to Latin + Latin-ext (da/ro).
3. Sweep for hard-coded values: `grep -rn "#[0-9A-Fa-f]\{6\}\|border-radius: *[0-9]\|Bricolage\|DM Sans" apps packages` — everything found maps to a token above. The aisle tints from the shopping handoff (`#DDEBE2`/`#2E6A4D` etc.) stay as they are in the light themes; for `dark` use the same hue pairs with background at 20 % and text at 85 % lightness (add them as `aisleTints[themeId]` next to the tokens).
4. Replace icons (§5), delete the old icon folder.
5. Tests: snapshot each atom in the three themes (`applyTheme` in a `beforeEach`); a `resolveTheme` unit test for the four combinations; Settings test for persistence and the media-query listener.
6. Remove `tokens.ts` and the Bricolage/DM Sans font files.

## 7. Accessibility and edge cases

- Theme choice is a `radiogroup`; arrow keys move between tiles; the toggle is a `switch`.
- Focus rings use `--accent` with 2 px offset in every theme; in `dark` the mint ring passes 3:1 on all surfaces.
- `color-scheme` follows the theme so native pickers, scrollbars and the keyboard match.
- Reduce-motion disables the 200 ms theme transition and button press scale.
- Images and recipe photos: no filter in dark; the media-card gradient placeholder uses `--accent-tint` → `--butter`, which is already tuned per theme.
- Offline: the preference is local, nothing to sync. If the Family later wants a shared default, that is a server field; not in scope.

## 8. Open questions for the implementer to flag

- Keep "Match system" on by default (proposed) or off, so first launch always shows Warm?
- Self-host fonts (recommended, ~6 variable files) vs Google Fonts at runtime.
- Dark aisle tints: derive by the rule in §6.3 or hand-pick seven pairs?
- Should the Scan screen's camera chrome (always dark) take `dark`'s tokens regardless of theme? Proposed: yes.
