import { AppDataSource } from '@configs/database';
import { Repository } from 'typeorm';
import { TelegramNotificationSettings } from '../entities/TelegramNotificationSettings';
import { ITelegramNotificationSettingsRepository } from './interfaces/ITelegramNotificationSettingsRepository';

export class TelegramNotificationSettingsRepository implements ITelegramNotificationSettingsRepository {
    private repository: Repository<TelegramNotificationSettings>;

    constructor() {
        this.repository = AppDataSource.getRepository(TelegramNotificationSettings);
    }

    async getSystemSettings(): Promise<TelegramNotificationSettings | null> {
        // Find the single record
        const settings = await this.repository.find({ take: 1 });
        return settings.length > 0 ? settings[0] : null;
    }

    async upsertSystemSettings(chatId: string, isActive: boolean): Promise<TelegramNotificationSettings> {
        let settings = await this.getSystemSettings();
        
        if (!settings) {
            settings = this.repository.create({ chatId, isActive });
        } else {
            settings.chatId = chatId;
            settings.isActive = isActive;
        }

        return this.repository.save(settings);
    }

    async deleteSystemSettings(): Promise<boolean> {
        // We can just clear the fields or delete the row.
        // Requirement says "updates allow runtime updates... Remove the Chat ID".
        // Let's delete the row for clean slate.
        const settings = await this.getSystemSettings();
        if (settings) {
             const result = await this.repository.delete(settings.id);
             return result.affected !== undefined && result.affected > 0;
        }
        return false;
    }
}
