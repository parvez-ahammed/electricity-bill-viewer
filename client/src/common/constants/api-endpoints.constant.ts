import { config } from "./config.constant";

const API_PATH = config.backendApiUrl;

export const API_ENDPOINTS = {
    ELECTRICITY: {
        USAGE: `${API_PATH}/electricity/usage`,
    },
} as const;
