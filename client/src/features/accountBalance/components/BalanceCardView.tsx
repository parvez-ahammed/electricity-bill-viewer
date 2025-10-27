import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
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
    const lastPaymentDate =
        account.lastPayDateOnSa || account.lastPaymentDate || "-";
    const formattedLastPaymentDate =
        lastPaymentDate !== "-" ? formatDate(lastPaymentDate) : "-";

    return (
        <Card
            key={`${account.accountId}-${index}`}
            className="overflow-hidden transition-all hover:shadow-md"
        >
            <CardContent className="p-3">
                {/* Header Section */}
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold">
                            {account.customerName}
                        </h4>
                    </div>
                    <ProviderChip provider={account.provider || "-"} />
                </div>

                {/* Balance Section */}
                <div className="bg-primary/5 rounded-lg p-2.5">
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                            Current Balance
                        </p>
                        <p className="text-lg font-bold">
                            ৳ {account.balanceRemaining}
                        </p>
                    </div>
                    <div className="mt-1">
                        <p className="text-muted-foreground text-xs">
                            As of {formatDate(account.balanceLatestDate)}
                        </p>
                    </div>
                </div>

                {/* Details Accordion */}
                <Accordion type="single" collapsible className="mt-2">
                    <AccordionItem value="details" className="border-none">
                        <AccordionTrigger className="text-muted-foreground hover:text-foreground py-2 text-xs font-medium hover:no-underline">
                            View Details
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2.5 pt-1">
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
                                        {formattedLastPaymentDate}
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
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};
