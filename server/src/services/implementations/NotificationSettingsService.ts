import { TelegramNotificationSettings } from '../../entities/TelegramNotificationSettings';
import { TelegramNotificationSettingsRepository } from '../../repositories/TelegramNotificationSettingsRepository';
import { INotificationSettingsService } from '../interfaces/INotificationSettingsService';

export class NotificationSettingsService implements INotificationSettingsService {
    private repository: TelegramNotificationSettingsRepository;

    constructor() {
        this.repository = new TelegramNotificationSettingsRepository();
    }

    async getTelegramSettings(): Promise<TelegramNotificationSettings | null> {
        return this.repository.getSystemSettings();
    }

    async updateTelegramSettings(chatId: string, isActive: boolean): Promise<TelegramNotificationSettings> {
        return this.repository.upsertSystemSettings(chatId, isActive);
    }

    async deleteTelegramSettings(): Promise<boolean> {
        return this.repository.deleteSystemSettings();
    }
}
