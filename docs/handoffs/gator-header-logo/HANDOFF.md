# Gator logo in the header — design handoff

Status: approved (variant A · Beside the greeting, icon-tile mark, refresh on every tab). Date: 2026-10-25.
Reference prototype: `prototype.html` (self-contained, open in a browser; live at https://claude.ai/artifact/R78MeobSbZtGoSjz6MRVjd). It opens on the chosen variant; B and C are kept for reference. The prototype is the source of truth for look, spacing and timing and paints with the approved tokens from `docs/themes/themes.ts`.

Depends on: `gator-finish/` (Soft clay finish, light rim on dark surfaces), `gator-motion/` (Tap variant, rig classes), `themes/` (tokens).

Code touched: `packages/ui/src/organisms/AppScreenHeader.tsx` (new `leading` slot), `packages/ui/src/atoms/GatorLogo.tsx` (new), `packages/ui/src/assets/gator/gator-app-icon-static.svg` + `-tap.svg` (new, in `svg/`), `apps/web/src/pages/Dashboard/components/DashboardHeader.tsx` (greeting layout), `apps/web/src/lib/refresh.ts` (new `useRefreshScreen`), `apps/web/src/i18n/locales/{en,ro,da}/screenHeader.json`. **No API change.**

## Decisions (2026-10-25)

Agreed in review against the code, `GLOSSARY.md` and the ADRs. Where these contradict the sections below, these win. "Home" below means the Dashboard (the glossary's term) or the Dock's Home tab.

**Where it goes**

1. **Tab roots only: the Dashboard, Pantry, Shopping List and Recipes**, the four Dock tabs. Meal Plans (reached from its Widget), Settings (reached from the Dashboard's gear; it has no back link) and every sub-screen keep their header as it is. This answers open question 2.
2. **ADR 0027 is amended**: the leading mark on a tab root refreshes the screen; it adds nothing and navigates nowhere, so it does not count toward the one-button rule.
3. **Real paths.** `ScreenHeader` (`packages/ui/src/molecules/ScreenHeader.tsx`) gets the `leading` slot; `AppScreenHeader` is `apps/web/src/components/AppScreenHeader.tsx`. There is no `DashboardHeader`: the Dashboard's header is inline in `DashboardPage.tsx`. Gator art lives in `packages/ui/src/gator/art/`.

**The mark**

4. **`GatorLogo` is a new inline-SVG component in `packages/ui/src/gator/`**, beside `Gator`, drawn from `svg/gator-app-icon-static.svg` (head clipped inside the tile). It is not the existing `<Gator mood="app-icon">`, whose drawing lets the head out of the tile and which plays `<img>` files, so CSS cannot reach the Dark rim or the motion classes. The Dark rim (§2) applies as specified.
5. **It idles, overriding §2 "At rest: Still".** Breathe, blink and hat sway only, ported from the existing `app-icon` idle (`breathe`, `blink`, `hatSway`); no bubbles, steam, ripple, twinkle or wag. The tile never moves. Two idling Gators on the Dashboard (the logo and the Health Widget's) is fine: the "one animated Gator per screen" rule is dropped.
6. **Entrance once per app load**: the first tab-root header to mount plays the full entrance (tile pops in, head rises, hat lands; 1.3 s, ported from the `app-icon` entrance: `tileInOnce`, `riseUpOnce`, `popInOnce`, `lateInOnce`); headers mounted later in the same load start in idle. A reload plays it again.
7. **Tap → Tap motion + haptic + refetch** (§4.1). **When the refetch succeeds, the head re-enters**: it rises from the tile and the hat lands, the tile stays put, then idle. A failed refresh goes straight back to idle. A tap during any entrance (app load or re-entrance) cuts it and plays the Tap; a tap while fetching only hops (§4.1).
8. **No `busy` blink and no `busy` class**: the idle already blinks, and busy shows on the status line and the content fade. Drop the `animationend` → `busy` handover from §4.2 and §6.
9. **Reduced motion: a still mark.** No entrance, idle, Tap or re-entrance. The refresh, status line and fade still run.
10. **The implementer ports the keyframes** to the clipped rig; review is a Storybook story with rest, entrance, tap, re-entrance and Dark.

**The Dashboard header** (§3.1)

11. Leading `GatorLogo` 42 pt. Text: the greeting at **21 pt** with today's copy ("Good evening", no first name), and the status line under it, whose resting text is today's date (it moves from above the greeting to below). Trailing: **Customise and the Settings gear**, unchanged. There is no avatar.

**Refresh** (§4)

12. **`useRefreshScreen()` takes no keys**: it refetches every active query (`refetchQueries({ type: 'active' })`), which is every query the screen shows. Drop the per-screen key lists; their names do not match `lib/queryKeys.ts` anyway. Queries mounted outside the page (the Dock, the voice inbox) refetch too; that is harmless.
13. **The refresh state lives in one provider at `AppLayout` level**, read by the header (status line, mark) and by the content region (the 0.55 opacity fade), so pages don't each wrap themselves.
14. **No pull-to-refresh.** None exists today; it stays out of scope. A later one calls the same `run`.
15. **No resting text on the tab roots**: drop `42 items · updated 9:36` and `updated {{time}}` (`refresh.at`). The status line's 18 pt is reserved under the title and shows only busy, done and failed. This answers open question 3.
16. **Copy**: `refresh.button` is **Refresh** (ro, da to translate); `refresh.failed` is **Couldn't refresh · showing what you had** (ro, da to translate). `busy` and `done` as in §4.3.
17. **No Flutter app exists**: drop open question 1.

---

## 1. Summary of the change

The app icon (the clay Gator head rising out of the olive tile) becomes the app's logo in the top bar of every screen with a header: Home, Pantry, Shopping, Recipes, Meal plan, Settings. It is a button. Tapping it plays the Gator's Tap animation (0.9 s) and refetches every query the screen shows. On Home the greeting moves next to the logo and drops one size so the bar keeps its 48 pt height.

## 2. The mark

| Property | Value |
|---|---|
| Asset | `svg/gator-app-icon-static.svg` (at rest) and `svg/gator-app-icon-tap.svg` (plays the Tap once, then rests). Both share viewBox `0 0 200 200`, ids suffixed `-app-icon`. Same drawing as the App icon card on the "Gator in Clay" page. |
| Size | **42 × 42 pt** on Home (variant A, `big`), **38 × 38 pt** in every other `AppScreenHeader`. Corner radius follows the tile (rx 44 of 200 → 9.2 pt at 42 pt), nothing to add in CSS. |
| Hit target | 48 × 48 pt (Home) / 44 × 44 pt, centred on the mark, no visible background. |
| Themes | The tile keeps its own gradient (#6C7D37 → #4F5D25) and the 14 % white inner stroke in all three themes. On the **Dark** theme remove the `claySoft` drop-shadow filter from `.head` and stroke the head path (`.hd`) #9FD36A, 2.5 px, 35 % opacity (gator-finish handoff). In the prototype this is the `[data-dark] .lg .rig{filter:none}` / `.hd{stroke…}` pair. |
| At rest | **Still.** No idle loop in the header: the rule is one animated Gator per screen, and Home may already have one in the Health widget. |
| Reduced motion | No hop; the refresh still runs and the status line still changes. |

Prefer inlining the SVG (the `GatorLogo` component) so the theme rule and the animation classes can be applied from CSS; the `-tap.svg` file is for places that can only show an `<img>` (Flutter, email, Storybook). To replay the file version, reset `src` with a new query string.

## 3. Header layout

### 3.1 Home (`DashboardHeader`) — variant A

Row, `align-items: center`, gap 10 pt, padding 4 6 0, min-height 48 pt, inside the existing 14 pt screen padding.

| Slot | Spec |
|---|---|
| Leading | `GatorLogo` 42 pt in a 48 pt button. |
| Text (flex 1, min-width 0) | Greeting `Evening, George` display face **21 pt** (was 28), `--display-w`, `--display-ls`, line-height 1.05, single line, ellipsis. Under it the **status line** (§4.3), 12.5 / 600 `--muted`, min-height 18 pt. |
| Trailing (`margin-left: auto`, gap 8) | Customise `circ` 38 pt (`sliders`), avatar 38 pt. Unchanged. |

The greeting has roughly 16 characters of room on a 390 pt screen before it truncates. Nothing below the header moves; the widget grid starts where it does today.

### 3.2 Every other screen (`AppScreenHeader`)

Add a `leading` slot rendered before the title. When the page passes `<GatorLogo />` the row is: logo 38 pt (44 pt button) · title (display 28, unchanged) with the status line (§4.3) under it · trailing actions. Screens with a back link (Settings, detail pages) keep the back link and do **not** show the logo; the logo lives on tab roots only.

Pantry's status line reads `42 items · updated 9:36` at rest (count from the loaded list, time of the last successful fetch, `HH:mm` in the Member's locale). Shopping: `7 to buy · updated 9:36`. Recipes: `updated 9:36`. Meal plan: `updated 9:36`.

## 4. Tap → refresh

### 4.1 Sequence

| When | What happens |
|---|---|
| Tap (0 ms) | 10 ms haptic (`navigator.vibrate(10)` on web; light impact on native). `GatorLogo` gets class `poke`: `.head` runs `boingOnce`, `.hat` `hatHopOnce`, `.eye` `squintOnce`, all 0.9 s linear once (keyframes in `svg/gator-app-icon-tap.svg` and in the prototype). The tile does not move; the head hops inside the tile's clip. `useRefreshScreen()` invalidates and refetches every query key the screen is subscribed to. |
| While fetching | Status line → spinner (11 pt, 2 px, `--line-strong` track, `--accent` arc, 0.8 s) + `Refreshing…`. Content region gets `opacity: .55` over 250 ms, **keeping its numbers** so nothing jumps. If the fetch is still running when the hop ends (0.9 s), the Gator blinks every 1.6 s (`.busy .eye{animation:blink 1.6s infinite}`) until it finishes. |
| Done | Opacity back to 1 over 250 ms with the new data. Status line → check (13 pt, stroke 3) + `Updated just now` in `--accent-on-tint`, held 2.5 s, then back to the resting text. Rings, counts and bars animate to their new values the way they already do on Home. |
| Failed (offline or any query errors) | Status line → `Couldn't refresh · showing cached data` in `--soon-fg`, held 4 s, then back. No toast. Cached data stays on screen. |
| Tap while fetching | Hop again (restart the `poke` classes), no second fetch; the one in flight continues. |

Pull-to-refresh stays as it is and drives the same status line.

### 4.2 `useRefreshScreen`

```ts
// apps/web/src/lib/refresh.ts
export function useRefreshScreen(keys: QueryKey[]) {
  const qc = useQueryClient();
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'failed'>('idle');
  const run = useCallback(async () => {
    if (state === 'busy') return;                 // one fetch in flight
    setState('busy');
    const results = await Promise.allSettled(keys.map(k => qc.refetchQueries({ queryKey: k, type: 'active' })));
    const failed = results.some(r => r.status === 'rejected')
      || keys.some(k => qc.getQueryState(k)?.status === 'error');
    setState(failed ? 'failed' : 'done');
    setTimeout(() => setState('idle'), failed ? 4000 : 2500);
  }, [keys, qc, state]);
  return { state, run };
}
```

Each tab root passes its own keys (Home: every widget's key plus `dashboardLayout`; Pantry: `pantry`, `staples`; Shopping: `shoppingList`, `templates`; Recipes: `recipes`, `cookTonight`; Meal plan: `mealPlan` for the visible week). The `GatorLogo` button calls `run` and sets `poke` on itself; it reads `state === 'busy'` to add `busy` after the hop ends (`animationend` of `boingOnce`).

### 4.3 Status line copy (`screenHeader` namespace)

| Key | en | ro | da |
|---|---|---|---|
| `refresh.button` | PocketPantry · refresh | PocketPantry · reîmprospătează | PocketPantry · opdater |
| `refresh.busy` | Refreshing… | Se reîmprospătează… | Opdaterer… |
| `refresh.done` | Updated just now | Actualizat chiar acum | Opdateret lige nu |
| `refresh.failed` | Couldn't refresh · showing cached data | Nu s-a putut reîmprospăta · se afișează datele salvate | Kunne ikke opdatere · viser gemte data |
| `refresh.at` | updated {{time}} | actualizat {{time}} | opdateret {{time}} |

Home's resting text stays the date line it has today (`Thursday 15 October`, long weekday + day + month in the Member's locale).

## 5. Accessibility

- The logo is a `<button type="button">` with `aria-label` = `refresh.button`. It is the first focusable element in the header; focus ring 2 px `--accent`, offset 2 pt, square with the tile's radius.
- The status line is `role="status"` (`aria-live="polite"`), so VoiceOver reads "Refreshing…" and "Updated just now" without the gesture that pull-to-refresh needs.
- `prefers-reduced-motion`: no hop, no spinner rotation (static dot), the opacity fade stays (it is 250 ms and conveys state).
- Contrast: the status check uses `--accent-on-tint` on `--bg` (Warm 5.9:1, Dark 9.8:1); the failed text uses `--soon-fg` (Warm 6.4:1).

## 6. Tests

- `GatorLogo`: click calls `run` once per tap; a second click during `busy` restarts the animation classes but does not call `refetchQueries` again; `animationend` of `boingOnce` removes `poke` and, if still busy, adds `busy`.
- `useRefreshScreen`: `done` after all keys settle; `failed` if any query ends in `error`; timers return to `idle` at 2.5 s / 4 s.
- `DashboardHeader`: greeting at 21 pt with the logo present; long first name truncates with an ellipsis and keeps the actions in place.
- Snapshots in the three themes: Home header at rest, busy, done, failed; Pantry header at rest; Dark theme shows the rim and no drop shadow.

## 7. Open questions for the implementer to flag

- Flutter: the head's hop is CSS on inline SVG. On Flutter use the Lottie/Rive export of the Tap variant from the gator-motion handoff, or swap `-static.svg` → `-tap.svg` as an image for 0.9 s.
- Should Settings (reached from Home via the sliders icon, with a back link) also show the logo? This handoff says no, tab roots only.
- Whether "updated HH:mm" is wanted on Recipes and Meal plan, whose data changes rarely; dropping the status line there is fine, the bar then shows the title alone.
