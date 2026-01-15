/// <reference types="vite/client" />

// Audio file declarations
declare module '*.mp3' {
  const src: string;
  export default src;
}

// Video file declarations
declare module '*.mp4' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_GTM_ID: string,
  readonly VITE_IS_MULTILINGUAL: string,
  readonly VITE_HAS_MULTILINGUAL_URL: string,
  readonly VITE_MULTILINGUAL_DEFAULT_LOCALE: string,
  readonly VITE_APP_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
