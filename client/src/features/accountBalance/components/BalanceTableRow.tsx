import { TableCell, TableRow } from "@/components/ui/table";

import { PostBalanceDetails } from "../constants/balance.constant";
import { formatDate } from "../utils/dateUtils";

import { NicknameEditor } from "./NicknameEditor";
import { ProviderChip } from "./ProviderChip";

interface BalanceTableRowProps {
    account: PostBalanceDetails;
    index: number;
}

export const BalanceTableRow = ({ account, index }: BalanceTableRowProps) => {
    const displayName = account.displayName || account.flatNameOrLocation || account.location || "-";
    const location = account.flatNameOrLocation || account.location || "-";
    const lastPaymentDate =
        account.lastPayDateOnSa || account.lastPaymentDate || "-";
    const formattedLastPaymentDate =
        lastPaymentDate !== "-" ? formatDate(lastPaymentDate) : "-";

    return (
        <TableRow
            key={`${account.accountId}-${index}`}
            className="hover:bg-muted/30 border-b transition-colors"
        >
            <NicknameEditor
                accountId={account.accountId}
                currentDisplayName={displayName}
                location={location}
            />
            <TableCell className="w-[140px] min-w-[140px] px-4 py-4">
                <div className="truncate font-mono text-sm font-medium">
                    {account.customerNumber || account.accountId || "-"}
                </div>
            </TableCell>
            <TableCell
                className="w-[140px] max-w-[140px] min-w-[140px] px-4 py-4"
                title={account.customerName}
            >
                <div className="truncate text-sm font-medium">
                    {account.customerName}
                </div>
            </TableCell>
            <TableCell className="w-[120px] min-w-[120px] px-4 py-4">
                <ProviderChip provider={account.provider || "-"} />
            </TableCell>
            <TableCell className="w-[140px] min-w-[140px] px-4 py-4">
                <div className="truncate text-sm">{account.accountType}</div>
            </TableCell>
            <TableCell className="w-30 min-w-30 px-4 py-4">
                <div className="text-primary truncate text-sm font-semibold">
                    ৳ {account.balanceRemaining}
                </div>
            </TableCell>
            <TableCell className="w-30 min-w-30 px-4 py-4">
                <div className="text-muted-foreground truncate text-sm">
                    {formatDate(account.balanceLatestDate)}
                </div>
            </TableCell>
            <TableCell className="w-30 min-w-30 px-4 py-4">
                <div className="text-muted-foreground truncate text-sm">
                    {formattedLastPaymentDate}
                </div>
            </TableCell>
        </TableRow>
    );
};
