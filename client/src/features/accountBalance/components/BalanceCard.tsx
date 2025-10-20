import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { PostBalanceDetails } from "../constants/balance.constant";

import { BalanceTable } from "./BalanceTable";

interface BalanceCardProps {
    accountsData: PostBalanceDetails[];
    loading?: boolean;
    error?: string | null;
}

export const BalanceCard = ({
    accountsData,
    loading,
    error,
}: BalanceCardProps) => {
    return (
        <Card className="border-none shadow-none sm:border sm:shadow-sm">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
                <CardTitle className="text-lg sm:text-xl">
                    Account Balance Details
                </CardTitle>
                <CardDescription className="text-sm">
                    View your electricity account information and balance
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                        <span className="text-muted-foreground ml-3">
                            Loading account data...
                        </span>
                    </div>
                ) : error ? (
                    <div className="text-destructive flex items-center justify-center py-8">
                        <span>Error: {error}</span>
                    </div>
                ) : accountsData.length === 0 ? (
                    <div className="text-muted-foreground flex items-center justify-center py-8">
                        <span>No account data available</span>
                    </div>
                ) : (
                    <BalanceTable accountsData={accountsData} />
                )}
            </CardContent>
        </Card>
    );
};
