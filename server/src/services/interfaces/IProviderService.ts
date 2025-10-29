import {
    ElectricityProvider,
    ProviderAccountResult,
    ProviderBatchResult,
    ProviderCredential,
} from '@interfaces/Shared';

export interface IProviderService {
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
