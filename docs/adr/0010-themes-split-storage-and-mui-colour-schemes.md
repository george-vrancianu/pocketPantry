# Theme is a Member Preference, Match system is per device, and MUI colour schemes apply them

The "Themes & icons" handoff (`docs/handoffs/themes/handoff.md` §2) stores the whole appearance preference on the device and applies a Theme with its own `applyTheme`, which writes every token as a CSS custom property on `<html>`, plus its own inline script. We want the chosen Theme to follow a Member across devices, as their locale already does, while a phone and a laptop can still disagree about following the system's dark mode. The app already renders through MUI, which has colour schemes over CSS variables built in.

## Decision

- **Theme** is a Member Preference, stored on the Member next to the locale. The server is the source of truth. A `null` value means the Member never chose, so the default applies. Changes are optimistic: the Theme applies and is cached at once, then saved.
- **Match system** is per device, not a Member Preference. The device keeps both values under the single `localStorage` key `pp.appearance` (`{ theme, matchSystem }`), so it can apply a Theme before the Member Preferences load and on unauthenticated screens.
- The three Themes are MUI colour schemes named `warm`, `minimal` and `dark`, built from the handoff's flat theme record with CSS variables. The scheme is chosen by `data-theme="<id>"` on the root, and any subtree can be forced into another scheme with the same attribute.
- Colour tokens live in each scheme's palette (MUI's standard keys where one matches, custom keys under `palette.pp` otherwise). Non-colour tokens (radii, border widths, shadows, fonts) are `--pp-*` variables written per scheme selector, because MUI doesn't vary them per scheme.
- A custom MUI storage manager is the only code that knows MUI's storage layout. It maps `pp.appearance` onto MUI's mode (`system` with Match system on, otherwise the chosen Theme's light or dark scheme) and always seeds both scheme slots explicitly (light ← the chosen light Theme, dark ← `dark`), so MUI's own mode logic reproduces the handoff's `resolveTheme`.
- An inline script in the HTML entry, generated from the appearance module, applies the Theme and `theme-color` before React mounts.

## Alternatives rejected

- **Device-only preference, as in the handoff.** A Member would have to choose their Theme again on every device.
- **Match system as a Member Preference too.** A phone that follows the system and a desktop that doesn't would keep overwriting each other.
- **The handoff's `applyTheme` and inline script.** MUI would keep rendering from its own static palette, so every component would have to read the custom properties by hand, and nothing would catch a Theme missing a token. MUI's schemes give `theme.vars`, the `color-scheme` property and forced subtrees for free.
- **MUI's `InitColorSchemeScript`.** It renders nothing outside server rendering, so it does nothing in this client-only Vite app.

## Consequences

- Code inside a forced subtree (the Scan screen) must read `theme.vars`, never `theme.palette.mode`, because the theme object describes the root's scheme.
- MUI only builds the palettes of the default scheme and the built-in `light`/`dark`. Any other custom scheme (`minimal`) must be passed already built with `createColorScheme`.
- MUI's own writes through `setMode`/`setColorScheme` are ignored; the app changes appearance only through the appearance module.
- Typography font families point at `--pp-*` variables, since MUI does not turn typography into per-scheme variables.
