import { config } from "./config.constant";

const API_PATH = config.backendApiUrl;

export const API_ENDPOINTS = {
    ELECTRICITY: {
        USAGE: `${API_PATH}/electricity/usage`,
    },
    ACCOUNTS: {
        BASE: `${API_PATH}/accounts`,
    },
    TELEGRAM: {
        SEND_BALANCES: `${API_PATH}/telegram/send-balances`,
    },
} as const;
