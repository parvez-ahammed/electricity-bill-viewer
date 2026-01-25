import { AuthenticatedRequest } from '@interfaces/Auth';
import { Response } from 'express';
import { ElectricityService } from '../../services/implementations/ElectricityService';
import { getCredentialsFromDatabase } from '../../utility/accountCredentialParser';
import { BaseController } from '../BaseController';

export class ElectricityController extends BaseController {
    private electricityService: ElectricityService;

    constructor() {
        super();
        this.electricityService = new ElectricityService();
    }

    getUsageData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            // Verify user is authenticated
            const userId = this.validateUser(req, res);
            if (!userId) return;

            // Check for x-skip-cache header
            const skipCache = req.headers['x-skip-cache'] === 'true';

            // Get credentials from database for this user
            const credentials = await getCredentialsFromDatabase(userId);

            if (credentials.length === 0) {
                // Return 200 OK with empty result set
                this.ok(res, {
                    success: true,
                    totalAccounts: 0,
                    successfulLogins: 0,
                    failedLogins: 0,
                    accounts: [],
                    timestamp: new Date().toISOString()
                }, 'No accounts configured');
                return;
            }

            const result = await this.electricityService.getUsageData(
                credentials,
                skipCache
            );

            this.ok(res, result, 'Usage data retrieved successfully');
        });
    };
}
