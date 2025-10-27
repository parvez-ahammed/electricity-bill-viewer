import {
    ElectricityAccount,
    ElectricityUsageResponse,
    electricityApi,
} from "@/common/apis/electricity.api";
import { useLocalStorage } from "@/common/hooks/useLocalStorage";
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

export const useBalanceData = () => {
    const [skipCache, setSkipCache] = useState(false);
    const hasShownToast = useRef(false);
    const {
        value: cachedData,
        setValue: setCachedData,
        clearValue: clearCache,
        hasValidData,
    } = useLocalStorage<ElectricityUsageResponse | null>(
        "electricity_balance_data",
        null,
        {
            expiryDuration: 24 * 60 * 60 * 1000, // 24 hours
            showErrorToast: false,
        }
    );

    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ["electricityBalance", skipCache],
        queryFn: async () => {
            hasShownToast.current = false;

            // Check localStorage first if not skipping cache
            if (!skipCache && hasValidData() && cachedData) {
                return cachedData;
            }

            // Fetch from API
            const response = await electricityApi.getUsageData(skipCache);

            // Save to localStorage on successful fetch
            if (response.success) {
                setCachedData(response);
            }

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
        // Clear localStorage before fetching fresh data
        clearCache();
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
