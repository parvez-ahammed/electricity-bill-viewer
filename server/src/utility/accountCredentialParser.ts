import logger from '@helpers/Logger';
import { ProviderCredential } from '@interfaces/Shared';
import { AccountService } from '../services/implementations/AccountService';

/**
 * Get credentials from the database instead of environment variables
 * @returns Array of valid credentials from database
 */
export const getCredentialsFromDatabase = async (): Promise<ProviderCredential[]> => {
    try {
        const accountService = new AccountService();
        const accounts = await accountService.getAllAccounts();

        if (accounts.length === 0) {
            logger.warn('No accounts found in database');
            return [];
        }

        // Convert database accounts to ProviderCredential format
        const credentials: ProviderCredential[] = accounts.map(account => ({
            username: account.credentials.username,
            password: 'password' in account.credentials ? account.credentials.password : undefined,
            clientSecret: 'clientSecret' in account.credentials ? account.credentials.clientSecret : undefined,
            provider: account.provider,
        }));

        logger.info(`Retrieved ${credentials.length} credentials from database`);
        return credentials;
    } catch (error) {
        logger.error('Failed to retrieve credentials from database: ' + error);
        return [];
    }
};