import { API_ENDPOINTS } from "@/common/constants/api-endpoints.constant";
import { apiRequest } from "@/lib/axios";
import { HTTP_METHOD } from "../constants/http.constant";

export interface TelegramNotificationSettings {
    id: string;
    chatId: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type UpdateTelegramSettingsRequest = {
    chatId: string;
    isActive: boolean;
};

export const notificationSettingsApi = {
    getTelegramSettings: async (): Promise<TelegramNotificationSettings | null> => {
        const response = await apiRequest<TelegramNotificationSettings>(
            HTTP_METHOD.GET, 
            API_ENDPOINTS.NOTIFICATION_SETTINGS.TELEGRAM
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

    deleteTelegramSettings: async (): Promise<void> => {
        await apiRequest(
            HTTP_METHOD.DELETE,
            API_ENDPOINTS.NOTIFICATION_SETTINGS.TELEGRAM
        );
    },
};
