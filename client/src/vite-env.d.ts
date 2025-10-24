/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_API_PATH: string;
    readonly VITE_ELECTRICITY_CREDENTIALS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
