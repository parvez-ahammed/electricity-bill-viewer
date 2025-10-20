import { TableCell, TableRow } from "@/components/ui/table";

import { PostBalanceDetails } from "../constants/balance.constant";
import { formatDate } from "../utils/dateUtils";

interface BalanceTableRowProps {
    account: PostBalanceDetails;
    index: number;
}

export const BalanceTableRow = ({ account, index }: BalanceTableRowProps) => {
    return (
        <TableRow key={`${account.accountId}-${index}`}>
            <TableCell>{account.flatNameOrLocation || "-"}</TableCell>
            <TableCell className="font-medium">{account.accountId}</TableCell>
            <TableCell>{account.customerName}</TableCell>
            <TableCell>{account.provider || "-"}</TableCell>
            <TableCell>{account.accountType}</TableCell>
            <TableCell>৳ {account.balanceRemaining}</TableCell>
            <TableCell>{formatDate(account.balanceLatestDate)}</TableCell>
            <TableCell>{account.lastPayDateOnSa}</TableCell>
        </TableRow>
    );
};
