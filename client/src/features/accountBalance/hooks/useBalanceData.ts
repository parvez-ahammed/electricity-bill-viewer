import {
    ElectricityAccount,
    ElectricityCredential,
    electricityApi,
} from "@/common/apis/electricity.api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PostBalanceDetails } from "../constants/balance.constant";

const transformAccountData = (
    account: ElectricityAccount
): PostBalanceDetails => {
    return {
        accountId: account.accountId,
        customerNumber: account.customerNumber,
        customerName: account.customerName,
        customerClass: "",
        mobileNumber: account.mobileNumber,
        emailId: "",
        accountType: account.accountType,
        balanceRemaining: account.balanceRemaining,
        connectionStatus: account.connectionStatus,
        customerType: null,
        minRecharge: account.minRecharge,
        balanceLatestDate: account.balanceLatestDate,
        lastPayAmtOnSa: account.lastPaymentAmount,
        lastPayDateOnSa: account.lastPaymentDate,
        lastPaymentAmount: account.lastPaymentAmount,
        lastPaymentDate: account.lastPaymentDate,
        flatNameOrLocation: account.location,
        location: account.location,
        provider: account.provider,
    };
};

// Read credentials from environment variable
const getCredentialsFromEnv = (): ElectricityCredential[] => {
    try {
        const credentialsEnv = import.meta.env.VITE_ELECTRICITY_CREDENTIALS;

        if (!credentialsEnv) {
            return [];
        }

        const credentials = JSON.parse(
            credentialsEnv
        ) as ElectricityCredential[];

        // Validate the structure
        if (!Array.isArray(credentials)) {
            return [];
        }

        return credentials.filter(
            (cred) => cred.provider && cred.username && cred.password
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`Failed to parse VITE_ELECTRICITY_CREDENTIALS: ${errorMessage}`);
        return [];
    }
};

const CREDENTIALS: ElectricityCredential[] = getCredentialsFromEnv();

export const useBalanceData = () => {
    const [skipCache, setSkipCache] = useState(false);
    const hasShownToast = useRef(false);

    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ["electricityBalance", skipCache],
        queryFn: async () => {
            hasShownToast.current = false;
            const response = await electricityApi.getUsageData(
                CREDENTIALS,
                skipCache
            );
            return response;
        },
        staleTime: skipCache ? 0 : 5 * 60 * 1000, // 5 minutes if cached, 0 if skip cache
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });

    // Show toasts based on data
    useEffect(() => {
        if (data && !hasShownToast.current) {
            hasShownToast.current = true;

            if (data.success && data.accounts.length > 0) {
                toast.success(
                    `${skipCache ? "Refreshed" : "Loaded"} ${data.totalAccounts} account(s) successfully`
                );

                if (data.errors && data.errors.length > 0) {
                    toast.warning(
                        `${data.failedLogins} account(s) failed to load`
                    );
                }
            } else {
                toast.error("No electricity accounts found");
            }
        }
    }, [data, skipCache]);

    // Show error toast
    useEffect(() => {
        if (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch balance data";
            toast.error(errorMessage);
        }
    }, [error]);

    const accountsData =
        data?.accounts.map(transformAccountData) ??
        ([] as PostBalanceDetails[]);

    const refreshWithSkipCache = async () => {
        setSkipCache(true);
        await refetch();
        // Reset skip cache after fetch
        setTimeout(() => setSkipCache(false), 100);
    };

    return {
        accountsData,
        loading: isLoading || isFetching,
        error: error ? String(error) : null,
        refresh: refetch,
        refreshWithSkipCache,
    };
};
