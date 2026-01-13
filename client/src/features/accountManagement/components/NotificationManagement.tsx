import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAccounts } from "../hooks/useAccounts";
import { NotificationSettingsItem } from "./NotificationSettingsItem";

export const NotificationManagement = () => {
    const { accounts, isLoading } = useAccounts();

    if (isLoading) return null;

    if (accounts.length === 0) {
        return null; // Don't show if no accounts
    }

    return (
        <Card className="border-none pt-2 pb-0 shadow-none sm:border sm:shadow-none mt-4">
            <CardHeader className="hidden px-0 py-2 sm:block sm:px-0 sm:py-3">
                <CardTitle className="text-base sm:text-lg">
                    Notification Management
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    Configure Telegram alerts for your accounts
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:pb-4 gap-4 flex flex-col">
                <div className="bg-card rounded-lg border p-4 space-y-4">
                   <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Telegram Notifications</h4>
                        <p className="text-xs text-muted-foreground">
                            Receive daily balance updates on Telegram.
                        </p>
                    </div>
                    <Separator />
                    <div className="divide-y">
                        {accounts.map((account) => (
                            <NotificationSettingsItem key={account.id} account={account} />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
