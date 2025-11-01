import {
    ElectricityAccount,
    ElectricityUsageResponse,
    electricityApi,
} from "@/common/apis/electricity.api";
import { useLocalStorage } from "@/common/hooks/useLocalStorage";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Extended interface to track if data is from cache
interface ExtendedElectricityUsageResponse extends ElectricityUsageResponse {
    fromCache?: boolean;
}

import {
    CACHE_EXPIRY_DURATION,
    CACHE_GC_TIME,
    CACHE_STALE_TIME,
    PostBalanceDetails,
} from "../constants/balance.constant";

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
    const [skipCache] = useState(false);
    const hasShownToast = useRef(false);
    const isRefreshing = useRef(false);
    const hasInitiallyLoaded = useRef(false);
    const lastDataSource = useRef<'cache' | 'api' | null>(null);
    const {
        value: cachedData,
        setValue: setCachedData,
        clearValue: clearCache,
        hasValidData,
    } = useLocalStorage<ElectricityUsageResponse | null>(
        "electricity_balance_data",
        null,
        {
            expiryDuration: CACHE_EXPIRY_DURATION,
            showErrorToast: false,
        }
    );

    const { data, isLoading, error, refetch, isFetching } = useQuery<ExtendedElectricityUsageResponse>({
        queryKey: ["electricityBalance", skipCache],
        queryFn: async (): Promise<ExtendedElectricityUsageResponse> => {
            // Determine if we should skip cache (either from state or refresh)
            const shouldSkipCache = skipCache || isRefreshing.current;

            // Check localStorage first if not skipping cache
            if (!shouldSkipCache && hasValidData() && cachedData) {
                // Mark as cached data to prevent success toast
                // Don't reset hasShownToast for cached data
                lastDataSource.current = 'cache';
                return { ...cachedData, fromCache: true };
            }

            // Only reset toast flag when making actual API call
            hasShownToast.current = false;
            lastDataSource.current = 'api';

            // Fetch from API
            const response = await electricityApi.getUsageData(shouldSkipCache);

            // Save to localStorage on successful fetch
            if (response.success) {
                setCachedData(response);
            }

            // Mark as fresh data
            return { ...response, fromCache: false };
        },
        staleTime: skipCache ? 0 : CACHE_STALE_TIME,
        gcTime: CACHE_GC_TIME,
        refetchOnWindowFocus: false,
    });

    // Show toasts based on data
    useEffect(() => {
        if (data && !hasShownToast.current && lastDataSource.current === 'api') {
            hasShownToast.current = true;

            if (data.success && data.accounts.length > 0) {
                // Only show success toast for API data (not cached data)
                // Show on initial load or explicit refresh
                if (!hasInitiallyLoaded.current || isRefreshing.current) {
                    toast.success(
                        `${isRefreshing.current ? "Refreshed" : "Loaded"} ${data.totalAccounts} account(s) successfully`
                    );
                }

                // Show error toasts for failed accounts
                if (data.errors && data.errors.length > 0) {
                    toast.warning(
                        `${data.failedLogins} account(s) failed to load`
                    );
                }
            } else {
                // Show "no accounts" error for API data
                toast.error("No electricity accounts found");
            }
            
            // Mark that we've initially loaded data
            hasInitiallyLoaded.current = true;
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
        data?.accounts?.map(transformAccountData) ??
        ([] as PostBalanceDetails[]);

    const refreshWithSkipCache = async () => {
        // Clear localStorage before fetching fresh data
        clearCache();
        
        // Reset toast flag to allow showing success message for refresh
        hasShownToast.current = false;
        
        // Set refresh flag to force skip cache without changing query key
        isRefreshing.current = true;
        
        try {
            // Refetch with the current query key - this should only trigger ONE API call
            await refetch();
        } finally {
            // Reset refresh flag
            isRefreshing.current = false;
        }
    };

    return {
        accountsData,
        loading: isLoading || isFetching,
        error: error ? String(error) : null,
        refresh: refetch,
        refreshWithSkipCache,
    };
};
