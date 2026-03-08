import { useState } from "react";
import { toast } from "sonner";

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
            toast.error("Failed to refresh data");
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