import { HTTP_METHOD } from "@/common/constants/http.constant";
import axios from "axios";

const axiosInstance = axios.create({
    headers: {
        "Content-Type": "application/json",
    },
});

export const apiRequest = async <T, TRequest = unknown>(
    method: keyof typeof HTTP_METHOD,
    url: string,
    data?: TRequest,
    skipCache?: boolean
): Promise<T> => {
    const response = await axiosInstance({
        method,
        url,
        data,
        headers: skipCache ? { "x-skip-cache": "true" } : {},
    });

    return response.data;
};
