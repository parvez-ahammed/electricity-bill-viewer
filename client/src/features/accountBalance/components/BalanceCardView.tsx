import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { PostBalanceDetails } from "../constants/balance.constant";
import { formatDate } from "../utils/dateUtils";

import { ProviderChip } from "./ProviderChip";

interface BalanceCardViewProps {
    account: PostBalanceDetails;
}

export const BalanceCardView = ({ account }: BalanceCardViewProps) => {
    const lastPaymentDate =
        account.lastPayDateOnSa || account.lastPaymentDate || "-";
    const formattedLastPaymentDate =
        lastPaymentDate !== "-" ? formatDate(lastPaymentDate) : "-";

    return (
        <Card className="overflow-hidden py-0 transition-all bg-transparent shadow-none border-none hover:shadow-none hover:translate-y-0">
            <CardContent className="p-0">
                {/* Header Section */}
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold">
                            {account.displayName ||
                                account.flatNameOrLocation ||
                                account.location ||
                                "-"}
                        </h4>
                    </div>
                    <ProviderChip provider={account.provider || "-"} />
                </div>

                {/* Balance Section with Accordion */}
                <Accordion type="single" collapsible>
                    <AccordionItem value="details" className="border-none">
                        <div className="bg-white border-[3px] border-[var(--color-neo-border)] shadow-neo">
                            {/* Summary Trigger Part */}
                            <div className="p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-black text-[10px] font-bold tracking-widest uppercase">
                                        Current Balance
                                    </p>
                                    <p className="text-2xl font-black text-[var(--color-neo-primary)]">
                                        ৳ {account.balanceRemaining}
                                    </p>
                                </div>
                                <div className="mt-2 flex items-center justify-between border-t-2 border-[var(--color-neo-border)] pt-2">
                                    <p className="text-black/60 text-xs font-bold font-mono">
                                        AS OF {formatDate(account.balanceLatestDate).toUpperCase()}
                                    </p>
                                    <AccordionTrigger className="text-black hover:text-[var(--color-neo-primary)] py-0 text-xs font-black uppercase hover:no-underline">
                                        Details
                                    </AccordionTrigger>
                                </div>
                            </div>
                            
                            {/* Expanded Content Part */}
                            <AccordionContent className="space-y-2.5 px-4 pb-4 border-t-2 border-[var(--color-neo-border)] pt-4">
                                {/* Location */}
                                <div>
                                    <p className="text-black/60 text-[10px] font-black uppercase tracking-wider">
                                        Location
                                    </p>
                                    <p className="mt-0.5 text-sm font-bold">
                                        {account.flatNameOrLocation ||
                                            account.location ||
                                            "-"}
                                    </p>
                                </div>

                                <Separator className="h-[2px] bg-[var(--color-neo-border)] opacity-20" />

                                {/* Customer Number & Type */}
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-black/60 text-[10px] font-black uppercase tracking-wider">
                                            Customer Number
                                        </p>
                                        <p className="mt-0.5 text-sm font-bold font-mono">
                                            {account.customerNumber ||
                                                account.accountId ||
                                                "-"}
                                        </p>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <p className="text-black/60 text-[10px] font-black uppercase tracking-wider">
                                            Type
                                        </p>
                                        <div className="mt-1 inline-flex bg-[var(--color-neo-accent)] px-2 py-0.5 text-[10px] font-black uppercase neo-border-2">
                                            {account.accountType}
                                        </div>
                                    </div>
                                </div>

                                <Separator className="h-[2px] bg-[var(--color-neo-border)] opacity-20" />

                                {/* Recharged Info */}
                                <div>
                                    <p className="text-black/60 text-[10px] font-black uppercase tracking-wider">
                                        Last Recharged
                                    </p>
                                    <div className="mt-0.5 flex items-center justify-between">
                                        <p className="text-sm font-black text-green-700">
                                            ৳ {account.lastPayAmtOnSa || "-"}
                                        </p>
                                        <p className="text-black/60 text-xs font-bold font-mono">
                                            {formattedLastPaymentDate}
                                        </p>
                                    </div>
                                </div>

                                {/* Connection Status */}
                                {account.connectionStatus && (
                                    <>
                                        <Separator className="h-[2px] bg-[var(--color-neo-border)] opacity-20" />
                                        <div className="flex items-center justify-between">
                                            <p className="text-black/60 text-[10px] font-black uppercase tracking-wider">
                                                Status
                                            </p>
                                            <div className={`mt-0.5 inline-flex px-2 py-0.5 text-[10px] font-black uppercase neo-border-2 ${
                                                account.connectionStatus === "Active" 
                                                ? "bg-[var(--color-neo-secondary)]" 
                                                : "bg-[var(--color-neo-muted)]"
                                            }`}>
                                                {account.connectionStatus}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </AccordionContent>
                        </div>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};
