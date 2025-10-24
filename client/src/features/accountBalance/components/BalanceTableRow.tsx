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
        <TableRow key={`${account.accountId}-${index}`}>
            <TableCell
                className="w-[180px] max-w-[180px] min-w-[180px]"
                title={location}
            >
                <div className="truncate">{location}</div>
            </TableCell>
            <TableCell className="w-[120px] max-w-[120px] min-w-[120px] font-medium">
                <div className="truncate">{account.accountId}</div>
            </TableCell>
            <TableCell
                className="w-[150px] max-w-[150px] min-w-[150px]"
                title={account.customerName}
            >
                <div className="truncate">{account.customerName}</div>
            </TableCell>
            <TableCell className="w-[100px] max-w-[100px] min-w-[100px]">
                <ProviderChip provider={account.provider || "-"} />
            </TableCell>
            <TableCell className="w-[120px] max-w-[120px] min-w-[120px]">
                <div className="truncate">{account.accountType}</div>
            </TableCell>
            <TableCell className="w-[130px] max-w-[130px] min-w-[130px]">
                <div className="truncate">৳ {account.balanceRemaining}</div>
            </TableCell>
            <TableCell className="w-[140px] max-w-[140px] min-w-[140px]">
                <div className="truncate">
                    {formatDate(account.balanceLatestDate)}
                </div>
            </TableCell>
            <TableCell className="w-[140px] max-w-[140px] min-w-[140px]">
                <div className="truncate">{lastPaymentDate}</div>
            </TableCell>
        </TableRow>
    );
};
