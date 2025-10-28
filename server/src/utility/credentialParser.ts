import { appConfig } from '@configs/config';
import { ElectricityProvider } from '../services/interfaces/IProviderService';

export interface ElectricityCredential {
    username: string;
    password?: string; // Optional - required for DPDC, not needed for NESCO
    provider: ElectricityProvider;
}

/**
 * Validate credentials based on provider-specific requirements
 */
const validateCredential = (cred: ElectricityCredential): boolean => {
    if (!cred.username) {
        console.warn('Skipping credential: username is required');
        return false;
    }

    if (!cred.provider) {
        console.warn('Skipping credential: provider is required');
        return false;
    }

    if (!Object.values(ElectricityProvider).includes(cred.provider)) {
        console.warn(
            `Skipping credential with invalid provider: ${cred.provider}`
        );
        return false;
    }

    if (cred.provider === ElectricityProvider.DPDC && !cred.password) {
        console.warn(
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
export const getCredentialsFromEnv = (): ElectricityCredential[] => {
    try {
        const credentialsJson = appConfig.electricityCredentials;

        if (!credentialsJson) {
            return [];
        }

        const credentials = JSON.parse(credentialsJson);

        if (!Array.isArray(credentials)) {
            console.error('ELECTRICITY_CREDENTIALS must be a JSON array');
            return [];
        }

        // Validate and filter credentials with provider-specific rules
        return credentials
            .filter((cred: ElectricityCredential) => {
                return validateCredential(cred);
            })
            .map((cred: ElectricityCredential) => ({
                username: cred.username,
                password: cred.password,
                provider: cred.provider as ElectricityProvider,
            }));
    } catch (error) {
        console.error('Failed to parse ELECTRICITY_CREDENTIALS:', error);
        return [];
    }
};
