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

/**
 * Common interface for all electricity provider services
 * Implemented by DPDC, NESCO, DESCO, etc.
 */
export interface IProviderService {
    /**
     * Get the provider name (DPDC, NESCO, DESCO, etc.)
     */
    getProviderName(): ElectricityProvider;

    /**
     * Get account information for a single user
     * @param username - User's account number
     * @param password - User's password (optional for NESCO, required for DPDC)
     * @param retryCount - Current retry attempt (internal use)
     */
    getAccountInfo(
        username: string,
        password?: string,
        retryCount?: number
    ): Promise<ProviderAccountResult>;

    /**
     * Get account information for multiple users
     * @param credentials - Array of user credentials
     */
    getMultipleAccountsInfo(
        credentials: ProviderCredential[]
    ): Promise<ProviderBatchResult>;
}
