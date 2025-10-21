import * as fs from 'fs';
import * as path from 'path';

import { INESCOService } from '../interfaces/INESCOService';
import {
    ElectricityProvider,
    ProviderAccountDetails,
    ProviderAccountResult,
    ProviderBatchResult,
    ProviderCredential,
} from '../interfaces/IProviderService';

export class NESCOService implements INESCOService {
    private readonly config = {
        BASE_URL: 'https://customer.nesco.gov.bd',
        LOGIN_ENDPOINT: '/login',
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

    private saveDebugHTML(html: string, customerNumber: string): void {
        try {
            const filename = `nesco_response_${customerNumber}_${Date.now()}.html`;
            const filepath = path.join(process.cwd(), 'debug', filename);

            // Ensure debug directory exists
            const debugDir = path.dirname(filepath);
            if (!fs.existsSync(debugDir)) {
                fs.mkdirSync(debugDir, { recursive: true });
            }

            fs.writeFileSync(filepath, html, 'utf-8');
            console.log(`Debug HTML saved to: ${filepath}`);
        } catch (error) {
            console.warn('Failed to save debug HTML:', error);
        }
    }

    private logAccountData(accountData: ProviderAccountDetails): void {
        if (
            process.env.NODE_ENV === 'development' ||
            process.env.DEBUG_NESCO === 'true'
        ) {
            console.log(
                '\n📊 EXTRACTED ACCOUNT DATA (ProviderAccountDetails Format):'
            );
            console.log('━'.repeat(80));
            console.log(
                `Account ID           : ${accountData.accountId || 'N/A'}`
            );
            console.log(
                `Customer Number      : ${accountData.customerNumber || 'N/A'}`
            );
            console.log(
                `Customer Name        : ${accountData.customerName || 'N/A'}`
            );
            console.log(`Provider             : ${accountData.provider}`);
            console.log(`Account Type         : ${accountData.accountType}`);
            console.log(
                `💰 Balance Remaining : ${accountData.balanceRemaining || 'N/A'} Tk`
            );
            console.log(
                `Connection Status    : ${accountData.connectionStatus || 'N/A'}`
            );
            console.log(
                `Last Payment Amount  : ${accountData.lastPaymentAmount || 'N/A'} Tk`
            );
            console.log(
                `Last Payment Date    : ${accountData.lastPaymentDate || 'N/A'}`
            );
            console.log(
                `⏰ Balance Latest Date: ${accountData.balanceLatestDate || 'N/A'}`
            );
            console.log(
                `Location             : ${accountData.location || 'N/A'}`
            );
            console.log(
                `Mobile Number        : ${accountData.mobileNumber || 'N/A'}`
            );
            console.log(
                `💵 Min Recharge      : ${accountData.minRecharge || 'N/A'} Tk`
            );
            console.log('━'.repeat(80));
        }
    }

    private formatDateToStandard(dateString: string): string {
        try {
            const cleanDate = dateString.trim();
            const datePattern =
                /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)/i;
            const match = cleanDate.match(datePattern);

            if (match) {
                const [, day, month, year] = match;

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
                const [, day, month, year] = match;

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
     * Fetches cookies and CSRF token from NESCO by making a GET request to the panel endpoint
     * @returns {Promise<{cookies: string, csrfToken: string}>}
     */
    private async fetchNESCOSession(): Promise<{
        cookies: string;
        csrfToken: string;
    }> {
        const url = `${this.config.BASE_URL}${this.config.PANEL_ENDPOINT}`;

        const response = await fetch(url, {
            headers: {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'accept-language': 'en-GB,en;q=0.9',
                'cache-control': 'max-age=0',
                'user-agent':
                    'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
                'sec-ch-ua':
                    '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '"Android"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
            },
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(
                `NESCO session fetch failed: ${response.status} ${response.statusText}`
            );
        }

        // Extract cookies from Set-Cookie headers
        let setCookieHeaders: string[] = [];

        // Try getSetCookie() first (newer Fetch API), fallback to iterating headers
        const headersWithGetSetCookie = response.headers as Headers & {
            getSetCookie?: () => string[];
        };

        if (typeof headersWithGetSetCookie.getSetCookie === 'function') {
            setCookieHeaders = headersWithGetSetCookie.getSetCookie();
        } else {
            // Fallback: collect all set-cookie headers manually
            response.headers.forEach((value, key) => {
                if (key.toLowerCase() === 'set-cookie') {
                    setCookieHeaders.push(value);
                }
            });
        }

        // Parse cookies
        let xsrfToken = '';
        let sessionCookie = '';

        setCookieHeaders.forEach((cookie) => {
            if (cookie.startsWith('XSRF-TOKEN=')) {
                const match = cookie.match(/XSRF-TOKEN=([^;]+)/);
                if (match) xsrfToken = match[1];
            } else if (cookie.startsWith('customer_service_portal_session=')) {
                const match = cookie.match(
                    /customer_service_portal_session=([^;]+)/
                );
                if (match) sessionCookie = match[1];
            }
        });

        // Get HTML content to extract CSRF token from the form
        const htmlContent = await response.text();

        // Extract CSRF token from the HTML (look for _token input field or meta tag)
        let csrfToken = '';

        // Try method 1: Look for <input name="_token" value="...">
        const tokenInputMatch = htmlContent.match(
            /<input[^>]*name="_token"[^>]*value="([^"]+)"/i
        );
        if (tokenInputMatch) {
            csrfToken = tokenInputMatch[1];
        } else {
            // Try method 2: Look for <meta name="csrf-token" content="...">
            const tokenMetaMatch = htmlContent.match(
                /<meta[^>]*name="csrf-token"[^>]*content="([^"]+)"/i
            );
            if (tokenMetaMatch) {
                csrfToken = tokenMetaMatch[1];
            } else {
                throw new Error('Could not find CSRF token in HTML');
            }
        }

        // Build cookie string for subsequent requests
        const cookies = `XSRF-TOKEN=${xsrfToken}; customer_service_portal_session=${sessionCookie}`;

        return { cookies, csrfToken };
    }

