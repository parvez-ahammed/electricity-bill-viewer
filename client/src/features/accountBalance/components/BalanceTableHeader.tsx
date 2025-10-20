import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { TABLE_HEADERS } from "../constants/balance.constant";

const COLUMN_WIDTHS: Record<string, string> = {
    "Flat Name / Location": "w-[180px] min-w-[180px] max-w-[180px]",
    "Account ID": "w-[120px] min-w-[120px] max-w-[120px]",
    "Customer Name": "w-[150px] min-w-[150px] max-w-[150px]",
    Provider: "w-[100px] min-w-[100px] max-w-[100px]",
    "Account Type": "w-[120px] min-w-[120px] max-w-[120px]",
    "Balance Remaining": "w-[130px] min-w-[130px] max-w-[130px]",
    "Balance Latest Date": "w-[140px] min-w-[140px] max-w-[140px]",
    "Last Payment Date": "w-[140px] min-w-[140px] max-w-[140px]",
};

export const BalanceTableHeader = () => {
    return (
        <TableHeader>
            <TableRow>
                {TABLE_HEADERS.map((header) => (
                    <TableHead
                        key={header}
                        className={COLUMN_WIDTHS[header] || ""}
                    >
                        {header}
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
    );
};
