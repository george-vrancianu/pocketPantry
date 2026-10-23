type LinkVariable =
  | 'VITE_SIRI_SHORTCUT_URL'
  | 'VITE_SIRI_NEEDS_SHORTCUT_URL'
  | 'VITE_SIRI_GOT_SHORTCUT_URL'
  | 'VITE_SIRI_HAVE_SHORTCUT_URL';

/**
 * A Shortcut's iCloud link, set per deployment at build time. Read on each call, not at import, so
 * tests can drive it with `vi.stubEnv`. Undefined while unset or blank, so Settings shows "Link
 * coming soon" instead of a link.
 */
function shortcutUrl(name: LinkVariable): string | undefined {
  return import.meta.env[name]?.trim() || undefined;
}

/** The "Pantry add" Shortcut link. */
export const siriShortcutUrl = () => shortcutUrl('VITE_SIRI_SHORTCUT_URL');

/** The "Gator needs" Shortcut link. */
export const siriNeedsShortcutUrl = () =>
  shortcutUrl('VITE_SIRI_NEEDS_SHORTCUT_URL');

/** The "Gator got" Shortcut link. */
export const siriGotShortcutUrl = () =>
  shortcutUrl('VITE_SIRI_GOT_SHORTCUT_URL');

/**
 * The "Gator, do we have" Shortcut link (Pantry Questions). It has its own variable: the retired
 * "Pantry check" link (`VITE_SIRI_CHECK_SHORTCUT_URL`) is no longer read.
 */
export const siriHaveShortcutUrl = () =>
  shortcutUrl('VITE_SIRI_HAVE_SHORTCUT_URL');
