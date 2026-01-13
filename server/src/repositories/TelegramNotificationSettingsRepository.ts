import { AppDataSource } from '@configs/database';
import { Repository } from 'typeorm';
import { TelegramNotificationSettings } from '../entities/TelegramNotificationSettings';
import { ITelegramNotificationSettingsRepository } from './interfaces/ITelegramNotificationSettingsRepository';

export class TelegramNotificationSettingsRepository implements ITelegramNotificationSettingsRepository {
    private repository: Repository<TelegramNotificationSettings>;

    constructor() {
        this.repository = AppDataSource.getRepository(TelegramNotificationSettings);
    }

    async findByAccountId(accountId: string): Promise<TelegramNotificationSettings | null> {
        return this.repository.findOne({ where: { accountId } });
    }

    async save(settings: TelegramNotificationSettings): Promise<TelegramNotificationSettings> {
        return this.repository.save(settings);
    }

    async delete(accountId: string): Promise<boolean> {
        const result = await this.repository.delete({ accountId });
        return result.affected !== undefined && result.affected > 0;
    }

    create(data: Partial<TelegramNotificationSettings>): TelegramNotificationSettings {
        return this.repository.create(data);
    }
}
