import { ResponseBuilder } from '@helpers/ResponseBuilder';
import { Request, Response } from 'express';
import { ElectricityService } from '../../services/implementations/ElectricityService';
import { getCredentialsFromDatabase } from '../../utility/accountCredentialParser';

export class ElectricityController {
    private static electricityService: ElectricityService;

    constructor() {
        if (!ElectricityController.electricityService) {
            ElectricityController.electricityService = new ElectricityService();
        }
    }

    private get electricityService(): ElectricityService {
        return ElectricityController.electricityService;
    }

    getUsageData = async (req: Request, res: Response): Promise<void> => {
        try {
            // Check for x-skip-cache header
            const skipCache = req.headers['x-skip-cache'] === 'true';

            // Get credentials from database
            const credentials = await getCredentialsFromDatabase();

            if (credentials.length === 0) {
                new ResponseBuilder(res)
                    .setStatus(500)
                    .setMessage('No credentials configured on server')
                    .setData({
                        error: 'No accounts found in database. Please add accounts using the /accounts endpoint.',
                    })
                    .sendError();
                return;
            }

            const result = await this.electricityService.getUsageData(
                credentials,
                skipCache
            );

            new ResponseBuilder(res)
                .setStatus(200)
                .setMessage('Usage data retrieved successfully')
                .setData(result)
                .send();
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            new ResponseBuilder(res)
                .setStatus(500)
                .setMessage('Internal server error')
                .setData({ error: errorMessage })
                .sendError();
        }
    };
}
