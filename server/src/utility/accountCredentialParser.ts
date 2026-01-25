import logger from '@helpers/Logger';
import { ProviderCredential } from '@interfaces/Shared';
import { AccountService } from '../services/implementations/AccountService';

/**
 * Get credentials from the database for a specific user
 * @param userId - The authenticated user's ID
 * @returns Array of valid credentials from database belonging to the user
 */
export const getCredentialsFromDatabase = async (userId: string): Promise<ProviderCredential[]> => {
    try {
        const accountService = new AccountService();
        const accounts = await accountService.getAllAccounts(userId);

        if (accounts.length === 0) {
            logger.warn(`No accounts found in database for user ${userId}`);
            return [];
        }

        // Convert database accounts to ProviderCredential format
        const credentials: ProviderCredential[] = accounts.map(account => ({
            username: account.credentials.username,
            password: 'password' in account.credentials ? account.credentials.password : undefined,
            clientSecret: 'clientSecret' in account.credentials ? account.credentials.clientSecret : undefined,
            provider: account.provider,
        }));

        logger.info(`Retrieved ${credentials.length} credentials from database for user ${userId}`);
        return credentials;
    } catch (error) {
        logger.error('Failed to retrieve credentials from database: ' + error);
        return [];
    }
};