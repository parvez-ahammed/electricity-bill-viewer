import {
    ElectricityProvider,
    IElectricityProvider,
    ProviderAccountResult,
    ProviderBatchResult,
    ProviderCredential,
} from './IProviderService';

export interface DPDCAccountDetails {
    accountId: string;
    customerNumber: string;
    customerName: string;
    customerClass: string;
    mobileNumber: string;
    emailId: string;
    accountType: string;
    balanceRemaining: string;
    connectionStatus: string;
    customerType: string | null;
    minRecharge: string | null;
    balanceLatestDate: string;
    lastPayAmtOnSa: string;
    lastPayDateOnSa: string;
    flatNameOrLocation?: string;
    provider?: string;
}

export interface IDPDCService extends IElectricityProvider {
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
