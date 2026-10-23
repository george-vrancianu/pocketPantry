/**
 * Where a Member gets the "Pantry add" Shortcut (an iCloud link), set per deployment at build time.
 * Read on each call, not at import, so tests can drive it with `vi.stubEnv`. Undefined while unset
 * or blank, so the Settings link stays hidden.
 */
export function siriShortcutUrl(): string | undefined {
  return import.meta.env.VITE_SIRI_SHORTCUT_URL?.trim() || undefined;
}

/**
 * The same for the "Gator, do we have" Shortcut (Pantry Questions), which uses the same Assistant
 * Request endpoint. The variable keeps its name from the earlier "Pantry check" Shortcut it replaces.
 */
export function siriCheckShortcutUrl(): string | undefined {
  return import.meta.env.VITE_SIRI_CHECK_SHORTCUT_URL?.trim() || undefined;
}

/** The "Gator needs" Shortcut link (build time, read on each call, undefined while unset or blank). */
export function siriNeedsShortcutUrl(): string | undefined {
  return import.meta.env.VITE_SIRI_NEEDS_SHORTCUT_URL?.trim() || undefined;
}

/** The "Gator got" Shortcut link (same rules). */
export function siriGotShortcutUrl(): string | undefined {
  return import.meta.env.VITE_SIRI_GOT_SHORTCUT_URL?.trim() || undefined;
}
