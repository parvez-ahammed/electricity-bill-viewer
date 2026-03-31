import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui";
import { AccountManagementDashboard } from "./components/AccountManagementDashboard";
import { NotificationManagement } from "./components/NotificationManagement";

export const AccountManagement = () => {
    return (
        <div className="space-y-2 pt-4">
            <Card className="border-none bg-transparent pt-2 pb-0 shadow-none mt-0">
                <CardHeader className="hidden px-0 py-2 sm:block sm:px-0 sm:py-3">
                    <CardTitle className="text-lg sm:text-2xl font-black uppercase tracking-tighter">
                        Account Management
                    </CardTitle>
                    <CardDescription className="text-sm font-bold text-black/60">
                        Manage your electricity provider accounts
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <AccountManagementDashboard />
                </CardContent>
            </Card>

            <NotificationManagement />
        </div>
    );
};