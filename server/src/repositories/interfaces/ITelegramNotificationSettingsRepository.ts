import { TelegramNotificationSettings } from '../../entities/TelegramNotificationSettings';

export interface ITelegramNotificationSettingsRepository {
    getSystemSettings(): Promise<TelegramNotificationSettings | null>;
    upsertSystemSettings(chatId: string, isActive: boolean): Promise<TelegramNotificationSettings>;
    deleteSystemSettings(): Promise<boolean>;
}
