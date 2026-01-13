import { TelegramNotificationSettings } from '../../entities/TelegramNotificationSettings';
import { TelegramNotificationSettingsRepository } from '../../repositories/TelegramNotificationSettingsRepository';
import { INotificationSettingsService } from '../interfaces/INotificationSettingsService';

export class NotificationSettingsService implements INotificationSettingsService {
    private repository: TelegramNotificationSettingsRepository;

    constructor() {
        this.repository = new TelegramNotificationSettingsRepository();
    }

    async getTelegramSettings(accountId: string): Promise<TelegramNotificationSettings | null> {
        return this.repository.findByAccountId(accountId);
    }

    async updateTelegramSettings(accountId: string, chatId: string, isActive: boolean): Promise<TelegramNotificationSettings> {
        let settings = await this.repository.findByAccountId(accountId);
        
        if (!settings) {
            settings = this.repository.create({ accountId });
        }

        settings.chatId = chatId;
        settings.isActive = isActive;
        
        return this.repository.save(settings);
    }

    async deleteTelegramSettings(accountId: string): Promise<boolean> {
        // We can either delete the record or set chatId to null.
        // The requirement says "Remove the Chat ID", "chatId is null initially".
        // But also "Remove chatId entirely".
        // If we delete the record, it effectively removes it.
        // Let's delete the record to keep it clean, or update it to null.
        // "One-to-one relationship... Enforce single record per account" -> logic suggests we can keep record with null chatId or just delete it.
        // Let's go with deleting the record for now as it's cleaner.
        return this.repository.delete(accountId);
    }
}
