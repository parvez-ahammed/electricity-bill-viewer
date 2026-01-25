import { TelegramNotificationSettings } from '../../entities/TelegramNotificationSettings';

export interface ITelegramNotificationSettingsRepository {
    getUserSettings(userId: string): Promise<TelegramNotificationSettings | null>;
    upsertUserSettings(userId: string, chatId: string, isActive: boolean): Promise<TelegramNotificationSettings>;
    deleteUserSettings(userId: string): Promise<boolean>;
    getAllActiveSettings(): Promise<TelegramNotificationSettings[]>;
}
