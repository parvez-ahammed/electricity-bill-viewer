import { BalanceCard } from "./components/BalanceCard";

import { useBalanceData } from "./hooks/useBalanceData";

export const AccountBalance = () => {
    const { accountsData } = useBalanceData();

    return <BalanceCard accountsData={accountsData} />;
};
