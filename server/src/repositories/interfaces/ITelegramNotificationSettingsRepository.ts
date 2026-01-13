import { TelegramNotificationSettings } from '../../entities/TelegramNotificationSettings';

export interface ITelegramNotificationSettingsRepository {
    findByAccountId(accountId: string): Promise<TelegramNotificationSettings | null>;
    save(settings: TelegramNotificationSettings): Promise<TelegramNotificationSettings>;
    delete(accountId: string): Promise<boolean>;
    create(data: Partial<TelegramNotificationSettings>): TelegramNotificationSettings;
}
