import { Request, Response } from 'express';
import { ElectricityService } from '../../services/implementations/ElectricityService';
import { ElectricityProvider } from '../../services/interfaces/IProviderService';

export class ElectricityController {
    private electricityService: ElectricityService;

    constructor() {
        this.electricityService = new ElectricityService();
    }

    getUsageData = async (req: Request, res: Response): Promise<void> => {
        try {
            const { credentials } = req.body;

            if (!credentials || !Array.isArray(credentials)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid request. Expected array of credentials.',
                    error: 'credentials must be an array of {username, password, provider} objects',
                });
                return;
            }

            for (const cred of credentials) {
                if (!cred.username || !cred.password || !cred.provider) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid credentials format',
                        error: 'Each credential must have username, password, and provider',
                    });
                    return;
                }

                if (
                    !Object.values(ElectricityProvider).includes(cred.provider)
                ) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid provider',
                        error: `Provider must be one of: ${Object.values(ElectricityProvider).join(', ')}`,
                    });
                    return;
                }
            }

            const result =
                await this.electricityService.getUsageData(credentials);

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

    getSingleUsageData = async (req: Request, res: Response): Promise<void> => {
        try {
            const { username, password, provider } = req.body;

            if (!username || !password || !provider) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid request',
                    error: 'username, password, and provider are required',
                });
                return;
            }

            if (!Object.values(ElectricityProvider).includes(provider)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid provider',
                    error: `Provider must be one of: ${Object.values(ElectricityProvider).join(', ')}`,
                });
                return;
            }

            const result = await this.electricityService.getSingleAccountUsage(
                username,
                password,
                provider as ElectricityProvider
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
}
