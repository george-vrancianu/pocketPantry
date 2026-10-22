/**
 * Where a Member gets the "Pantry add" Shortcut (an iCloud link), set per deployment at build time.
 * Read on each call, not at import, so tests can drive it with `vi.stubEnv`. Undefined while unset
 * or blank, so the Settings link stays hidden.
 */
export function siriShortcutUrl(): string | undefined {
  return import.meta.env.VITE_SIRI_SHORTCUT_URL?.trim() || undefined;
}

/**
 * The same for the "Pantry check" Shortcut, which asks the same Assistant Request endpoint
 * (set at build time, read on each call, undefined while unset or blank).
 */
export function siriCheckShortcutUrl(): string | undefined {
  return import.meta.env.VITE_SIRI_CHECK_SHORTCUT_URL?.trim() || undefined;
}
