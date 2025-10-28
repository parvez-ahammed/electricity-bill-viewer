import { HTTP_METHOD } from "@/common/constants/http.constant";
import axios, { AxiosRequestConfig } from "axios";

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
    const config: AxiosRequestConfig = {
        method,
        url,
        headers: skipCache ? { "x-skip-cache": "true" } : {},
    };

    // Only add data for non-GET requests
    if (method !== "GET" && data !== undefined) {
        config.data = data;
    }

    const response = await axiosInstance(config);

    // If the response has the ResponseBuilder structure, extract the data
    if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
    ) {
        return response.data.data as T;
    }

    return response.data;
};
