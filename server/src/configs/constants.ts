
export const NESCO = {
    BASE_URL: 'https://customer.nesco.gov.bd',
    PANEL_ENDPOINT: '/pre/panel',
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 2000,
};

export const DPDC = {
    BASE_URL: 'https://amiapp.dpdc.org.bd',
    BEARER_ENDPOINT: '/auth/login/generate-bearer',
    LOGIN_ENDPOINT: '/auth/login',
    CLIENT_ID: 'auth-ui',
    TENANT_CODE: 'DPDC',
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 2000,
    ACCEPT_LANGUAGE: 'en-GB,en;q=0.9',
};
