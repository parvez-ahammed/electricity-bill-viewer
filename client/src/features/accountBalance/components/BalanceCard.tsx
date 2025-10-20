import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { PostBalanceDetails } from "../constants/balance.constant";

import { BalanceTable } from "./BalanceTable";

interface BalanceCardProps {
    accountsData: PostBalanceDetails[];
}

export const BalanceCard = ({ accountsData }: BalanceCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Balance Details</CardTitle>
                <CardDescription>
                    View your electricity account information and balance
                </CardDescription>
            </CardHeader>
            <CardContent>
                <BalanceTable accountsData={accountsData} />
            </CardContent>
        </Card>
    );
};
