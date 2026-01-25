import { AppDataSource } from '@configs/database';
import { Repository } from 'typeorm';
import { TelegramNotificationSettings } from '../entities/TelegramNotificationSettings';
import { ITelegramNotificationSettingsRepository } from './interfaces/ITelegramNotificationSettingsRepository';

export class TelegramNotificationSettingsRepository implements ITelegramNotificationSettingsRepository {
    private repository: Repository<TelegramNotificationSettings>;

    constructor() {
        this.repository = AppDataSource.getRepository(TelegramNotificationSettings);
    }

    async upsertUserSettings(userId: string, chatId: string, isActive: boolean): Promise<TelegramNotificationSettings> {
        let settings = await this.repository.findOne({ where: { userId } });

        if (settings) {
            settings.chatId = chatId;
            settings.isActive = isActive;
        } else {
            settings = this.repository.create({
                userId,
                chatId,
                isActive,
            });
        }

        return await this.repository.save(settings);
    }

    async getUserSettings(userId: string): Promise<TelegramNotificationSettings | null> {
        return await this.repository.findOne({ where: { userId } });
    }

    async deleteUserSettings(userId: string): Promise<boolean> {
        const result = await this.repository.delete({ userId });
        return result.affected !== undefined && result.affected > 0;
    }

    /**
     * Get all active notification settings for cron jobs
     */
    async getAllActiveSettings(): Promise<TelegramNotificationSettings[]> {
        return await this.repository.find({
            where: { isActive: true }
        });
    }
}
