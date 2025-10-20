import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { PostBalanceDetails } from "../constants/balance.constant";
import { formatDate } from "../utils/dateUtils";

import { ProviderChip } from "./ProviderChip";

interface BalanceCardViewProps {
    account: PostBalanceDetails;
    index: number;
}

export const BalanceCardView = ({ account, index }: BalanceCardViewProps) => {
    const location = account.flatNameOrLocation || account.location || "-";
    const lastPaymentDate =
        account.lastPayDateOnSa || account.lastPaymentDate || "-";

    return (
        <Card
            key={`${account.accountId}-${index}`}
            className="overflow-hidden transition-shadow hover:shadow-md"
        >
            <CardContent className="p-4">
                {/* Header Section */}
                <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <h3 className="text-base leading-tight font-semibold">
                            {account.customerName}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {location}
                        </p>
                    </div>
                    <ProviderChip provider={account.provider || "-"} />
                </div>

                {/* Balance Section */}
                <div className="bg-primary/5 mb-4 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        Current Balance
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                        ৳ {account.balanceRemaining}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                        As of {formatDate(account.balanceLatestDate)}
                    </p>
                </div>

                {/* Details Grid */}
                <div className="space-y-3">
                    {/* Account ID & Type */}
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-muted-foreground text-xs font-medium">
                                Account ID
                            </p>
                            <p className="mt-0.5 text-sm font-medium">
                                {account.accountId}
                            </p>
                        </div>
                        <div className="flex-1 text-right">
                            <p className="text-muted-foreground text-xs font-medium">
                                Type
                            </p>
                            <Badge
                                variant="secondary"
                                className="mt-0.5 text-xs"
                            >
                                {account.accountType}
                            </Badge>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-border border-t" />

                    {/* Last Payment Info */}
                    <div>
                        <p className="text-muted-foreground text-xs font-medium">
                            Last Payment
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                            <p className="text-sm font-medium">
                                ৳ {account.lastPayAmtOnSa || "-"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {lastPaymentDate}
                            </p>
                        </div>
                    </div>

                    {/* Connection Status */}
                    {account.connectionStatus && (
                        <>
                            <div className="border-border border-t" />
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground text-xs font-medium">
                                    Status
                                </p>
                                <Badge
                                    variant={
                                        account.connectionStatus === "Active"
                                            ? "default"
                                            : "secondary"
                                    }
                                    className="text-xs"
                                >
                                    {account.connectionStatus}
                                </Badge>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
