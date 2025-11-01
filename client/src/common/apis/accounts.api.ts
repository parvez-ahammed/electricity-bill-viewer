import { API_ENDPOINTS } from "@/common/constants/api-endpoints.constant";
import { HTTP_METHOD } from "@/common/constants/http.constant";
import { apiRequest } from "@/lib/axios";

export type ElectricityProvider = 'DPDC' | 'NESCO';

export interface DPDCCredentials {
    username: string;
    password: string;
    clientSecret: string;
}

export interface NESCOCredentials {
    username: string;
}

export interface CorruptedCredentials {
    username: string;
    _isCorrupted: boolean;
    _originalId: string;
}

export type ProviderCredentials = DPDCCredentials | NESCOCredentials | CorruptedCredentials;

export interface Account {
    id: string;
    provider: ElectricityProvider;
    credentials: ProviderCredentials;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAccountRequest {
    provider: ElectricityProvider;
    credentials: ProviderCredentials;
}

export interface UpdateAccountRequest {
    credentials: ProviderCredentials;
}

export interface AccountsResponse {
    status: number;
    message: string;
    data: Account | Account[];
}

export const accountsApi = {
    getAllAccounts: async (): Promise<Account[]> => {
        const data = await apiRequest<Account[]>(
            HTTP_METHOD.GET,
            API_ENDPOINTS.ACCOUNTS.BASE
        );
        return Array.isArray(data) ? data : [];
    },

    getAccountById: async (id: string): Promise<Account> => {
        const data = await apiRequest<Account>(
            HTTP_METHOD.GET,
            `${API_ENDPOINTS.ACCOUNTS.BASE}/${id}`
        );
        return data;
    },

    createAccount: async (data: CreateAccountRequest): Promise<Account> => {
        const result = await apiRequest<Account>(
            HTTP_METHOD.POST,
            API_ENDPOINTS.ACCOUNTS.BASE,
            data
        );
        return result;
    },

    updateAccount: async (id: string, data: UpdateAccountRequest): Promise<Account> => {
        const result = await apiRequest<Account>(
            HTTP_METHOD.PUT,
            `${API_ENDPOINTS.ACCOUNTS.BASE}/${id}`,
            data
        );
        return result;
    },

    deleteAccount: async (id: string): Promise<void> => {
        await apiRequest<void>(
            HTTP_METHOD.DELETE,
            `${API_ENDPOINTS.ACCOUNTS.BASE}/${id}`
        );
    },

    forceDeleteAccount: async (id: string): Promise<void> => {
        await apiRequest<void>(
            HTTP_METHOD.DELETE,
            `${API_ENDPOINTS.ACCOUNTS.BASE}/${id}/force`
        );
    },

    getAccountsByProvider: async (provider: ElectricityProvider): Promise<Account[]> => {
        const data = await apiRequest<Account[]>(
            HTTP_METHOD.GET,
            `${API_ENDPOINTS.ACCOUNTS.BASE}/provider/${provider}`
        );
        return Array.isArray(data) ? data : [];
    },
};