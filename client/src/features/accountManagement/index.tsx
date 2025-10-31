import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui";
import { AccountManagementDashboard } from "./components/AccountManagementDashboard";

export const AccountManagement = () => {
    return (
        <Card className="border-none pt-2 pb-0 shadow-none sm:border sm:shadow-none">
            <CardHeader className="hidden px-0 py-2 sm:block sm:px-0 sm:py-3">
                <CardTitle className="text-base sm:text-lg">
                    Account Management
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    Manage your electricity provider accounts
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <AccountManagementDashboard />
            </CardContent>
        </Card>
    );
};