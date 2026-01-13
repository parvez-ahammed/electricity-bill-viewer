import { ResponseBuilder } from '@helpers/ResponseBuilder';
import { Request, Response } from 'express';
import { z } from 'zod';
import { NotificationSettingsService } from '../../services/implementations/NotificationSettingsService';

const updateSettingsSchema = z.object({
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
            const settings = await this.service.getTelegramSettings();
            
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

            const { chatId, isActive } = validation.data;
            const settings = await this.service.updateTelegramSettings(chatId, isActive);

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
            const success = await this.service.deleteTelegramSettings();

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
