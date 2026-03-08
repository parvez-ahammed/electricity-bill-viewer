import { nicknameApi } from "@/common/apis/electricity.api";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const useNicknameManager = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Replicate the exact same refresh logic as the navbar refresh button
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
            // Keep spinning for a bit to show feedback (same as navbar)
            setTimeout(() => setIsRefreshing(false), 1000);
        }
    };

    const setNicknameMutation = useMutation({
        mutationFn: ({ accountId, nickname }: { accountId: string; nickname: string }) => 
            nicknameApi.setNickname(accountId, nickname),
        onSuccess: async () => {
            // Use the exact same refresh logic as the navbar refresh button
            toast.success("Nickname updated successfully");
            await handleRefresh();
        },
        onError: () => {
            toast.error("Failed to update nickname");
        },
    });

    const deleteNicknameMutation = useMutation({
        mutationFn: (accountId: string) => nicknameApi.deleteNickname(accountId),
        onSuccess: async () => {
            // Use the exact same refresh logic as the navbar refresh button
            await handleRefresh();
            toast.success("Nickname removed successfully");
        },
        onError: () => {
            toast.error("Failed to remove nickname");
        },
    });

    return {
        setNicknameMutation,
        deleteNicknameMutation,
        isRefreshing, // Export this in case components want to show loading state
    };
};