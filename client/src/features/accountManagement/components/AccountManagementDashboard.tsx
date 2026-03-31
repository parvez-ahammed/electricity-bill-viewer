import { Account, ElectricityProvider } from "@/common/apis/accounts.api";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useAccounts } from "../hooks/useAccounts";

import { AccountTable } from "./AccountTable";
import { AddAccountForm } from "./AddAccountForm";
import { CorruptionHelp } from "./CorruptionHelp";

const PROVIDERS: {
    name: ElectricityProvider;
    displayName: string;
    color: string;
}[] = [
    { name: "DPDC", displayName: "DPDC", color: "bg-blue-500" },
    { name: "NESCO", displayName: "NESCO", color: "bg-green-500" },
];

const isCorruptedAccount = (account: Account) => {
    return (
        "_isCorrupted" in account.credentials &&
        Boolean(account.credentials._isCorrupted)
    );
};

export const AccountManagementDashboard = () => {
    const { accounts, groupedAccounts, isLoading, error } = useAccounts();
    const [showAddForm, setShowAddForm] = useState<ElectricityProvider | null>(
        null
    );

    // Check if there are any corrupted accounts
    const hasCorruptedAccounts = useMemo(
        () => accounts.some((account) => isCorruptedAccount(account)),
        [accounts]
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                <span className="text-muted-foreground ml-3">
                    Loading accounts...
                </span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-destructive flex items-center justify-center py-8">
                <span>Error: {String(error)}</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Show corruption help if needed */}
            {hasCorruptedAccounts && <CorruptionHelp />}

            {PROVIDERS.map((provider) => (
                <Card key={provider.name} className="w-full gap-0 p-0">
                    <CardHeader className="mb-0 pt-4 pb-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`h-2 w-2 rounded-full ${provider.color}`}
                                />
                                <CardTitle className="text-base">
                                    {provider.displayName}
                                </CardTitle>
                                <span className="text-muted-foreground text-xs">
                                    (
                                    {groupedAccounts[provider.name]?.length ||
                                        0}
                                    )
                                </span>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowAddForm(provider.name)}
                                className="flex h-8 items-center gap-1 px-2 text-xs"
                            >
                                <Plus className="h-3 w-3" />
                                Add
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0 pb-4">
                        {/* Add Account Form */}
                        {showAddForm === provider.name && (
                            <>
                                <AddAccountForm
                                    provider={provider.name}
                                    onCancel={() => setShowAddForm(null)}
                                    onSuccess={() => setShowAddForm(null)}
                                />
                                <Separator className="my-2" />
                            </>
                        )}

                        {/* Existing Accounts */}
                        <AccountTable
                            accounts={groupedAccounts[provider.name] || []}
                            provider={provider.name}
                        />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
