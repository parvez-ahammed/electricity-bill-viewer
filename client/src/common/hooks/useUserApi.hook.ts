import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { userApi } from "../apis/user.api";
import { EMPTY_STRING, QUERY_KEYS } from "../constants/app.constant";
import { IUser } from "../interfaces/userApi.interface";

import { successToast } from "./toasts";

export const useGetAllUsers = (forceFetch = false) => {
    const [searchParams] = useSearchParams();
    const filterUser = searchParams.get("search") || EMPTY_STRING;
    const isSearchActive = forceFetch || filterUser.trim().length > 0;

    const { data, isLoading, error } = useQuery({
        queryKey: [QUERY_KEYS.ALL_USERS, filterUser],
        queryFn: () => userApi.getAll(filterUser),
        enabled: isSearchActive,
    });

    return { users: data ?? [], isLoading, error };
};

export const useGetUser = (userId: string) => {
    const { data, isLoading, error } = useQuery({
        queryKey: [QUERY_KEYS.SINGLE_USER, userId],
        queryFn: () => userApi.getSingle(userId),
        enabled: !!userId,
    });

    return { user: data, isLoading, error };
};

export const useGetUserByUsername = (username: string) => {
    const { data, isLoading, error } = useQuery({
        queryKey: [QUERY_KEYS.SINGLE_USER, username],
        queryFn: () => userApi.getUserByUsername(username),
    });

    return { user: data, isLoading, error };
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const { mutate, error, isPending, isSuccess } = useMutation({
        mutationFn: ({
            userId,
            formData,
        }: {
            userId: string;
            formData: Partial<IUser>;
        }) =>
            userApi.update(userId, {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                location: formData.location,
                bio: formData.bio,
            }),
        onSuccess: (_, formdata) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.SINGLE_USER, formdata.userId],
            });

            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.ALL_USERS],
            });

            successToast({
                message: "User informations updated successfully!",
            });
        },
        onError: () => {
            successToast({ message: "Failed to update user information" });
        },
    });

    return { updateUser: mutate, error, isPending, isSuccess };
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    const { mutate, error } = useMutation({
        mutationFn: (userId: string) => userApi.delete(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_USERS] });
            successToast({
                message: "User deleted successfully!",
            });
        },
    });

    return { deleteUser: mutate, error };
};
