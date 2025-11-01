import logger from '@helpers/Logger';
import { ElectricityProvider, ProviderCredential } from '@interfaces/Shared';
import { normalizeAccountType } from '@utility/accountTypeNormalizer';
import {
    ElectricityUsageData,
    ElectricityUsageResponse,
    IElectricityService,
} from '../interfaces/IElectricityService';
import { IProviderService } from '../interfaces/IProviderService';
import { DPDCService } from './DPDCService';
import { NESCOService } from './NESCOService';
import { cacheService } from './RedisCacheService';

export class ElectricityService implements IElectricityService {
    private providers: Map<ElectricityProvider, IProviderService>;
    private readonly CACHE_PREFIX = 'electricity:usage';

    constructor() {
        this.providers = new Map();

        this.providers.set(ElectricityProvider.DPDC, new DPDCService());
        this.providers.set(ElectricityProvider.NESCO, new NESCOService());
    }

    private getProviderService(
        provider: ElectricityProvider
    ): IProviderService {
        const service = this.providers.get(provider);
        if (!service) {
            throw new Error(`Provider service not found for: ${provider}`);
        }
        return service;
    }

    private transformToUsageData(
        accounts: Array<{
            accountId: string;
            customerNumber: string;
            customerName: string;
            provider: string;
            accountType: string;
            balanceRemaining: string;
            connectionStatus: string;
            lastPaymentAmount: string;
            lastPaymentDate: string;
            balanceLatestDate: string;
            location: string;
            mobileNumber: string;
            minRecharge: string | null;
        }>
    ): ElectricityUsageData[] {
        return accounts.map((account) => ({
            accountId: account.accountId,
            customerNumber: account.customerNumber,
            customerName: account.customerName,
            provider: account.provider,
            accountType: normalizeAccountType(account.accountType),
            balanceRemaining: account.balanceRemaining,
            connectionStatus: account.connectionStatus,
            lastPaymentAmount: account.lastPaymentAmount,
            lastPaymentDate: account.lastPaymentDate,
            balanceLatestDate: account.balanceLatestDate,
            location: account.location,
            mobileNumber: account.mobileNumber,
            minRecharge: account.minRecharge,
        }));
    }

    async getUsageData(
        credentials: ProviderCredential[],
        skipCache = false
    ): Promise<ElectricityUsageResponse> {
        logger.info(
            `[ElectricityService] Fetching usage data for ${credentials.length} credential(s)`
        );
        const individualResults = await Promise.all(
            credentials.map((cred) =>
                this.getSingleAccountUsage(
                    cred.username,
                    cred.password,
                    cred.clientSecret,
                    cred.provider,
                    skipCache
                )
            )
        );

        // Aggregate all individual results
        const allAccounts: ElectricityUsageData[] = [];
        const allErrors: Array<{
            username: string;
            provider: string;
            error: string;
            attempts: number;
        }> = [];
        let successfulLogins = 0;
        let failedLogins = 0;

        individualResults.forEach((result) => {
            allAccounts.push(...result.accounts);
            successfulLogins += result.successfulLogins;
            failedLogins += result.failedLogins;
            if (result.errors) {
                allErrors.push(...result.errors);
            }
        });

        logger.info(
            `[ElectricityService] Usage data fetch complete. Accounts: ${allAccounts.length}, Success: ${successfulLogins}, Failed: ${failedLogins}`
        );
        if (allErrors.length > 0) {
            logger.warn(
                `[ElectricityService] Errors encountered for ${allErrors.length} credential(s)`
            );
        }
        return {
            success: allAccounts.length > 0,
            totalAccounts: allAccounts.length,
            successfulLogins,
            failedLogins,
            accounts: allAccounts,
            errors: allErrors.length > 0 ? allErrors : undefined,
            timestamp: new Date().toISOString(),
        };
    }

    async getSingleAccountUsage(
        username: string,
        password: string | undefined,
        clientSecret: string | undefined,
        provider: ElectricityProvider,
        skipCache?: boolean
    ): Promise<ElectricityUsageResponse> {
        skipCache = skipCache ?? false;
        const cacheKey = cacheService.generateCacheKey(this.CACHE_PREFIX, {
            username,
            password,
            clientSecret,
            provider,
        });

        if (skipCache) {
            logger.debug(
                `[ElectricityService] Skipping cache for user: ${username}, provider: ${provider}`
            );
        } else {
            logger.debug(
                `[ElectricityService] Attempting cache lookup for user: ${username}, provider: ${provider}`
            );
        }

        // Use cache service to get or set data
        return cacheService.getOrSet<ElectricityUsageResponse>(
            cacheKey,
            async () => {
                logger.debug(
                    `[ElectricityService] Fetching fresh data for user: ${username}, provider: ${provider}`
                );
                return this.fetchSingleAccountUsage(
                    username,
                    password,
                    clientSecret,
                    provider
                );
            },
            { skipCache }
        );
    }

    private async fetchSingleAccountUsage(
        username: string,
        password: string | undefined,
        clientSecret: string | undefined,
        provider: ElectricityProvider
    ): Promise<ElectricityUsageResponse> {
        try {
            logger.debug(
                `[ElectricityService] Fetching account info for user: ${username}, provider: ${provider}`
            );
            const service = this.getProviderService(provider);
            const result = await service.getAccountInfo(username, password, clientSecret);

            const usageData = this.transformToUsageData(result.accounts);

            logger.info(
                `[ElectricityService] Account info fetch result for user: ${username}, provider: ${provider} - Success: ${result.success}, Accounts: ${usageData.length}`
            );

            return {
                success: result.success,
                totalAccounts: usageData.length,
                successfulLogins: result.success ? 1 : 0,
                failedLogins: result.success ? 0 : 1,
                accounts: usageData,
                errors: result.error
                    ? [
                          {
                              username,
                              provider: provider,
                              error: result.error,
                              attempts: result.attempts,
                          },
                      ]
                    : undefined,
                timestamp: new Date().toISOString(),
            };
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            logger.error(
                `[ElectricityService] Failed to fetch account info for user: ${username}, provider: ${provider}. Error: ${errorMessage}`
            );
            return {
                success: false,
                totalAccounts: 0,
                successfulLogins: 0,
                failedLogins: 1,
                accounts: [],
                errors: [
                    {
                        username,
                        provider: provider,
                        error: errorMessage,
                        attempts: 0,
                    },
                ],
                timestamp: new Date().toISOString(),
            };
        }
    }
}
