import { Table, TableBody } from "@/components/ui/table";

import { PostBalanceDetails } from "../constants/balance.constant";

import { BalanceTableHeader } from "./BalanceTableHeader";
import { BalanceTableRow } from "./BalanceTableRow";

interface BalanceTableProps {
    accountsData: PostBalanceDetails[];
}

export const BalanceTable = ({ accountsData }: BalanceTableProps) => {
    if (accountsData.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                    No account data available
                </p>
            </div>
        );
    }

    return (
        <Table>
            <BalanceTableHeader />
            <TableBody>
                {accountsData.map((account, index) => (
                    <BalanceTableRow
                        key={`${account.accountId}-${index}`}
                        account={account}
                        index={index}
                    />
                ))}
            </TableBody>
        </Table>
    );
};
