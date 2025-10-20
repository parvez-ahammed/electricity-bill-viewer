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
    "Balance Remaining",
    "Balance Latest Date",
    "Last Payment Date",
] as const;
