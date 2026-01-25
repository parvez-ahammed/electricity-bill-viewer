import { TelegramNotificationSettings } from '../../entities/TelegramNotificationSettings';

export interface INotificationSettingsService {
    getTelegramSettings(userId: string): Promise<TelegramNotificationSettings | null>;
    updateTelegramSettings(userId: string, chatId: string, isActive: boolean): Promise<TelegramNotificationSettings>;
    deleteTelegramSettings(userId: string): Promise<boolean>;
    getAllActiveSettings(): Promise<TelegramNotificationSettings[]>;
}
