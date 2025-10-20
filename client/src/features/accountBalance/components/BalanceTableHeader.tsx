import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { TABLE_HEADERS } from "../constants/balance.constant";

export const BalanceTableHeader = () => {
    return (
        <TableHeader>
            <TableRow>
                {TABLE_HEADERS.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                ))}
            </TableRow>
        </TableHeader>
    );
};
