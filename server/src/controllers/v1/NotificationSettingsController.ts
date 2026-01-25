import { AuthenticatedRequest } from '@interfaces/Auth';
import { Request, Response } from 'express';
import { z } from 'zod';
import { NotificationSettingsService } from '../../services/implementations/NotificationSettingsService';
import { BaseController } from '../BaseController';

const updateSettingsSchema = z.object({
    chatId: z.string().min(1),
    isActive: z.boolean().default(true),
});

export class NotificationSettingsController extends BaseController {
    private service: NotificationSettingsService;

    constructor() {
        super();
        this.service = new NotificationSettingsService();
    }

    getSettings = async (req: Request, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            const authReq = req as AuthenticatedRequest;
            const userId = this.validateUser(authReq, res);
            if (!userId) return;

            const settings = await this.service.getTelegramSettings(userId);
            this.ok(res, settings, 'Settings retrieved successfully');
        });
    };

    updateSettings = async (req: Request, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            const authReq = req as AuthenticatedRequest;
            const userId = this.validateUser(authReq, res);
            if (!userId) return;

            const validation = updateSettingsSchema.safeParse(req.body);

            if (!validation.success) {
                this.clientError(res, 'Validation failed');
                const errorMessage = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
                this.clientError(res, `Validation failed: ${errorMessage}`);
                return;
            }

            const { chatId, isActive } = validation.data;
            const settings = await this.service.updateTelegramSettings(userId, chatId, isActive);

            this.ok(res, settings, 'Settings updated successfully');
        });
    };

    deleteSettings = async (req: Request, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
            const authReq = req as AuthenticatedRequest;
            const userId = this.validateUser(authReq, res);
            if (!userId) return;

            const success = await this.service.deleteTelegramSettings(userId);

            if (success) {
                this.ok(res, {}, 'Settings deleted successfully');
            } else {
                this.notFound(res, 'Settings not found or could not be deleted');
            }
        });
    };
}
