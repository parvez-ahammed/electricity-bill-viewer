import { TelegramNotificationSettings } from '../../entities/TelegramNotificationSettings';

export interface INotificationSettingsService {
    getTelegramSettings(): Promise<TelegramNotificationSettings | null>;
    updateTelegramSettings(chatId: string, isActive: boolean): Promise<TelegramNotificationSettings>;
    deleteTelegramSettings(): Promise<boolean>;
}
