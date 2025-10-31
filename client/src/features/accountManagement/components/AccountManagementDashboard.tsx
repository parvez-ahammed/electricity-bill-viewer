import { ElectricityProvider } from "@/common/apis/accounts.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAccounts } from "../hooks/useAccounts";
import { AccountTable } from "./AccountTable";
import { AddAccountForm } from "./AddAccountForm";

const PROVIDERS: { name: ElectricityProvider; displayName: string; color: string }[] = [
    { name: "DPDC", displayName: "DPDC", color: "bg-blue-500" },
    { name: "NESCO", displayName: "NESCO", color: "bg-green-500" },
];

export const AccountManagementDashboard = () => {
    const { groupedAccounts, isLoading, error } = useAccounts();
    const [showAddForm, setShowAddForm] = useState<ElectricityProvider | null>(null);

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
            {PROVIDERS.map((provider) => (
                <Card key={provider.name} className="w-full p-0 gap-0">
                    <CardHeader className="pb-0 pt-4 mb-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${provider.color}`} />
                                <CardTitle className="text-base">
                                    {provider.displayName}
                                </CardTitle>
                                <span className="text-xs text-muted-foreground">
                                    ({groupedAccounts[provider.name]?.length || 0})
                                </span>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowAddForm(provider.name)}
                                className="flex items-center gap-1 h-8 px-2 text-xs"
                            >
                                <Plus className="h-3 w-3" />
                                Add
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-4 space-y-3">
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