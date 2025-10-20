import { errorToast, successToast } from "@/common/hooks/toasts";
import { IUser } from "@/common/interfaces/userApi.interface";
import { useLocales } from "@/config/i18n";
import { useAuthContext } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { authApi } from "../apis/auth.api";
import { QUERY_KEYS } from "../constants/app.constant";
import {
    LoginFormValues,
    SignupFormValues,
} from "../constants/validation.constant";

export const useLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuthContext();
    const { locale } = useLocales();

    const mutation = useMutation({
        mutationFn: (formData: LoginFormValues) => authApi.login(formData),
        onSuccess: (data) => {
            login(data.user as IUser, data.token);
            successToast({ message: locale.auth.message.loginSuccess });
            navigate("/");
        },
        onError: () => {
            errorToast({ message: locale.auth.message.loginFailed });
        },
    });

    return {
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        error: mutation.error,
        handleSubmit: mutation.mutate,
    };
};

export const useSignUp = () => {
    const navigate = useNavigate();
    const { locale } = useLocales();

    const mutation = useMutation({
        mutationFn: (formData: SignupFormValues) => authApi.signUp(formData),

        onSuccess: (data) => {
            if (data) {
                successToast({ message: locale.auth.message.signupSuccess });
            }
            navigate("/auth/login");
        },

        onError: (error) => {
            if (error instanceof Error) {
                errorToast({ message: error.message });
            }
        },
    });

    return {
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        error: mutation.error,
        handleSubmit: mutation.mutate,
    };
};
export const useUpdatePassword = () => {
    const queryClient = useQueryClient();
    const { logout } = useAuthContext();
    const navigate = useNavigate();
    const { mutate, error, isPending, isSuccess } = useMutation({
        mutationFn: ({
            userId,
            formData,
        }: {
            userId: string;
            formData: { currentPassword: string; newPassword: string };
        }) => authApi.updatePassword({ userId, formData }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SINGLE_USER],
            });
            successToast({
                message: "Password updated successfully!",
            });

            logout();
            navigate("/");
        },
        onError: () => {
            errorToast({ message: "Failed to update password" });
        },
    });

    return { updatePassword: mutate, error, isPending, isSuccess };
};
