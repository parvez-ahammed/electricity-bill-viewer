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
