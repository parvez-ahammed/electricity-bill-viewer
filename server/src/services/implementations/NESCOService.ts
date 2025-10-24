import * as cheerio from 'cheerio';

import {
    ElectricityProvider,
    IProviderService,
    ProviderAccountDetails,
    ProviderAccountResult,
    ProviderBatchResult,
    ProviderCredential,
} from '../interfaces/IProviderService';

export class NESCOService implements IProviderService {
    private readonly config = {
        BASE_URL: 'https://customer.nesco.gov.bd',
        PANEL_ENDPOINT: '/pre/panel',
        MAX_RETRY_ATTEMPTS: 3,
        RETRY_DELAY_MS: 2000,
    };

    getProviderName(): ElectricityProvider {
        return ElectricityProvider.NESCO;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private formatDateToStandard(dateString: string): string {
        try {
            const cleanDate = dateString.trim();
            const datePattern =
                /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)/i;
            const match = cleanDate.match(datePattern);

            if (match) {
                const day = match[1];
                const month = match[2];
                const year = match[3];

                const monthMap: Record<string, string> = {
                    january: '01',
                    february: '02',
                    march: '03',
                    april: '04',
                    may: '05',
                    june: '06',
                    july: '07',
                    august: '08',
                    september: '09',
                    october: '10',
                    november: '11',
                    december: '12',
                };

                const monthNum =
                    monthMap[month.toLowerCase()] ||
                    new Date(`${month} 1, 2000`).getMonth() + 1;
                const paddedMonth =
                    typeof monthNum === 'string'
                        ? monthNum
                        : monthNum.toString().padStart(2, '0');
                const paddedDay = day.padStart(2, '0');

                return `${year}-${paddedMonth}-${paddedDay}`;
            }

            return cleanDate;
        } catch {
            return dateString;
        }
    }

