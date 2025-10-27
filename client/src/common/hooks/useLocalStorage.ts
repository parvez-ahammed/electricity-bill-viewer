import { useCallback, useState } from "react";
import { toast } from "sonner";

interface StoredDataWithExpiry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface UseLocalStorageOptions {
    expiryDuration?: number; // in milliseconds
    showErrorToast?: boolean;
}

export const useLocalStorage = <T>(
    key: string,
    initialValue: T,
    options: UseLocalStorageOptions = {}
): {
    value: T;
    setValue: (value: T) => void;
    clearValue: () => void;
    hasValidData: () => boolean;
} => {
    const { expiryDuration, showErrorToast = true } = options;

    const getStoredValue = useCallback((): T => {
        try {
            const item = window.localStorage.getItem(key);
            if (!item) return initialValue;

            // If expiry is set, check if data has expired
            if (expiryDuration) {
                const parsedData: StoredDataWithExpiry<T> = JSON.parse(item);

                // Check if data has expired
                if (Date.now() > parsedData.expiresAt) {
                    window.localStorage.removeItem(key);
                    return initialValue;
                }

                return parsedData.data;
            }

            // No expiry, return raw data
            return JSON.parse(item);
        } catch {
            if (showErrorToast) {
                toast.error(`Failed to read data from storage: ${key}`);
            }
            return initialValue;
        }
    }, [key, initialValue, expiryDuration, showErrorToast]);

    const [storedValue, setStoredValue] = useState<T>(getStoredValue);

    const setValue = useCallback(
        (value: T) => {
            try {
                const valueToStore =
                    value instanceof Function ? value(storedValue) : value;

                setStoredValue(valueToStore);

                // If expiry is set, wrap data with timestamp and expiry
                if (expiryDuration) {
                    const timestamp = Date.now();
                    const dataWithExpiry: StoredDataWithExpiry<T> = {
                        data: valueToStore,
                        timestamp,
                        expiresAt: timestamp + expiryDuration,
                    };
                    window.localStorage.setItem(
                        key,
                        JSON.stringify(dataWithExpiry)
                    );
                } else {
                    // No expiry, store raw data
                    window.localStorage.setItem(
                        key,
                        JSON.stringify(valueToStore)
                    );
                }
            } catch {
                if (showErrorToast) {
                    toast.error(`Failed to save data to storage: ${key}`);
                }
            }
        },
        [key, storedValue, expiryDuration, showErrorToast]
    );

    const clearValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch {
            if (showErrorToast) {
                toast.error(`Failed to clear data from storage: ${key}`);
            }
        }
    }, [key, initialValue, showErrorToast]);

    const hasValidData = useCallback((): boolean => {
        try {
            const item = window.localStorage.getItem(key);
            if (!item) return false;

            // If expiry is set, check if data has expired
            if (expiryDuration) {
                const parsedData: StoredDataWithExpiry<T> = JSON.parse(item);
                return Date.now() <= parsedData.expiresAt;
            }

            return true;
        } catch {
            return false;
        }
    }, [key, expiryDuration]);

    return {
        value: storedValue,
        setValue,
        clearValue,
        hasValidData,
    };
};
