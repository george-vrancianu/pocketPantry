/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin. Defaults to the page's own origin. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
