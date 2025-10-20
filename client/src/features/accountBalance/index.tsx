import { BalanceCard } from "./components/BalanceCard";

import { useBalanceData } from "./hooks/useBalanceData";

export const AccountBalance = () => {
    const { accountsData, loading, error } = useBalanceData();

    return (
        <BalanceCard
            accountsData={accountsData}
            loading={loading}
            error={error}
        />
    );
};
