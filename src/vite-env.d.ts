/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KODI_HOST: string;
  readonly VITE_KODI_JSONRPC_PATH: string;
  readonly VITE_KODI_USERNAME?: string;
  readonly VITE_KODI_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
