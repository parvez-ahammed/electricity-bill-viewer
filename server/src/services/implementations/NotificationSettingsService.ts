import ApiError from '@helpers/ApiError';
import { TelegramNotificationSettings } from '../../entities/TelegramNotificationSettings';
import { TelegramNotificationSettingsRepository } from '../../repositories/TelegramNotificationSettingsRepository';
import { INotificationSettingsService } from '../interfaces/INotificationSettingsService';

export class NotificationSettingsService implements INotificationSettingsService {
    private repository: TelegramNotificationSettingsRepository;

    constructor() {
        this.repository = new TelegramNotificationSettingsRepository();
    }

    async getTelegramSettings(userId: string): Promise<TelegramNotificationSettings | null> {
        return this.repository.getUserSettings(userId);
    }

    async updateTelegramSettings(userId: string, chatId: string, isActive: boolean): Promise<TelegramNotificationSettings> {
        return this.repository.upsertUserSettings(userId, chatId, isActive);
    }

    async deleteTelegramSettings(userId: string): Promise<boolean> {
        const deleted = await this.repository.deleteUserSettings(userId);
        if (!deleted) {
            throw new ApiError(404, 'Settings not found or could not be deleted');
        }
        return true;
    }

    async getAllActiveSettings(): Promise<TelegramNotificationSettings[]> {
        return this.repository.getAllActiveSettings();
    }
}
