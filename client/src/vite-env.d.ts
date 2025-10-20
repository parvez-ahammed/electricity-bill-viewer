/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_API_PATH: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
