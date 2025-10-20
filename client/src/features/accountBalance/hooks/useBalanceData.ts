import { useState } from "react";

import { PostBalanceDetails } from "../constants/balance.constant";

export const useBalanceData = () => {
    // Dummy/mock data for development
    const [accountsData] = useState<PostBalanceDetails[]>([
        {
            accountId: "0277146916",
            customerName: "ABDUL KADER DALI",
            customerClass: "Private",
            mobileNumber: "01819127919",
            emailId: "",
            accountType: "Pre Paid",
            balanceRemaining: "59.66",
            connectionStatus: "Active",
            customerType: null,
            minRecharge: null,
            balanceLatestDate: "2025-10-17-06.59.58",
            lastPayAmtOnSa: "500.00",
            lastPayDateOnSa: "2025-10-09",
            flatNameOrLocation: "Flat 3B, Building 12",
            provider: "DPDC",
        },
        // Add more dummy accounts as needed
    ]);

    const loading = false;
    const error = null;

    return {
        accountsData,
        loading,
        error,
    };
};
