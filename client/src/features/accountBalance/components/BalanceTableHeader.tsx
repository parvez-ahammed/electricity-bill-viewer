import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { TABLE_HEADERS } from "../constants/balance.constant";

const COLUMN_WIDTHS: Record<string, string> = {
    "Flat Name / Location": "w-[200px] min-w-[200px]",
    "Customer Number": "w-[140px] min-w-[140px]",
    "Customer Name": "w-[140px] min-w-[140px] max-w-[140px]",
    Provider: "w-[120px] min-w-[120px]",
    "Account Type": "w-[140px] min-w-[140px]",
    Remaining: "w-[120px] min-w-[120px]",
    Updated: "w-[120px] min-w-[120px]",
    Recharged: "w-[120px] min-w-[120px]",
};

export const BalanceTableHeader = () => {
    return (
        <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-muted/50">
                {TABLE_HEADERS.map((header) => (
                    <TableHead
                        key={header}
                        className={`text-foreground px-4 font-semibold whitespace-nowrap ${COLUMN_WIDTHS[header] || ""}`}
                    >
                        {header}
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
    );
};
