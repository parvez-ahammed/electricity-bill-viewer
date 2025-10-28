import { BalanceViewer } from "./components/BalanceViewer";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui";

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

    if (loading) {
        return (
            <Card className="border-none pt-4 pb-0 shadow-none sm:border sm:shadow-none">
                <CardContent className="p-0">
                    <div className="flex items-center justify-center py-8">
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                        <span className="text-muted-foreground ml-3">
                            Loading account data...
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-none pt-4 pb-0 shadow-none sm:border sm:shadow-none">
                <CardContent className="p-0">
                    <div className="text-destructive flex items-center justify-center py-8">
                        <span>Error: {error}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (accountsData.length === 0) {
        return (
            <Card className="border-none pt-4 pb-0 shadow-none sm:border sm:shadow-none">
                <CardContent className="p-0">
                    <div className="text-muted-foreground flex items-center justify-center py-8">
                        <span>No account data available</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none pt-4 pb-0 shadow-none sm:border sm:shadow-none">
            <CardHeader className="hidden px-0 py-4 sm:block sm:px-0 sm:py-6">
                <CardTitle className="text-lg sm:text-xl">
                    Account Balance Details
                </CardTitle>
                <CardDescription className="text-sm">
                    View your electricity account information and balance
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <BalanceViewer accountsData={accountsData} />
            </CardContent>
        </Card>
    );
};
