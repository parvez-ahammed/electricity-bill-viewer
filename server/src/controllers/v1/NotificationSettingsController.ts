import { ResponseBuilder } from '@helpers/ResponseBuilder';
import { NotificationSettingsService } from '@services/NotificationSettingsService';
import { Request, Response } from 'express';
import { z } from 'zod';

const updateSettingsSchema = z.object({
    accountId: z.string().uuid(),
    chatId: z.string().min(1),
    isActive: z.boolean().default(true),
});

export class NotificationSettingsController {
    private service: NotificationSettingsService;

    constructor() {
        this.service = new NotificationSettingsService();
    }

    getSettings = async (req: Request, res: Response): Promise<void> => {
        try {
            const accountId = req.query.accountId as string;
            
            if (!accountId) {
                 new ResponseBuilder(res).setStatus(400).setMessage('AccountId query parameter is required').sendError();
                 return;
            }

            const settings = await this.service.getTelegramSettings(accountId);
            
            new ResponseBuilder(res)
                .setStatus(200)
                .setData(settings)
                .setMessage('Settings retrieved successfully')
                .send();
        } catch (error) {
            new ResponseBuilder(res)
                .setStatus(500)
                .setMessage('Failed to retrieve settings')
                .sendError();
        }
    };

    updateSettings = async (req: Request, res: Response): Promise<void> => {
        try {
            const validation = updateSettingsSchema.safeParse(req.body);
            
            if (!validation.success) {
                new ResponseBuilder(res)
                    .setStatus(400)
                    .setMessage('Validation failed')
                    .setData(validation.error.errors)
                    .sendError();
                return;
            }

            const { accountId, chatId, isActive } = validation.data;
            const settings = await this.service.updateTelegramSettings(accountId, chatId, isActive);

            new ResponseBuilder(res)
                .setStatus(200)
                .setData(settings)
                .setMessage('Settings updated successfully')
                .send();
        } catch (error) {
            new ResponseBuilder(res)
                .setStatus(500)
                .setMessage('Failed to update settings')
                .sendError();
        }
    };

    deleteSettings = async (req: Request, res: Response): Promise<void> => {
        try {
            const accountId = req.query.accountId as string;
             if (!accountId) {
                 new ResponseBuilder(res).setStatus(400).setMessage('AccountId parameter is required').sendError();
                 return;
            }

            const success = await this.service.deleteTelegramSettings(accountId);

            if (success) {
                new ResponseBuilder(res)
                    .setStatus(200)
                    .setMessage('Settings deleted successfully')
                    .send();
            } else {
                 new ResponseBuilder(res)
                    .setStatus(404)
                    .setMessage('Settings not found or could not be deleted')
                    .sendError();
            }
        } catch (error) {
           new ResponseBuilder(res)
                .setStatus(500)
                .setMessage('Failed to delete settings')
                .sendError();
        }
    };
}
