import {
    ElectricityCredential,
    ElectricityUsageData,
    ElectricityUsageResponse,
    IElectricityService,
} from '../interfaces/IElectricityService';
import {
    ElectricityProvider,
    IProviderService,
} from '../interfaces/IProviderService';
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
            accountType: account.accountType,
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
        credentials: ElectricityCredential[],
        skipCache = false
    ): Promise<ElectricityUsageResponse> {
        // Fetch each credential individually (with its own cache)
        const individualResults = await Promise.all(
            credentials.map((cred) =>
                this.getSingleAccountUsage(
                    cred.username,
                    cred.password,
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
        password: string,
        provider: ElectricityProvider,
        skipCache = false
    ): Promise<ElectricityUsageResponse> {
        // Generate cache key based on single account credentials
        const cacheKey = cacheService.generateCacheKey(this.CACHE_PREFIX, {
            username,
            password,
            provider,
        });

        // Use cache service to get or set data
        return cacheService.getOrSet<ElectricityUsageResponse>(
            cacheKey,
            async () => {
                return this.fetchSingleAccountUsage(
                    username,
                    password,
                    provider
                );
            },
            { skipCache }
        );
    }

    private async fetchSingleAccountUsage(
        username: string,
        password: string,
        provider: ElectricityProvider
    ): Promise<ElectricityUsageResponse> {
        try {
            const service = this.getProviderService(provider);
            const result = await service.getAccountInfo(username, password);

            const usageData = this.transformToUsageData(result.accounts);

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
