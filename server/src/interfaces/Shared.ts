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

export enum ElectricityProvider {
    DPDC = 'DPDC',
    NESCO = 'NESCO',
    DESCO = 'DESCO',
}

export interface ProviderCredential {
    username: string;
    password?: string;
    provider: ElectricityProvider;
}

export interface ProviderAccountDetails {
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

export interface ProviderAccountResult {
    success: boolean;
    username: string;
    accounts: ProviderAccountDetails[];
    attempts: number;
    error?: string;
}
export interface ProviderBatchResult {
    totalCredentials: number;
    successfulLogins: number;
    totalAccounts: number;
    accounts: ProviderAccountDetails[];
    failedLogins: Array<{
        username: string;
        error: string;
        attempts: number;
    }>;
}

export type Account = {
    accountId?: string;
    customerNumber?: string;
    customerName?: string;
    customerClassDesc?: string;
    customerClassCd?: string;
    minAmtTopay?: string;
    currentBalance?: string;
    lastPaymentAmount?: string;
    lastPaymentDate?: string;
    mailingAddress?: string;
    accountSaList?: SaDetails[];
    accountPersonDetail?: { accountPremiseDetailList?: PremiseDetails };
};
export type SaDetails = {
    saTypeDesc?: string;
    saStatus?: string;
    balanceLatestDate?: string;
    prepaidSaDetail?: PrepaidDetails;
};
export type PrepaidDetails = {
    prepaidBalance?: string;
    lastPayAmtOnSa?: string;
    lastPayDateOnSa?: string;
};
export type PremiseDetails = {
    address1?: string;
};
