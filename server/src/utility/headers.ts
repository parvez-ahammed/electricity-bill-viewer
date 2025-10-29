// Utility for shared HTTP headers

export function getNESCOHeaders(): Record<string, string> {
    return {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-GB,en;q=0.9',
        'user-agent':
            'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
    };
} // Utility to generate DPDC API headers for both bearer and login endpoints
interface DPDCHeaderOptions {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any;
    accessToken?: string;
    cookie: string;
    referer: string;
}

export function getDPDCHeaders({
    config,
    accessToken,
    cookie,
    referer,
}: DPDCHeaderOptions): Record<string, string> {
    const baseHeaders: Record<string, string> = {
        accept: 'application/json, text/plain, */*',
        'accept-language': config.ACCEPT_LANGUAGE,
        'content-type': 'application/json;charset=UTF-8',
        'sec-ch-ua':
            '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        tenantcode: config.TENANT_CODE,
        cookie,
        Referer: referer,
    };

    if (accessToken) {
        baseHeaders.accesstoken = accessToken;
        baseHeaders.authorization = `Bearer ${accessToken}`;
    } else {
        baseHeaders.clientid = config.CLIENT_ID;
        baseHeaders.clientsecret = config.CLIENT_SECRET;
    }

    return baseHeaders;
}
