import { appConfig } from '@configs/config';
import logger from '@helpers/Logger';
import { ElectricityProvider, ProviderCredential } from '@interfaces/Shared';

/**
 * Validate credentials based on provider-specific requirements
 */
const validateCredential = (cred: ProviderCredential): boolean => {
    if (!cred.username) {
        logger.warn('Skipping credential: username is required');
        return false;
    }

    if (!cred.provider) {
        logger.warn('Skipping credential: provider is required');
        return false;
    }

    if (!Object.values(ElectricityProvider).includes(cred.provider)) {
        logger.warn(
            `Skipping credential with invalid provider: ${cred.provider}`
        );
        return false;
    }

    if (cred.provider === ElectricityProvider.DPDC && !cred.password) {
        logger.warn(
            `Skipping DPDC credential for ${cred.username}: password is required for DPDC`
        );
        return false;
    }

    return true;
};

/**
 * Parse and validate electricity credentials from environment variable
 * @returns Array of valid credentials
 */
export const getCredentialsFromEnv = (): ProviderCredential[] => {
    try {
        const credentialsJson = appConfig.electricityCredentials;

        if (!credentialsJson) {
            return [];
        }

        const credentials = JSON.parse(credentialsJson);

        if (!Array.isArray(credentials)) {
            logger.error('ELECTRICITY_CREDENTIALS must be a JSON array');
            return [];
        }

        // Validate and filter credentials with provider-specific rules
        return credentials
            .filter((cred: ProviderCredential) => {
                return validateCredential(cred);
            })
            .map((cred: ProviderCredential) => ({
                username: cred.username,
                password: cred.password,
                provider: cred.provider as ElectricityProvider,
            }));
    } catch (error) {
        logger.error('Failed to parse ELECTRICITY_CREDENTIALS:' + error);
        return [];
    }
};
