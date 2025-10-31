import logger from '@helpers/Logger';
import * as cheerio from 'cheerio';

import { NESCO } from '@configs/constants';
import { fetchHelper } from '@helpers/fetchHelper';
import {
    ElectricityProvider,
    ProviderAccountDetails,
    ProviderAccountResult,
    ProviderBatchResult,
    ProviderCredential,
} from '@interfaces/Shared';
import { formatNESCOPaymentDateToStandard } from '@utility/dateFormatter';
import { getNESCOHeaders } from '@utility/headers';
import { IProviderService } from '../interfaces/IProviderService';

export class NESCOService implements IProviderService {
    getProviderName(): ElectricityProvider {
        return ElectricityProvider.NESCO;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private extractCookies(response: Response): string {
        const headers = response.headers as Headers & {
            getSetCookie?: () => string[];
        };
        const setCookieHeaders = headers.getSetCookie?.() || [];
        const cookieMap: Record<string, string> = {};
        for (const cookie of setCookieHeaders) {
            const [key, value] = cookie.split('=', 2);
            if (
                key === 'XSRF-TOKEN' ||
                key === 'customer_service_portal_session'
            ) {
                cookieMap[key] = value?.split(';')[0] || '';
            }
        }
        return (
            Object.entries(cookieMap)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, value]) => value)
                .map(([key, value]) => `${key}=${value}`)
                .join('; ')
        );
    }

    // Extract CSRF token from HTML
    private extractCSRFToken(html: string): string {
        const $ = cheerio.load(html);
        return (
            $('input[name="_token"]').attr('value') ||
            $('meta[name="csrf-token"]').attr('content') ||
            ''
        );
    }

    // Fetch account HTML for a customer number
    private async fetchAccountData(customerNumber: string): Promise<string> {
        const url = `${NESCO.BASE_URL}${NESCO.PANEL_ENDPOINT}`;
        logger.debug(
            `[NESCO] Fetching account HTML for customer: ${customerNumber}`
        );
        // Step 1: Get CSRF token and cookies
        const initResponse = await fetchHelper.get(url, getNESCOHeaders());
        if (!initResponse.ok) {
            logger.error(
                `[NESCO] Session fetch failed for customer ${customerNumber}: ${initResponse.status} ${initResponse.statusText}`
            );
            throw new Error(
                `NESCO session fetch failed: ${initResponse.status} ${initResponse.statusText}`
            );
        }
        const cookies = this.extractCookies(initResponse);
        const csrfToken = this.extractCSRFToken(await initResponse.text());
        if (!csrfToken) {
            logger.warn(
                `[NESCO] Could not find CSRF token in HTML for customer: ${customerNumber}`
            );
            throw new Error('Could not find CSRF token in HTML');
        }

        // Step 2: Post to get account data
        const headers = {
            ...getNESCOHeaders(),
            'content-type': 'application/x-www-form-urlencoded',
            cookie: cookies,
            Referer: url,
            Origin: NESCO.BASE_URL,
        };
        const body = `_token=${csrfToken}&cust_no=${customerNumber}&submit=রিচার্জ+হিস্ট্রি`;
        const dataResponse = await fetchHelper.post(url, headers, body);
        if (!dataResponse.ok) {
            logger.error(
                `[NESCO] API request failed for customer ${customerNumber}: ${dataResponse.status} ${dataResponse.statusText}`
            );
            throw new Error(
                `NESCO API request failed: ${dataResponse.status} ${dataResponse.statusText}`
            );
        }
        logger.info(
            `[NESCO] Successfully fetched account HTML for customer: ${customerNumber}`
        );
        return await dataResponse.text();
    }

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

        logger.debug(
            `[NESCO] Parsed account values for username=${username || 'unknown'}: customerName=${data.customerName}, customerNumber=${data.customerNumber}, balance=${data.balanceRemaining}`
        );

        const balanceLabel = $('label:contains("অবশিষ্ট ব্যালেন্স")').text();
        const timeMatch = balanceLabel.match(
            /(\d{1,2}\s+\w+\s+\d{4}\s+\d{1,2}:\d{2}:\d{2}\s+(?:AM|PM))/i
        );
        if (timeMatch) {
            const dateObj = new Date(timeMatch[1]);
            if (!isNaN(dateObj.getTime())) {
                const yyyy = dateObj.getFullYear();
                const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                const dd = String(dateObj.getDate()).padStart(2, '0');
                data.balanceLatestDate = `${yyyy}-${mm}-${dd}`;
            }
        }

        // Extract recharge history (first row = most recent)
        const firstRow = $('tbody.text-center tr').first();
        const cells = firstRow.find('td');
        if (cells.length >= 14) {
            const rechargeAmount = $(cells[10]).text().trim();
            const rechargeDate = $(cells[13]).text().trim();
            if (rechargeDate && rechargeAmount) {
                data.lastPaymentAmount = rechargeAmount;
                data.lastPaymentDate =
                    formatNESCOPaymentDateToStandard(rechargeDate);
            }
        }

        // Fallback for customer number
        if (!data.customerNumber && username) {
            data.customerNumber = username;
        }
        return data;
    }

    async getAccountInfo(
        username: string,
        password?: string,
        clientSecret? : string,
        retryCount = 0
    ): Promise<ProviderAccountResult> {
        logger.debug(
            `[NESCO] Starting getAccountInfo for username: ${username} (attempt ${retryCount + 1})`
        );
        try {
            const html = await this.fetchAccountData(username);
            const account = this.parseAccountData(html, username);
            if (!account.customerNumber || !account.accountId) {
                logger.warn(
                    `[NESCO] No account information found in response for username: ${username}`
                );
                throw new Error(
                    'No account information found in NESCO response'
                );
            }
            logger.info(
                `[NESCO] Retrieved account info for username: ${username}`
            );
            return {
                success: true,
                username,
                accounts: [account],
                attempts: retryCount + 1,
            };
        } catch (error: unknown) {
            const errMsg =
                error instanceof Error ? error.message : 'Unknown error';
            logger.error(
                `[NESCO] Error fetching account for username: ${username}: ${errMsg}`
            );
            if (retryCount < NESCO.MAX_RETRY_ATTEMPTS - 1) {
                logger.debug(
                    `[NESCO] Retrying for username: ${username} after ${NESCO.RETRY_DELAY_MS}ms`
                );
                await this.sleep(NESCO.RETRY_DELAY_MS);
                return this.getAccountInfo(username, password, "client_secret" , retryCount + 1);
            }
            return {
                success: false,
                error: errMsg,
                username,
                accounts: [],
                attempts: NESCO.MAX_RETRY_ATTEMPTS,
            };
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

        logger.info(
            `[NESCO] Starting batch fetch for ${credentials.length} credential(s)`
        );
        for (let i = 0; i < credentials.length; i++) {
            const { username, password } = credentials[i];

            const result = await this.getAccountInfo(username, password);

            if (result.success) {
                logger.info(
                    `[NESCO] Account info fetched successfully for username: ${username}`
                );
                allAccounts.push(...result.accounts);
            } else {
                logger.error(
                    `[NESCO] Failed to fetch account info for username: ${username}. Error: ${result.error || 'Unknown error'}`
                );
                failedLogins.push({
                    username,
                    error: result.error || 'Unknown error',
                    attempts: result.attempts,
                });
            }

            if (i < credentials.length - 1) {
                await this.sleep(NESCO.RETRY_DELAY_MS);
            }
        }

        logger.info(
            `[NESCO] Batch fetch complete. Successful: ${credentials.length - failedLogins.length}, Failed: ${failedLogins.length}`
        );

        return {
            totalCredentials: credentials.length,
            successfulLogins: credentials.length - failedLogins.length,
            totalAccounts: allAccounts.length,
            accounts: allAccounts,
            failedLogins,
        };
    }
}