    private async fetchNESCOData(
        customerNumber: string,
        cookies: string,
        csrfToken: string
    ): Promise<string> {
        const response = await fetch(
            `${this.config.BASE_URL}${this.config.PANEL_ENDPOINT}`,
            {
                headers: {
                    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7',
                    'cache-control': 'max-age=0',
                    'content-type': 'application/x-www-form-urlencoded',
                    'user-agent':
                        'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1',
                    cookie: cookies,
                    Referer: `${this.config.BASE_URL}${this.config.PANEL_ENDPOINT}`,
                    Origin: this.config.BASE_URL,
                },
                body: `_token=${csrfToken}&cust_no=${customerNumber}&submit=%E0%A6%B0%E0%A6%BF%E0%A6%9A%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%9C+%E0%A6%B9%E0%A6%BF%E0%A6%B8%E0%A7%8D%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A6%BF`,
                method: 'POST',
            }
        );

        if (!response.ok) {
            throw new Error(
                `NESCO API request failed: ${response.status} ${response.statusText}`
            );
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('text/html')) {
            throw new Error(
                `Unexpected content type from NESCO API: ${contentType}`
            );
        }

        const htmlData = await response.text();

        // Save debug HTML if in development mode
        if (
            process.env.NODE_ENV === 'development' ||
            process.env.DEBUG_NESCO === 'true'
        ) {
            this.saveDebugHTML(htmlData, customerNumber);
        }

        return htmlData;
    }

