import { TelegramNotificationSettings } from '../../entities/TelegramNotificationSettings';

export interface INotificationSettingsService {
    getTelegramSettings(accountId: string): Promise<TelegramNotificationSettings | null>;
    updateTelegramSettings(accountId: string, chatId: string, isActive: boolean): Promise<TelegramNotificationSettings>;
    deleteTelegramSettings(accountId: string): Promise<boolean>;
}
