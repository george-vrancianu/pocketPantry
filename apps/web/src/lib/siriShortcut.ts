/**
 * Where a Member gets the "Pantry add" Shortcut (an iCloud link), set per deployment at build time.
 * Read on each call, not at import, so tests can drive it with `vi.stubEnv`. Undefined while unset
 * or blank, so the Settings link stays hidden.
 */
export function siriShortcutUrl(): string | undefined {
  return import.meta.env.VITE_SIRI_SHORTCUT_URL?.trim() || undefined;
}
