import * as crypto from 'crypto';

import { DPDC } from '@configs/constants';
import { fetchHelper } from '@helpers/fetchHelper';
import {
    Account,
    DPDCAccountDetails,
    ElectricityProvider,
    PremiseDetails,
    PrepaidDetails,
    ProviderAccountDetails,
    ProviderAccountResult,
    ProviderBatchResult,
    ProviderCredential,
    SaDetails,
} from '@interfaces/Shared';
import { formatDPDCDateToStandard } from '@utility/dateFormatter';
import { getDPDCHeaders } from '@utility/headers';
import { IProviderService } from '../interfaces/IProviderService';

export class DPDCService implements IProviderService {
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
        const url = `${DPDC.BASE_URL}${DPDC.BEARER_ENDPOINT}`;
        const headers = getDPDCHeaders({
            config: DPDC,
            cookie: this.genRzpCookieString(),
            referer: `${DPDC.BASE_URL}/login/`,
        });
        const body = '{}';
        const response = await fetchHelper.post(url, headers, body);
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
        const url = `${DPDC.BASE_URL}${DPDC.LOGIN_ENDPOINT}`;
        const headers = getDPDCHeaders({
            config: DPDC,
            accessToken,
            cookie: this.genRzpCookieString(),
            referer: `${DPDC.BASE_URL}/login/`,
        });
        const body = JSON.stringify({
            userName: username,
            password: password,
        });
        const response = await fetchHelper.post(url, headers, body);
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
        personDetails: unknown
    ): DPDCAccountDetails {
        const account: Account = accountDetails as Account;
        const saDetails: SaDetails | undefined = account.accountSaList?.[0];
        const prepaidDetails: PrepaidDetails | undefined =
            saDetails?.prepaidSaDetail;
        const premiseDetails: PremiseDetails | undefined =
            account.accountPersonDetail?.accountPremiseDetailList;

        return {
            accountId: account.accountId ?? '',
            customerNumber: account.customerNumber ?? '',
            customerName: account.customerName ?? '',
            customerClass: account.customerClassDesc ?? '',
            mobileNumber: this.extractMobileNumber(personDetails),
            emailId: '', // Not available in API response
            accountType: saDetails?.saTypeDesc ?? '',
            balanceRemaining:
                prepaidDetails?.prepaidBalance ?? account.currentBalance ?? '',
            connectionStatus:
                saDetails?.saStatus === '20'
                    ? 'Active'
                    : (saDetails?.saStatus ?? ''),
            customerType: account.customerClassCd ?? null,
            minRecharge: account.minAmtTopay ?? null,
            balanceLatestDate: saDetails?.balanceLatestDate ?? '',
            lastPayAmtOnSa:
                prepaidDetails?.lastPayAmtOnSa ??
                account.lastPaymentAmount ??
                '',
            lastPayDateOnSa:
                prepaidDetails?.lastPayDateOnSa ??
                account.lastPaymentDate ??
                '',
            flatNameOrLocation:
                premiseDetails?.address1 ?? account.mailingAddress ?? '',
            provider: DPDC.TENANT_CODE,
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
            this.parseSingleAccount(account, personDetails)
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
        const maxAttempts = DPDC.MAX_RETRY_ATTEMPTS;

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
                const retryDelay = DPDC.RETRY_DELAY_MS;
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
