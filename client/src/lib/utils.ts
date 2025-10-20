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
