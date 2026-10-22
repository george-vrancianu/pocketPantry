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
   * iCloud link to the "Pantry check" Shortcut (see docs/siri-shortcut.md). The Settings Siri
   * section links to it; the link is hidden while this is unset or empty.
   */
  readonly VITE_SIRI_CHECK_SHORTCUT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
