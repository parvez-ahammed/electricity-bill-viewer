import { appConfig } from '@configs/config';
import { Request, Response } from 'express';
import { ElectricityService } from '../../services/implementations/ElectricityService';
import { ElectricityProvider } from '../../services/interfaces/IProviderService';

interface ElectricityCredential {
    username: string;
    password: string;
    provider: ElectricityProvider;
}

export class ElectricityController {
    private electricityService: ElectricityService;

    constructor() {
        this.electricityService = new ElectricityService();
    }

    /**
     * GET /api/v1/electricity/usage
     * Fetches electricity usage data using credentials from server .env
     */
    getUsageData = async (req: Request, res: Response): Promise<void> => {
        try {
            // Check for x-skip-cache header
            const skipCache = req.headers['x-skip-cache'] === 'true';

            // Get credentials from environment variable
            const credentials = this.getCredentialsFromEnv();

            if (credentials.length === 0) {
                res.status(500).json({
                    success: false,
                    message: 'No credentials configured on server',
                    error: 'ELECTRICITY_CREDENTIALS environment variable is not set or empty',
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            const result = await this.electricityService.getUsageData(
                credentials,
                skipCache
            );

            res.status(200).json(result);
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: errorMessage,
                timestamp: new Date().toISOString(),
            });
        }
    };

    healthCheck = async (req: Request, res: Response): Promise<void> => {
        res.status(200).json({
            success: true,
            service: 'Electricity Service',
            status: 'healthy',
            supportedProviders: Object.values(ElectricityProvider),
            timestamp: new Date().toISOString(),
        });
    };

    /**
     * Helper method to parse credentials from environment variable
     */
    private getCredentialsFromEnv(): ElectricityCredential[] {
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
                        console.warn('Skipping invalid credential:', cred);
                        return false;
                    }

                    if (
                        !Object.values(ElectricityProvider).includes(
                            cred.provider
                        )
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
    }
}
