import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

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
    const [isExpanded, setIsExpanded] = useState(false);
    const lastPaymentDate =
        account.lastPayDateOnSa || account.lastPaymentDate || "-";

    return (
        <Card
            key={`${account.accountId}-${index}`}
            className="overflow-hidden p-3 transition-all hover:shadow-md"
        >
            <CardContent className="p-0">
                {/* Header Section */}
                <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold">
                            {account.customerName}
                        </h4>
                    </div>
                    <ProviderChip provider={account.provider || "-"} />
                </div>

                {/* Balance Section */}
                <div className="bg-primary/5 mb-2 rounded-lg p-2.5">
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                            Current Balance
                        </p>
                        <p className="text-lg font-bold">
                            ৳ {account.balanceRemaining}
                        </p>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                        <p className="text-muted-foreground text-xs">
                            As of {formatDate(account.balanceLatestDate)}
                        </p>
                        {/* Expand/Collapse Button */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium transition-colors"
                        >
                            <span>{isExpanded ? "Hide" : "Details"}</span>
                            {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                            ) : (
                                <ChevronDown className="h-3 w-3" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Details Grid - Collapsible */}
                {isExpanded && (
                    <div className="animate-in fade-in-50 slide-in-from-top-2 mt-2 space-y-2.5 duration-200">
                        {/* Location */}
                        <div>
                            <p className="text-muted-foreground text-xs font-medium">
                                Location
                            </p>
                            <p className="mt-0.5 text-sm font-medium">
                                {account.flatNameOrLocation ||
                                    account.location ||
                                    "-"}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="border-border border-t" />

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
                            <div className="mt-0.5 flex items-center justify-between">
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
                                            account.connectionStatus ===
                                            "Active"
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
                )}
            </CardContent>
        </Card>
    );
};
