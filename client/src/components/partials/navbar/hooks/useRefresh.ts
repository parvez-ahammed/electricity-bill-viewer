import { useState } from "react";

export const useRefresh = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Call the global refresh function exposed by AccountBalance
            if (
                typeof window !== "undefined" &&
                window.refreshElectricityData
            ) {
                await window.refreshElectricityData();
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error refreshing data:", error);
        } finally {
            // Keep spinning for a bit to show feedback
            setTimeout(() => setIsRefreshing(false), 1000);
        }
    };

    return {
        isRefreshing,
        handleRefresh,
    };
};