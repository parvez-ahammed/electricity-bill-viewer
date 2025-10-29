/**
 * fetchHelper: Utility for HTTP requests (POST, GET, etc.)
 * Usage: fetchHelper.post(url, headers, body)
 */
export const fetchHelper = {
    async post(url: string, headers: Record<string, string>, body?: string) {
        return fetch(url, {
            method: 'POST',
            headers,
            body,
        });
    },
    async get(url: string, headers: Record<string, string>) {
        return fetch(url, {
            method: 'GET',
            headers,
        });
    },
};
