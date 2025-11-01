import {
    Account,
    accountsApi,
    ElectricityProvider,
    UpdateAccountRequest
} from "@/common/apis/accounts.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAccounts = () => {
    const queryClient = useQueryClient();

    const { data: accounts = [], isLoading, error } = useQuery({
        queryKey: ["accounts"],
        queryFn: accountsApi.getAllAccounts,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const createAccountMutation = useMutation({
        mutationFn: accountsApi.createAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            toast.success("Account created successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to create account");
        },
    });

    const updateAccountMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAccountRequest }) =>
            accountsApi.updateAccount(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            toast.success("Account updated successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update account");
        },
    });

    const deleteAccountMutation = useMutation({
        mutationFn: accountsApi.deleteAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            toast.success("Account deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete account");
        },
    });

    const forceDeleteAccountMutation = useMutation({
        mutationFn: accountsApi.forceDeleteAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            toast.success("Corrupted account deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete corrupted account");
        },
    });

    // Group accounts by provider
    const groupedAccounts = accounts.reduce((acc, account) => {
        if (!acc[account.provider]) {
            acc[account.provider] = [];
        }
        acc[account.provider].push(account);
        return acc;
    }, {} as Record<ElectricityProvider, Account[]>);

    return {
        accounts,
        groupedAccounts,
        isLoading,
        error,
        createAccount: createAccountMutation.mutate,
        updateAccount: updateAccountMutation.mutate,
        deleteAccount: deleteAccountMutation.mutate,
        forceDeleteAccount: forceDeleteAccountMutation.mutate,
        isCreating: createAccountMutation.isPending,
        isUpdating: updateAccountMutation.isPending,
        isDeleting: deleteAccountMutation.isPending || forceDeleteAccountMutation.isPending,
    };
};