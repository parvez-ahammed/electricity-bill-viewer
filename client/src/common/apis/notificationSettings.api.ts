import { API_ENDPOINTS } from "@/common/constants/api-endpoints.constant";
import { apiRequest } from "@/lib/axios";
import { HTTP_METHOD } from "../constants/http.constant";

export interface TelegramNotificationSettings {
    id: string;
    accountId: string;
    chatId: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type UpdateTelegramSettingsRequest = {
    accountId: string;
    chatId: string;
    isActive: boolean;
};

export const notificationSettingsApi = {
    getTelegramSettings: async (accountId: string): Promise<TelegramNotificationSettings | null> => {
        const response = await apiRequest<TelegramNotificationSettings>(
            HTTP_METHOD.GET, 
            `${API_ENDPOINTS.NOTIFICATION_SETTINGS.TELEGRAM}?accountId=${encodeURIComponent(accountId)}`
        );
        return response;
    },

    updateTelegramSettings: async (data: UpdateTelegramSettingsRequest): Promise<TelegramNotificationSettings> => {
        const response = await apiRequest<TelegramNotificationSettings>(
            HTTP_METHOD.PUT,
            API_ENDPOINTS.NOTIFICATION_SETTINGS.TELEGRAM,
            data
        );
        return response;
    },

    deleteTelegramSettings: async (accountId: string): Promise<void> => {
        await apiRequest(
            HTTP_METHOD.DELETE,
            `${API_ENDPOINTS.NOTIFICATION_SETTINGS.TELEGRAM}?accountId=${encodeURIComponent(accountId)}`
        );
    },
};
