import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { TABLE_HEADERS } from "../constants/balance.constant";

const COLUMN_WIDTHS: Record<string, string> = {
    "Flat Name / Location": "w-[200px] min-w-[200px]",
    "Customer Number": "w-[140px] min-w-[140px]",
    "Customer Name": "w-[140px] min-w-[140px] max-w-[140px]",
    Provider: "w-[120px] min-w-[120px]",
    "Account Type": "w-[140px] min-w-[140px]",
    Remaining: "w-[100px] min-w-[100px]",
    Updated: "w-[100px] min-w-[100px]",
    Recharged: "w-[100px] min-w-[100px]",
};

export const BalanceTableHeader = () => {
    return (
        <TableHeader>
            <TableRow className="h-10 border-b-[3px] border-[var(--color-neo-border)]">
                {TABLE_HEADERS.map((header) => (
                    <TableHead
                        key={header}
                        className={`py-2 text-xs font-black uppercase tracking-wider text-black neo-table-cell ${COLUMN_WIDTHS[header] || ""}`}
                    >
                        {header}
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
    );
};
