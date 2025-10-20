import { config } from "./config.constant";

const API_PATH = config.backendApiUrl;

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_PATH}/auth/login`,
        SIGNUP: `${API_PATH}/auth/register`,
        UPDATE_PASSWORD: `${API_PATH}/auth/update-password`,
    },
    USER: {
        ALL: `${API_PATH}/users`,
        SINGLE: (userId: string) => `${API_PATH}/users/${userId}`,
        UPDATE: (userId: string) => `${API_PATH}/users/${userId}`,
        DELETE: (userId: string) => `${API_PATH}/users/${userId}`,
        USERNAME: (username: string) =>
            `${API_PATH}/users/username/${username}`,
    },
};
