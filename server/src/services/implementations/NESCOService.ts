import { appConfig } from '@configs/config';
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
        COOKIE: appConfig.nesco.cookie,
        DEFAULT_CSRF_TOKEN: appConfig.nesco.csrfToken,
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

    private async fetchNESCOData(
        customerNumber: string,
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
                    priority: 'u=0, i',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1',
                    cookie: this.config.COOKIE,
                    Referer: `${this.config.BASE_URL}${this.config.PANEL_ENDPOINT}`,
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

        return await response.text();
    }

    private extractAccountData(html: string): ProviderAccountDetails {
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

        const consumerNameMatch = html.match(
            /<label[^>]*>Consumer Name<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
        );
        if (consumerNameMatch) {
            accountData.customerName = consumerNameMatch[1].trim();
        }

        const consumerNumberMatch = html.match(
            /<label[^>]*>Consumer No\.<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
        );
        if (consumerNumberMatch) {
            accountData.customerNumber = consumerNumberMatch[1].trim();
        }

        const meterNumberMatch = html.match(
            /<label[^>]*>Meter No\.<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
        );
        if (meterNumberMatch) {
            accountData.accountId = meterNumberMatch[1].trim();
        }

        const addressMatch = html.match(
            /<label[^>]*>Address<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
        );
        if (addressMatch) {
            accountData.location = addressMatch[1].trim();
        }

        const mobileMatch = html.match(
            /<label[^>]*>Mobile<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
        );
        if (mobileMatch) {
            accountData.mobileNumber = mobileMatch[1].trim();
        }

        const minRechargeMatch = html.match(
            /<label[^>]*>Minimum Recharge Amount[\s\S]*?<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
        );
        if (minRechargeMatch) {
            accountData.minRecharge = minRechargeMatch[1].trim();
        }

        const balanceMatch = html.match(
            /<label[^>]*>Remaining Balance \(Tk\.\)[\s\S]*?<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
        );
        if (balanceMatch) {
            accountData.balanceRemaining = balanceMatch[1].trim();
        }

        const balanceTimeMatch = html.match(
            /<label[^>]*>Remaining Balance[\s\S]*?<span>([\s\S]*?)<\/span>/i
        );
        if (balanceTimeMatch) {
            const rawDate = balanceTimeMatch[1].trim();
            accountData.balanceLatestDate = this.formatDateToStandard(rawDate);
        }

        const connectionStatusMatch = html.match(
            /<label[^>]*>Connection Status<\/label>[\s\S]*?<input[^>]*value="([^"]*)"[^>]*>/i
        );
        if (connectionStatusMatch) {
            accountData.connectionStatus = connectionStatusMatch[1].trim();
        } else {
            accountData.connectionStatus = accountData.balanceRemaining
                ? 'Active'
                : 'Unknown';
        }

        const tableMatch = html.match(
            /<tbody[^>]*class="[^"]*text-center[^"]*"[^>]*>([\s\S]*?)<\/tbody>/i
        );
        if (tableMatch) {
            const rowMatches = tableMatch[1].match(
                /<tr[^>]*>([\s\S]*?)<\/tr>/gi
            );
            if (rowMatches && rowMatches.length > 0) {
                const firstRow = rowMatches[0];
                const cellMatches = firstRow.match(
                    /<td[^>]*>([\s\S]*?)<\/td>/gi
                );

                if (cellMatches && cellMatches.length >= 14) {
                    const cleanCell = (cell: string) =>
                        cell.replace(/<[^>]*>/g, '').trim();

                    accountData.lastPaymentAmount = cleanCell(cellMatches[10]);
                    const rawPaymentDate = cleanCell(cellMatches[13]);
                    accountData.lastPaymentDate =
                        this.formatPaymentDateToStandard(rawPaymentDate);
                }
            }
        }

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
            const htmlResponse = await this.fetchNESCOData(
                username,
                this.config.DEFAULT_CSRF_TOKEN
            );

            const accountData = this.extractAccountData(htmlResponse);

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
