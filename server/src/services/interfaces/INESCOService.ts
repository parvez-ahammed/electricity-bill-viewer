import {
    ElectricityProvider,
    IElectricityProvider,
    ProviderAccountResult,
    ProviderBatchResult,
    ProviderCredential,
} from './IProviderService';

export interface NESCOAccountDetails {
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

export interface INESCOService extends IElectricityProvider {
    getProviderName(): ElectricityProvider;

    getAccountInfo(
        username: string,
        password: string,
        retryCount?: number
    ): Promise<ProviderAccountResult>;

    getMultipleAccountsInfo(
        credentials: ProviderCredential[]
    ): Promise<ProviderBatchResult>;
}
