import { API_ENDPOINTS } from "@/common/constants/api-endpoints.constant";
import { HTTP_METHOD } from "@/common/constants/http.constant";
import { IUser } from "@/common/interfaces/userApi.interface";
import { apiRequest } from "@/lib/axios";

import { EMPTY_STRING } from "../constants/app.constant";

export const userApi = {
    getAll: async (filterUser: string = EMPTY_STRING) => {
        let query = EMPTY_STRING;

        if (filterUser) {
            const encodedFilter = encodeURIComponent(
                `name:ilike:${filterUser},username:ilike:${filterUser}`
            );
            query = `?filter=${encodedFilter}`;
        }

        return await apiRequest<IUser[]>(
            HTTP_METHOD.GET,
            `${API_ENDPOINTS.USER.ALL}${query}`
        );
    },

    getSingle: async (userId: string) => {
        return await apiRequest<IUser>(
            HTTP_METHOD.GET,
            API_ENDPOINTS.USER.SINGLE(userId)
        );
    },
    getUserByUsername: async (username: string) => {
        return await apiRequest<IUser>(
            HTTP_METHOD.GET,
            API_ENDPOINTS.USER.USERNAME(username)
        );
    },

    update: async (userId: string, formData: Partial<IUser>) => {
        return await apiRequest<IUser>(
            HTTP_METHOD.PATCH,
            API_ENDPOINTS.USER.UPDATE(userId),
            formData
        );
    },

    delete: async (userId: string) => {
        return await apiRequest<void>(
            HTTP_METHOD.DELETE,
            API_ENDPOINTS.USER.DELETE(userId)
        );
    },
};
