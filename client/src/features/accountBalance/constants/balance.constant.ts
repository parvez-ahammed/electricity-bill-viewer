export interface PostBalanceDetails {
    accountId: string;
    customerNumber?: string;
    customerName: string;
    customerClass?: string;
    mobileNumber: string;
    emailId?: string;
    accountType: string;
    balanceRemaining: string;
    connectionStatus: string;
    customerType?: string | null;
    minRecharge: string | null;
    balanceLatestDate: string;
    lastPayAmtOnSa?: string;
    lastPayDateOnSa?: string;
    lastPaymentAmount?: string;
    lastPaymentDate?: string;
    flatNameOrLocation?: string;
    location?: string;
    provider?: string;
}

export const TABLE_HEADERS = [
    "Flat Name / Location",
    "Account ID",
    "Customer Name",
    "Provider",
    "Account Type",
    "Remaining",
    "Updated",
    "Recharged",
] as const;

// Cache configuration
export const CACHE_EXPIRY_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const CACHE_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const CACHE_GC_TIME = 10 * 60 * 1000; // 10 minutes
