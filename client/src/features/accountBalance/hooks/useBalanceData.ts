import {
    ElectricityAccount,
    ElectricityCredential,
    electricityApi,
} from "@/common/apis/electricity.api";
import { useEffect, useState } from "react";
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
    } catch {
        return [];
    }
};

const CREDENTIALS: ElectricityCredential[] = getCredentialsFromEnv();

export const useBalanceData = () => {
    const [accountsData, setAccountsData] = useState<PostBalanceDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBalanceData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await electricityApi.getUsageData(CREDENTIALS);

                if (response.success && response.accounts.length > 0) {
                    const transformedData =
                        response.accounts.map(transformAccountData);
                    setAccountsData(transformedData);

                    toast.success(
                        `Loaded ${response.totalAccounts} account(s) successfully`
                    );

                    if (response.errors && response.errors.length > 0) {
                        toast.warning(
                            `${response.failedLogins} account(s) failed to load`
                        );
                    }
                } else {
                    setError("No accounts found");
                    toast.error("No electricity accounts found");
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch balance data";
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchBalanceData();
    }, []);

    return {
        accountsData,
        loading,
        error,
    };
};
