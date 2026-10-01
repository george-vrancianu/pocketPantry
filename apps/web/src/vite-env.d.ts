/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin. Defaults to the current hostname on port 3000. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
