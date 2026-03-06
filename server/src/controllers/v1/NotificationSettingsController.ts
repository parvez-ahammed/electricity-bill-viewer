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
        const userId = this.getValidatedUserId(req);
        const settings = await this.service.getTelegramSettings(userId);
        this.ok(res, settings, 'Settings retrieved successfully');
    };

    updateSettings = async (req: Request, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);
        const validation = updateSettingsSchema.safeParse(req.body);

        if (!validation.success) {
            const errorMessage = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            throw new Error(`Validation failed: ${errorMessage}`);
        }

        const { chatId, isActive } = validation.data;
        const settings = await this.service.updateTelegramSettings(userId, chatId, isActive);

        this.ok(res, settings, 'Settings updated successfully');
    };

    deleteSettings = async (req: Request, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);
        const success = await this.service.deleteTelegramSettings(userId);

        if (success) {
            this.ok(res, {}, 'Settings deleted successfully');
        } else {
            this.notFound(res, 'Settings not found or could not be deleted');
        }
    };
}
