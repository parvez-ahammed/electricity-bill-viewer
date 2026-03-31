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
            className="h-12"
        >
            <NicknameEditor
                accountId={account.accountId}
                currentDisplayName={displayName}
                location={location}
            />
            <TableCell className="w-[140px] min-w-[140px] px-4 py-4 neo-table-cell">
                <div className="truncate font-mono text-sm font-bold">
                    {account.customerNumber || account.accountId || "-"}
                </div>
            </TableCell>
            <TableCell
                className="w-[140px] max-w-[140px] min-w-[140px] px-4 py-4 neo-table-cell"
                title={account.customerName}
            >
                <div className="truncate text-sm font-bold">
                    {account.customerName}
                </div>
            </TableCell>
            <TableCell className="w-[120px] min-w-[120px] px-4 py-4 neo-table-cell">
                <ProviderChip provider={account.provider || "-"} />
            </TableCell>
            <TableCell className="w-[140px] min-w-[140px] px-4 py-4 neo-table-cell">
                <div className="truncate text-sm font-bold">{account.accountType}</div>
            </TableCell>
            <TableCell className="w-[100px] min-w-[100px] px-4 py-4 neo-table-cell">
                <div className="text-[var(--color-neo-primary)] truncate text-sm font-black">
                    ৳ {account.balanceRemaining}
                </div>
            </TableCell>
            <TableCell className="w-[100px] min-w-[100px] px-4 py-4 neo-table-cell">
                <div className="text-black/70 truncate text-sm font-mono font-bold">
                    {formatDate(account.balanceLatestDate)}
                </div>
            </TableCell>
            <TableCell className="w-[100px] min-w-[100px] px-4 py-4 neo-table-cell">
                <div className="text-black/70 truncate text-sm font-mono font-bold">
                    {formattedLastPaymentDate}
                </div>
            </TableCell>
        </TableRow>
    );
};
