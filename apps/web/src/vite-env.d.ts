/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin. Defaults to the page's own origin. */
  readonly VITE_API_URL?: string;
  /**
   * iCloud link to the "Pantry add" Shortcut (see docs/siri-shortcut.md). The Settings Siri section
   * links to it; the link is hidden while this is unset or empty.
   */
  readonly VITE_SIRI_SHORTCUT_URL?: string;
  /**
   * iCloud link to the "Gator, do we have" Shortcut (see docs/siri-shortcut.md; the name is kept
   * from the "Pantry check" Shortcut it replaces). Hidden while this is unset or empty.
   */
  readonly VITE_SIRI_CHECK_SHORTCUT_URL?: string;
  /** iCloud link to the "Gator needs" Shortcut. Hidden while unset or empty. */
  readonly VITE_SIRI_NEEDS_SHORTCUT_URL?: string;
  /** iCloud link to the "Gator got" Shortcut. Hidden while unset or empty. */
  readonly VITE_SIRI_GOT_SHORTCUT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
