import { API_ENDPOINTS } from "@/common/constants/api-endpoints.constant";
import { HTTP_METHOD } from "@/common/constants/http.constant";
import { apiRequest } from "@/lib/axios";

export interface CurrentUser {
    userId: string;
    email: string;
}

export const authApi = {
    getCurrentUser: async (): Promise<CurrentUser> => {
        return apiRequest<CurrentUser>(HTTP_METHOD.GET, API_ENDPOINTS.AUTH.ME);
    },

    logout: async (): Promise<void> => {
        await apiRequest<void>(HTTP_METHOD.POST, API_ENDPOINTS.AUTH.LOGOUT);
    },
};
