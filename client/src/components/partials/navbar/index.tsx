import { RefreshCw, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Text } from "@/components/partials/typography";
import { Button } from "@/components/ui";

export const Navbar = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const location = useLocation();
    
    // Check if we're on the account management page
    const isAccountManagementPage = location.pathname === "/accounts";

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Call the global refresh function exposed by AccountBalance
            if (
                typeof window !== "undefined" &&
                window.refreshElectricityData
            ) {
                await window.refreshElectricityData();
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error refreshing data:", error);
        } finally {
            // Keep spinning for a bit to show feedback
            setTimeout(() => setIsRefreshing(false), 1000);
        }
    };

    return (
        <header className="sticky top-0 z-20 border-y border-black bg-white/80 px-2 backdrop-blur-md supports-backdrop-filter:bg-white/70">
            <div className="container mx-auto max-w-7xl">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <Text className="bg-black px-3 py-1 text-xl font-bold text-white">
                                BillBarta
                            </Text>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Cache Refresh Button - Only show on dashboard */}
                        {!isAccountManagementPage && (
                            <Button
                                onClick={handleRefresh}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                title="Refresh data from server (bypass cache)"
                                disabled={isRefreshing}
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                                />
                                <span className="hidden sm:inline">Refresh</span>
                            </Button>
                        )}

                        {/* Account Management Button */}
                        <Link to="/accounts">
                            <Button
                                variant={isAccountManagementPage ? "default" : "outline"}
                                size="sm"
                                className="flex items-center gap-2"
                                title="Account Management"
                            >
                                <Settings className="h-4 w-4" />
                                <span className="hidden sm:inline">Accounts</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};
