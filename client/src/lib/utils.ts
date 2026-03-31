import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export const formatToMonthYear = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
};

export const getReadTime = (text: string): number => {
    const wordsPerMinute = 200;
    const words = text.split(" ").length;
    return Math.ceil(words / wordsPerMinute);
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (
            error as { response?: { data?: { message?: unknown } } }
        ).response;
        const message = response?.data?.message;
        if (typeof message === "string" && message.trim().length > 0) {
            return message;
        }
    }

    return fallback;
};
