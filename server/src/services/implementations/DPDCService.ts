import * as crypto from 'crypto';

import { appConfig } from '@configs/config';
import {
    DPDCAccountDetails,
    ElectricityProvider,
    ProviderAccountDetails,
    ProviderAccountResult,
    ProviderBatchResult,
    ProviderCredential,
} from '@interfaces/Shared';
import { formatDPDCDateToStandard } from '@utility/dateFormatter';
import { IProviderService } from '../interfaces/IProviderService';

export class DPDCService implements IProviderService {
    private readonly config = {
        BASE_URL: 'https://amiapp.dpdc.org.bd',
        BEARER_ENDPOINT: '/auth/login/generate-bearer',
        LOGIN_ENDPOINT: '/auth/login',
        CLIENT_ID: 'auth-ui',
        CLIENT_SECRET: appConfig.dpdc.clientSecret,
        TENANT_CODE: 'DPDC',
        MAX_RETRY_ATTEMPTS: 3,
        RETRY_DELAY_MS: 2000,
        ACCEPT_LANGUAGE: 'en-GB,en;q=0.9',
    };

    getProviderName(): ElectricityProvider {
        return ElectricityProvider.DPDC;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Generate a random Rzp cookie string of length 14 and format it
     * @param length - Length of the random string
     * @returns Random Rzp cookie string
     */
    private genRzpCookieString(length: number = 14): string {
        const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const bytes = crypto.randomBytes(length);
        let id = '';
        for (let i = 0; i < length; i++) {
            id += chars[bytes[i] % chars.length];
        }
        return `rzp_unified_session_id=${id}; i18next=en`;
    }

    private async generateBearerToken(): Promise<string> {
        const response = await fetch(
            `${this.config.BASE_URL}${this.config.BEARER_ENDPOINT}`,
            {
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'accept-language': this.config.ACCEPT_LANGUAGE,
                    clientid: this.config.CLIENT_ID,
                    clientsecret: this.config.CLIENT_SECRET,
                    'content-type': 'application/json;charset=UTF-8',
                    'sec-ch-ua':
                        '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
                    'sec-ch-ua-mobile': '?1',
                    'sec-ch-ua-platform': '"Android"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    tenantcode: this.config.TENANT_CODE,
                    cookie: this.genRzpCookieString(),
                    Referer: `${this.config.BASE_URL}/login/`,
                },
                body: '{}',
                method: 'POST',
            }
        );

        if (!response.ok) {
            throw new Error(
                `Bearer token generation failed: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();
        const accessToken = data.access_token;

        if (!accessToken) {
            throw new Error('No access_token found in bearer response');
        }

        return accessToken;
    }

    private async fetchAccountData(
        accessToken: string,
        username: string,
        password: string
    ): Promise<unknown> {
        const response = await fetch(
            `${this.config.BASE_URL}${this.config.LOGIN_ENDPOINT}`,
            {
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'accept-language': this.config.ACCEPT_LANGUAGE,
                    accesstoken: accessToken,
                    authorization: `Bearer ${accessToken}`,
                    'content-type': 'application/json;charset=UTF-8',
                    'sec-ch-ua':
                        '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
                    'sec-ch-ua-mobile': '?1',
                    'sec-ch-ua-platform': '"Android"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    tenantcode: this.config.TENANT_CODE,
                    cookie: this.genRzpCookieString(),
                    Referer: `${this.config.BASE_URL}/login/`,
                },
                body: JSON.stringify({
                    userName: username,
                    password: password,
                }),
                method: 'POST',
            }
        );

        if (!response.ok) {
            throw new Error(
                `Login failed: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {
            throw new Error('Empty response received. Login failed.');
        }

        return data;
    }

    private extractMobileNumber(personDetails: unknown): string {
        const details = personDetails as {
            personContactDetail?: Array<{
                personContactType: string;
                contactDetailValue: string;
            }>;
        };

        if (!details?.personContactDetail) {
            return '';
        }

        const tenantMobile = details.personContactDetail.find(
            (contact) => contact.personContactType === 'TENANT-MOBILENO'
        );

        return tenantMobile?.contactDetailValue || '';
    }

    private parseSingleAccount(
        accountDetails: unknown,
        personDetails: unknown,
        provider: string
    ): DPDCAccountDetails {
        const account = accountDetails as Record<string, unknown>;
        const saDetails = (
            account?.accountSaList as Array<Record<string, unknown>>
        )?.[0];
        const prepaidDetails = saDetails?.prepaidSaDetail as Record<
            string,
            unknown
        >;
        const premiseDetails = (
            account?.accountPersonDetail as Record<string, unknown>
        )?.accountPremiseDetailList;

        return {
            accountId: (account?.accountId as string) || '',
            customerNumber: (account?.customerNumber as string) || '',
            customerName: (account?.customerName as string) || '',
            customerClass: (account?.customerClassDesc as string) || '',
            mobileNumber: this.extractMobileNumber(personDetails),
            emailId: '', // Not available in API response
            accountType: (saDetails?.saTypeDesc as string) || '',
            balanceRemaining:
                (prepaidDetails?.prepaidBalance as string) ||
                (account?.currentBalance as string) ||
                '',
            connectionStatus:
                (saDetails?.saStatus as string) === '20'
                    ? 'Active'
                    : (saDetails?.saStatus as string) || '',
            customerType: (account?.customerClassCd as string) || null,
            minRecharge: (account?.minAmtTopay as string) || null,
            balanceLatestDate: (saDetails?.balanceLatestDate as string) || '',
            lastPayAmtOnSa:
                (prepaidDetails?.lastPayAmtOnSa as string) ||
                (account?.lastPaymentAmount as string) ||
                '',
            lastPayDateOnSa:
                (prepaidDetails?.lastPayDateOnSa as string) ||
                (account?.lastPaymentDate as string) ||
                '',
            flatNameOrLocation:
                ((premiseDetails as Record<string, unknown>)
                    ?.address1 as string) ||
                (account?.mailingAddress as string) ||
                '',
            provider: provider,
        };
    }

    private parseAccountList(rawData: unknown): DPDCAccountDetails[] {
        const data = rawData as {
            accountDetails?: {
                accountSummary?: {
                    personAcccountDetail?: {
                        personAccountList?: Array<unknown>;
                    };
                    personDetailList?: Record<string, unknown>;
                };
            };
        };

        const personAccountList =
            data?.accountDetails?.accountSummary?.personAcccountDetail
                ?.personAccountList;
        const personDetails =
            data?.accountDetails?.accountSummary?.personDetailList?.[
                'C1-Person'
            ];

        if (!personAccountList || !Array.isArray(personAccountList)) {
            return [];
        }

        return personAccountList.map((account) =>
            this.parseSingleAccount(
                account,
                personDetails,
                this.config.TENANT_CODE
            )
        );
    }

    private transformToProviderFormat(
        accounts: DPDCAccountDetails[]
    ): ProviderAccountDetails[] {
        return accounts.map((account) => ({
            accountId: account.accountId,
            customerNumber: account.customerNumber,
            customerName: account.customerName,
            provider: account.provider || 'DPDC',
            accountType: account.accountType,
            balanceRemaining: account.balanceRemaining,
            connectionStatus: account.connectionStatus,
            lastPaymentAmount: account.lastPayAmtOnSa,
            lastPaymentDate: formatDPDCDateToStandard(account.lastPayDateOnSa),
            balanceLatestDate: formatDPDCDateToStandard(
                account.balanceLatestDate
            ),
            location: account.flatNameOrLocation || '',
            mobileNumber: account.mobileNumber,
            minRecharge: account.minRecharge,
        }));
    }

    async getAccountInfo(
        username: string,
        password?: string,
        retryCount: number = 0
    ): Promise<ProviderAccountResult> {
        const attemptNumber = retryCount + 1;
        const maxAttempts = this.config.MAX_RETRY_ATTEMPTS;

        if (!password) {
            return {
                success: false,
                error: 'Password is required for DPDC',
                username,
                accounts: [],
                attempts: 1,
            };
        }

        try {
            // Step 1: Generate bearer token
            const accessToken = await this.generateBearerToken();

            // Step 2: Fetch account data
            const rawData = await this.fetchAccountData(
                accessToken,
                username,
                password
            );

            // Step 3: Parse raw data into structured format
            const accountList = this.parseAccountList(rawData);

            // Check if we got valid data
            if (accountList.length === 0) {
                throw new Error('No account information found in response');
            }

            // Transform to standardized format
            const standardizedAccounts =
                this.transformToProviderFormat(accountList);

            return {
                success: true,
                username,
                accounts: standardizedAccounts,
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
