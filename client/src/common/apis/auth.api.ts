import { API_ENDPOINTS } from "@/common/constants/api-endpoints.constant";
import { HTTP_METHOD } from "@/common/constants/http.constant";
import { IUser } from "@/common/interfaces/userApi.interface";
import { apiRequest } from "@/lib/axios";

import {
    LoginFormValues,
    SignupFormValues,
} from "../constants/validation.constant";

export const authApi = {
    login: async (formData: LoginFormValues) => {
        const data = await apiRequest<{ token: string; user: IUser }>(
            HTTP_METHOD.POST,
            API_ENDPOINTS.AUTH.LOGIN,
            formData
        );

        return {
            token: data.token,
            user: data.user,
        };
    },
    signUp: async (formData: SignupFormValues) => {
        const data = await apiRequest<{ token: string }>(
            HTTP_METHOD.POST,
            API_ENDPOINTS.AUTH.SIGNUP,
            {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                username: formData.username,
                role: 0,
            }
        );
        return {
            token: data.token,
        };
    },
    updatePassword: async ({
        formData,
    }: {
        userId: string;
        formData: {
            currentPassword: string;
            newPassword: string;
        };
    }) => {
        const data = await apiRequest<{ message: string }>(
            HTTP_METHOD.PATCH,
            API_ENDPOINTS.AUTH.UPDATE_PASSWORD,
            {
                ...formData,
            }
        );
        return {
            message: data.message,
        };
    },
};
