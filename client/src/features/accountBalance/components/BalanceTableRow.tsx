import { TableCell, TableRow } from "@/components/ui/table";

import { PostBalanceDetails } from "../constants/balance.constant";
import { formatDate } from "../utils/dateUtils";

import { ProviderChip } from "./ProviderChip";

interface BalanceTableRowProps {
    account: PostBalanceDetails;
    index: number;
}

export const BalanceTableRow = ({ account, index }: BalanceTableRowProps) => {
    const location = account.flatNameOrLocation || account.location || "-";
    const lastPaymentDate =
        account.lastPayDateOnSa || account.lastPaymentDate || "-";

    return (
        <TableRow
            key={`${account.accountId}-${index}`}
            className="hover:bg-muted/30 border-b transition-colors"
        >
            <TableCell
                className="w-[180px] max-w-[180px] min-w-[180px] py-4"
                title={location}
            >
                <div className="truncate text-sm">{location}</div>
            </TableCell>
            <TableCell className="w-[120px] max-w-[120px] min-w-[120px] py-4">
                <div className="truncate font-mono text-sm font-medium">
                    {account.accountId}
                </div>
            </TableCell>
            <TableCell
                className="w-[150px] max-w-[150px] min-w-[150px] py-4"
                title={account.customerName}
            >
                <div className="truncate text-sm font-medium">
                    {account.customerName}
                </div>
            </TableCell>
            <TableCell className="w-[100px] max-w-[100px] min-w-[100px] py-4">
                <ProviderChip provider={account.provider || "-"} />
            </TableCell>
            <TableCell className="w-[120px] max-w-[120px] min-w-[120px] py-4">
                <div className="truncate text-sm">{account.accountType}</div>
            </TableCell>
            <TableCell className="w-[130px] max-w-[130px] min-w-[130px] py-4">
                <div className="text-primary truncate text-sm font-semibold">
                    ৳ {account.balanceRemaining}
                </div>
            </TableCell>
            <TableCell className="w-[140px] max-w-[140px] min-w-[140px] py-4">
                <div className="text-muted-foreground truncate text-sm">
                    {formatDate(account.balanceLatestDate)}
                </div>
            </TableCell>
            <TableCell className="w-[140px] max-w-[140px] min-w-[140px] py-4">
                <div className="text-muted-foreground truncate text-sm">
                    {lastPaymentDate}
                </div>
            </TableCell>
        </TableRow>
    );
};
