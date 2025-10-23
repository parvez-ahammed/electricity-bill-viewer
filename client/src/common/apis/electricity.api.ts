import { API_ENDPOINTS } from "@/common/constants/api-endpoints.constant";
import { HTTP_METHOD } from "@/common/constants/http.constant";
import { apiRequest } from "@/lib/axios";

export interface ElectricityCredential {
    provider: "DPDC" | "NESCO" | "DESCO";
    username: string;
    password: string;
}

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
    getUsageData: async (
        credentials: ElectricityCredential[],
        skipCache = false
    ) => {
        const data = await apiRequest<ElectricityUsageResponse>(
            HTTP_METHOD.POST,
            API_ENDPOINTS.ELECTRICITY.USAGE,
            { credentials },
            skipCache
        );
        return data;
    },

    getSingleUsageData: async (
        credential: ElectricityCredential,
        skipCache = false
    ) => {
        const data = await apiRequest<ElectricityUsageResponse>(
            HTTP_METHOD.POST,
            API_ENDPOINTS.ELECTRICITY.SINGLE,
            credential,
            skipCache
        );
        return data;
    },
};