    private formatPaymentDateToStandard(dateString: string): string {
        try {
            const cleanDate = dateString.trim();
            const datePattern =
                /(\d{1,2})-([A-Z]{3})-(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i;
            const match = cleanDate.match(datePattern);

            if (match) {
                const day = match[1];
                const month = match[2];
                const year = match[3];

                const monthMap: Record<string, string> = {
                    jan: '01',
                    feb: '02',
                    mar: '03',
                    apr: '04',
                    may: '05',
                    jun: '06',
                    jul: '07',
                    aug: '08',
                    sep: '09',
                    oct: '10',
                    nov: '11',
                    dec: '12',
                };

                const monthNum = monthMap[month.toLowerCase()] || '01';
                const paddedDay = day.padStart(2, '0');

                return `${year}-${monthNum}-${paddedDay}`;
            }

            return cleanDate;
        } catch {
            return dateString;
        }
    }

    /**
     * Simplified session management - extract cookies and CSRF token
     */
    private extractCookies(response: Response): string {
        // Type assertion for getSetCookie method (available in Node.js 19+)
        const headers = response.headers as Headers & {
            getSetCookie?: () => string[];
        };
        const setCookieHeaders = headers.getSetCookie?.() || [];
        const cookiePairs: string[] = [];

        setCookieHeaders.forEach((cookie: string) => {
            if (cookie.startsWith('XSRF-TOKEN=')) {
                const token = cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
                if (token) cookiePairs.push(`XSRF-TOKEN=${token}`);
            } else if (cookie.startsWith('customer_service_portal_session=')) {
                const session = cookie.match(
                    /customer_service_portal_session=([^;]+)/
                )?.[1];
                if (session)
                    cookiePairs.push(
                        `customer_service_portal_session=${session}`
                    );
            }
        });

        return cookiePairs.join('; ');
    }

    private extractCSRFToken(html: string): string {
        const $ = cheerio.load(html);
        return (
            $('input[name="_token"]').attr('value') ||
            $('meta[name="csrf-token"]').attr('content') ||
            ''
        );
    }

    private getHeaders(): Record<string, string> {
        return {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-language': 'en-GB,en;q=0.9',
            'user-agent':
                'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
        };
    }

    /**
     * Simplified data fetching - combines session and data fetch
     */
    private async fetchAccountData(customerNumber: string): Promise<string> {
        // Get initial page for CSRF token
        const initResponse = await fetch(
            `${this.config.BASE_URL}${this.config.PANEL_ENDPOINT}`,
            {
                headers: this.getHeaders(),
            }
        );

        if (!initResponse.ok) {
            throw new Error(
                `NESCO session fetch failed: ${initResponse.status} ${initResponse.statusText}`
            );
        }

        // Extract cookies and CSRF token
        const cookies = this.extractCookies(initResponse);
        const csrfToken = this.extractCSRFToken(await initResponse.text());

        if (!csrfToken) {
            throw new Error('Could not find CSRF token in HTML');
        }

        // Fetch account data
        const dataResponse = await fetch(
            `${this.config.BASE_URL}${this.config.PANEL_ENDPOINT}`,
            {
                method: 'POST',
                headers: {
                    ...this.getHeaders(),
                    'content-type': 'application/x-www-form-urlencoded',
                    cookie: cookies,
                    Referer: `${this.config.BASE_URL}${this.config.PANEL_ENDPOINT}`,
                    Origin: this.config.BASE_URL,
                },
                body: `_token=${csrfToken}&cust_no=${customerNumber}&submit=রিচার্জ+হিস্ট্রি`,
            }
        );

        if (!dataResponse.ok) {
            throw new Error(
                `NESCO API request failed: ${dataResponse.status} ${dataResponse.statusText}`
            );
        }

        const htmlData = await dataResponse.text();

        return htmlData;
    }

    /**
     * Simplified data extraction using positional mapping like the script
     */
    private parseAccountData(
        html: string,
        username?: string
    ): ProviderAccountDetails {
        const $ = cheerio.load(html);

        const data: ProviderAccountDetails = {
            accountId: '',
            customerNumber: '',
            customerName: '',
            provider: 'NESCO',
            accountType: 'Prepaid',
            balanceRemaining: '',
            connectionStatus: '',
            lastPaymentAmount: '',
            lastPaymentDate: '',
            balanceLatestDate: '',
            location: '',
            mobileNumber: '',
            minRecharge: null,
        };

        // Extract all disabled input values in order
        const inputValues: string[] = [];

        $('input[disabled]').each((_, el) => {
            const value = $(el).attr('value')?.trim();
            if (value) {
                inputValues.push(value);
            }
        });

        // Map values by position based on HTML structure analysis
        if (inputValues.length >= 14) {
            data.customerName = inputValues[0]; // Position 0: Customer Name
            data.location = inputValues[1]; // Position 1: Address
            data.mobileNumber = inputValues[2]; // Position 2: Mobile
            data.customerNumber = inputValues[5]; // Position 5: Consumer Number
            data.accountId = inputValues[6]; // Position 6: Meter Number
            data.connectionStatus = inputValues[10]; // Position 10: Meter Status
            data.minRecharge = inputValues[12]; // Position 12: Min Recharge
            data.balanceRemaining = inputValues[13]; // Position 13: Balance
        }

        // Extract balance date from the label text
        const balanceLabel = $('label:contains("অবশিষ্ট ব্যালেন্স")').text();
        const timeMatch = balanceLabel.match(
            /(\d{1,2}\s+\w+\s+\d{4}\s+\d{1,2}:\d{2}:\d{2}\s+(?:AM|PM))/i
        );
        if (timeMatch) {
            data.balanceLatestDate = this.formatDateToStandard(timeMatch[1]);
        }

        // Extract recharge history using cheerio
        $('tbody.text-center tr').each((i, row) => {
            const $row = $(row);
            const cells = $row.find('td');

            if (cells.length >= 14) {
                const rechargeAmount = $(cells[10]).text().trim();
                const rechargeDate = $(cells[13]).text().trim();

                if (rechargeDate && rechargeAmount && i === 0) {
                    // Use first (most recent) record for last payment info
                    data.lastPaymentAmount = rechargeAmount;
                    data.lastPaymentDate =
                        this.formatPaymentDateToStandard(rechargeDate);
                }
            }
        });

        // Set customer number from input if not extracted
        if (!data.customerNumber && username) {
            data.customerNumber = username;
        }

        return data;
    }

    async getAccountInfo(
        username: string,
        password: string,
        retryCount: number = 0
    ): Promise<ProviderAccountResult> {
        const attemptNumber = retryCount + 1;
        const maxAttempts = this.config.MAX_RETRY_ATTEMPTS;

        try {
            // Simplified: fetch data directly using the combined approach
            const htmlResponse = await this.fetchAccountData(username);
            const accountData = this.parseAccountData(htmlResponse, username);

            // Validate that we got essential data
            if (!accountData.customerNumber || !accountData.accountId) {
                throw new Error(
                    'No account information found in NESCO response'
                );
            }

            return {
                success: true,
                username,
                accounts: [accountData],
                attempts: attemptNumber,
            };
        } catch (error: unknown) {
            if (retryCount < maxAttempts - 1) {
                const retryDelay = this.config.RETRY_DELAY_MS;
                await this.sleep(retryDelay);

                return this.getAccountInfo(username, password, retryCount + 1);
            } else {
                const errorMsg =
                    error instanceof Error ? error.message : 'Unknown error';
                return {
                    success: false,
                    error: errorMsg,
                    username,
                    accounts: [],
                    attempts: maxAttempts,
                };
            }
        }
    }

    async getMultipleAccountsInfo(
        credentials: ProviderCredential[]
    ): Promise<ProviderBatchResult> {
        const allAccounts: ProviderAccountDetails[] = [];
        const failedLogins: Array<{
            username: string;
            error: string;
            attempts: number;
        }> = [];

        for (let i = 0; i < credentials.length; i++) {
            const { username, password } = credentials[i];

            const result = await this.getAccountInfo(username, password);

            if (result.success) {
                allAccounts.push(...result.accounts);
            } else {
                failedLogins.push({
                    username,
                    error: result.error || 'Unknown error',
                    attempts: result.attempts,
                });
            }

            if (i < credentials.length - 1) {
                await this.sleep(2000);
            }
        }

        return {
            totalCredentials: credentials.length,
            successfulLogins: credentials.length - failedLogins.length,
            totalAccounts: allAccounts.length,
            accounts: allAccounts,
            failedLogins,
        };
    }
}
