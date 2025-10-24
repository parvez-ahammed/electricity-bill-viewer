import { appConfig } from '@configs/config';
import { ElectricityProvider } from '../services/interfaces/IProviderService';

export interface ElectricityCredential {
    username: string;
    password: string;
    provider: ElectricityProvider;
}

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

        // Validate and filter credentials
        return credentials
            .filter((cred: ElectricityCredential) => {
                if (!cred.username || !cred.password || !cred.provider) {
                    console.warn('Skipping invalid credential:', {
                        username: cred.username ? '***' : undefined,
                        provider: cred.provider,
                    });
                    return false;
                }

                if (
                    !Object.values(ElectricityProvider).includes(cred.provider)
                ) {
                    console.warn(
                        `Skipping credential with invalid provider: ${cred.provider}`
                    );
                    return false;
                }

                return true;
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
