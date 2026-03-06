import { AuthenticatedRequest } from '@interfaces/Auth';
import { Response } from 'express';
import { ElectricityService } from '../../services/implementations/ElectricityService';
import { BaseController } from '../BaseController';

export class ElectricityController extends BaseController {
    private electricityService: ElectricityService;

    constructor() {
        super();
        this.electricityService = new ElectricityService();
    }

    getUsageData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);
        const skipCache = req.headers['x-skip-cache'] === 'true';

        // Delegate entirely to the Service
        const result = await this.electricityService.getUsageDataForUser(userId, skipCache);

        if (!result) {
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

        this.ok(res, result, 'Usage data retrieved successfully');
    };
}
