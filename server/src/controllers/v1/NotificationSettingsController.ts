import { Request, Response } from 'express';
import { NotificationSettingsService } from '../../services/implementations/NotificationSettingsService';
import { BaseController } from '../BaseController';

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
        
        const { chatId, isActive } = req.body;
        const settings = await this.service.updateTelegramSettings(userId, chatId, isActive);

        this.ok(res, settings, 'Settings updated successfully');
    };

    deleteSettings = async (req: Request, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);
        await this.service.deleteTelegramSettings(userId);
        this.ok(res, {}, 'Settings deleted successfully');
    };
}