    private extractAccountData(
        html: string,
        username?: string
    ): ProviderAccountDetails {
        const accountData: ProviderAccountDetails = {
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

        // Extract data by finding all disabled input fields and analyzing their values
        // This approach works regardless of language (English/Bangla)
        const allInputs = html.match(/<input[^>]*>/gi) || [];
        const disabledInputs = allInputs.filter((input) =>
            input.includes('disabled')
        );

        const extractedValues: string[] = [];
        disabledInputs.forEach((input) => {
            const valueMatch = input.match(/value="([^"]*)"/i);
            if (valueMatch && valueMatch[1].trim()) {
                extractedValues.push(valueMatch[1].trim());
            }
        });

        // Filter out empty values and analyze patterns
        const cleanValues = extractedValues.filter(
            (val) => val && val.length > 0
        );

        // Extract customer name (typically the first text value that's not a number)
        const nameCandidate = cleanValues.find(
            (val) =>
                /^[A-Z\s]+$/.test(val) &&
                val.length > 3 &&
                !val.includes('PARA') &&
                !val.includes('ROAD') &&
                !val.includes('BAZAR')
        );
        if (nameCandidate) {
            accountData.customerName = nameCandidate;
        }

        // Extract address (look for location patterns)
        const addressCandidate = cleanValues.find(
            (val) =>
                /^[A-Z\s]+(PARA|ROAD|STREET|BAZAR|MARKET|WARD)/.test(val) ||
                (val.includes('SARDAR') && val.includes('PARA'))
        );
        if (addressCandidate) {
            accountData.location = addressCandidate;
        }

        // Extract mobile number (look for phone patterns)
        const mobileCandidate = cleanValues.find(
            (val) =>
                /^\+880\s*\d+\*+\d+$/.test(val) ||
                /^\d{11}$/.test(val) ||
                /^\+\d+\s*\d+\*+\d+$/.test(val)
        );
        if (mobileCandidate) {
            accountData.mobileNumber = mobileCandidate;
        }

        // Extract consumer number (should match any reasonable customer number pattern)
        // First try to find exact match with input, then fallback to pattern matching
        let consumerCandidate = cleanValues.find(
            (val) =>
                val === username?.trim() ||
                val.replace(/\s/g, '') === username?.replace(/\s/g, '')
        );

        if (!consumerCandidate) {
            consumerCandidate = cleanValues.find(
                (val) => /^\d{8,15}$/.test(val) // Look for numeric strings between 8-15 digits
            );
        }

        if (consumerCandidate) {
            accountData.customerNumber = consumerCandidate;
        }

        // Extract meter number (long numeric string, different from consumer number)
        const meterCandidate = cleanValues.find(
            (val) => /^\d{10,}$/.test(val) && val !== accountData.customerNumber
        );
        if (meterCandidate) {
            accountData.accountId = meterCandidate;
        }

        // Extract connection status
        const statusCandidate = cleanValues.find((val) =>
            /^(Active|Inactive|Connected|Disconnected)$/i.test(val)
        );
        if (statusCandidate) {
            accountData.connectionStatus = statusCandidate;
        }

        // Extract numeric values for min recharge and balance
        const numericValues = cleanValues
            .filter((val) => /^\d+\.?\d*$/.test(val))
            .map((val) => parseFloat(val));

        // Min recharge is typically a smaller value (under 1000)
        const minRechargeCandidate = numericValues.find(
            (val) => val > 0 && val < 1000
        );
        if (minRechargeCandidate) {
            accountData.minRecharge = minRechargeCandidate.toString();
        }

        // Balance is typically a larger decimal value
        const balanceCandidate = numericValues.find(
            (val) => val > 0 && val.toString().includes('.')
        );
        if (balanceCandidate) {
            accountData.balanceRemaining = balanceCandidate.toString();
        }

        // Extract balance timestamp
        const balanceTimeMatch = html.match(
            /<span>\s*([\d\s\w:]+)\s*<\/span>\)/i
        );
        if (balanceTimeMatch) {
            const rawDate = balanceTimeMatch[1].trim();
            accountData.balanceLatestDate = this.formatDateToStandard(rawDate);
        }

        // Fallback for connection status
        if (!accountData.connectionStatus) {
            accountData.connectionStatus =
                accountData.balanceRemaining &&
                parseFloat(accountData.balanceRemaining) > 0
                    ? 'Active'
                    : 'Unknown';
        }

        // Extract recharge history from table
        const tableMatch = html.match(
            /<tbody[^>]*class="[^"]*text-center[^"]*"[^>]*>([\s\S]*?)<\/tbody>/i
        );
        if (tableMatch) {
            const rowMatches = tableMatch[1].match(
                /<tr[^>]*>([\s\S]*?)<\/tr>/gi
            );
            if (rowMatches && rowMatches.length > 0) {
                for (let i = 0; i < rowMatches.length; i++) {
                    const cellMatches = rowMatches[i].match(
                        /<td[^>]*>([\s\S]*?)<\/td>/gi
                    );
                    if (cellMatches && cellMatches.length >= 14) {
                        const cleanCell = (cell: string) =>
                            cell.replace(/<[^>]*>/g, '').trim();

                        const rechargeAmount = cleanCell(cellMatches[10]);
                        const rechargeDate = cleanCell(cellMatches[13]);

                        if (rechargeDate && rechargeAmount) {
                            // Use the first (most recent) record for last payment info
                            if (i === 0) {
                                accountData.lastPaymentDate =
                                    this.formatPaymentDateToStandard(
                                        rechargeDate
                                    );
                                accountData.lastPaymentAmount = rechargeAmount;
                            }
                        }
                    }
                }
            }
        }

        // Log extracted data in development mode
        this.logAccountData(accountData);

        return accountData;
    }

    async getAccountInfo(
        username: string,
        password: string,
        retryCount: number = 0
    ): Promise<ProviderAccountResult> {
        const attemptNumber = retryCount + 1;
        const maxAttempts = this.config.MAX_RETRY_ATTEMPTS;

        try {
            // Step 1: Fetch session cookies and CSRF token dynamically
            const { cookies, csrfToken } = await this.fetchNESCOSession();

            // Step 2: Use username as customer number and fetch account data
            const htmlResponse = await this.fetchNESCOData(
                username,
                cookies,
                csrfToken
            );

            const accountData = this.extractAccountData(htmlResponse, username);

            // Set the customer number from the input if not extracted
            if (!accountData.customerNumber) {
                accountData.customerNumber = username;
            }

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
