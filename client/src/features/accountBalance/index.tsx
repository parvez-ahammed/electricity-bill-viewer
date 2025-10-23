import { BalanceCard } from "./components/BalanceCard";

import { useBalanceData } from "./hooks/useBalanceData";

// Extend Window interface to include our custom function
declare global {
    interface Window {
        refreshElectricityData?: () => Promise<void>;
    }
}

export const AccountBalance = () => {
    const { accountsData, loading, error, refreshWithSkipCache } =
        useBalanceData();

    // Expose refresh function to window for navbar access
    if (typeof window !== "undefined") {
        window.refreshElectricityData = refreshWithSkipCache;
    }

    return (
        <BalanceCard
            accountsData={accountsData}
            loading={loading}
            error={error}
        />
    );
};
