import { API_ENDPOINTS } from "@/common/constants/api-endpoints.constant";
import { HTTP_METHOD } from "@/common/constants/http.constant";
import { apiRequest } from "@/lib/axios";

export interface TelegramSendResponse {
    success: boolean;
    message: string;
    sentAccounts?: number;
    error?: string;
}

export const telegramApi = {
    sendBalances: async (skipCache = true): Promise<TelegramSendResponse> => {
        const data = await apiRequest<TelegramSendResponse>(
            HTTP_METHOD.GET,
            API_ENDPOINTS.TELEGRAM.SEND_BALANCES,
            undefined,
            skipCache
        );
        return data;
    },
};