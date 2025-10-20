import { Table, TableBody } from "@/components/ui/table";

import { PostBalanceDetails } from "../constants/balance.constant";

import { BalanceCardView } from "./BalanceCardView";
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
        <>
            {/* Mobile Card View */}
            <div className="block space-y-4 md:hidden">
                {accountsData.map((account, index) => (
                    <BalanceCardView
                        key={`${account.accountId}-${index}`}
                        account={account}
                        index={index}
                    />
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden w-full overflow-x-auto md:block">
                <Table className="table-fixed">
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
            </div>
        </>
    );
};
