import { API_ENDPOINTS } from "@/common/constants/api-endpoints.constant";
import { HTTP_METHOD } from "@/common/constants/http.constant";
import { apiRequest } from "@/lib/axios";

export interface ElectricityAccount {
    accountId: string;
    customerNumber: string;
    customerName: string;
    provider: string;
    accountType: string;
    balanceRemaining: string;
    connectionStatus: string;
    lastPaymentAmount: string;
    lastPaymentDate: string;
    balanceLatestDate: string;
    location: string;
    mobileNumber: string;
    minRecharge: string | null;
    displayName: string;
}

export interface ElectricityUsageResponse {
    success: boolean;
    totalAccounts: number;
    successfulLogins: number;
    failedLogins: number;
    accounts: ElectricityAccount[];
    errors?: Array<{
        username: string;
        provider: string;
        error: string;
        attempts: number;
    }>;
    timestamp: string;
}

export const electricityApi = {
    getUsageData: async (skipCache = false) => {
        const data = await apiRequest<ElectricityUsageResponse>(
            HTTP_METHOD.GET,
            API_ENDPOINTS.ELECTRICITY.USAGE,
            undefined,
            skipCache
        );
        return data;
    },
};

export const nicknameApi = {
    setNickname: async (accountId: string, nickname: string) => {
        const data = await apiRequest<{ accountId: string; nickname: string }>(
            HTTP_METHOD.PUT,
            `${API_ENDPOINTS.ACCOUNTS.BASE}/${accountId}/nickname`,
            { nickname }
        );
        return data;
    },

    getNickname: async (accountId: string) => {
        const data = await apiRequest<{ accountId: string; nickname: string | null }>(
            HTTP_METHOD.GET,
            `${API_ENDPOINTS.ACCOUNTS.BASE}/${accountId}/nickname`
        );
        return data;
    },

    deleteNickname: async (accountId: string) => {
        const data = await apiRequest<{ accountId: string }>(
            HTTP_METHOD.DELETE,
            `${API_ENDPOINTS.ACCOUNTS.BASE}/${accountId}/nickname`
        );
        return data;
    },
};
