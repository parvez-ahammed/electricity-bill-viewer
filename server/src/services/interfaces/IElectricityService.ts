import { ElectricityProvider, ProviderCredential } from './IProviderService';

export interface ElectricityUsageData {
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
}

export interface ElectricityUsageResponse {
    success: boolean;
    totalAccounts: number;
    successfulLogins: number;
    failedLogins: number;
    accounts: ElectricityUsageData[];
    errors?: Array<{
        username: string;
        provider: string;
        error: string;
        attempts: number;
    }>;
    timestamp: string;
}

export interface IElectricityService {
    getUsageData(
        credentials: ProviderCredential[],
        skipCache?: boolean
    ): Promise<ElectricityUsageResponse>;

    getSingleAccountUsage(
        username: string,
        password: string,
        provider: ElectricityProvider,
        skipCache?: boolean
    ): Promise<ElectricityUsageResponse>;
}
