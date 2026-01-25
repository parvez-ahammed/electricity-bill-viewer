import { RefreshCw, Send, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { UserMenu } from "@/components/layout/UserMenu";
import { Text } from "@/components/partials/typography";
import { Button } from "@/components/ui";
import { useRefresh } from "./hooks/useRefresh";
import { useTelegram } from "./hooks/useTelegram";

export const Navbar = () => {
    const location = useLocation();
    const { isRefreshing, handleRefresh } = useRefresh();
    const { isSendingTelegram, handleSendTelegram } = useTelegram();
    
    // Check if we're on the account management page
    const isAccountManagementPage = location.pathname === "/accounts";

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
                                disabled={isRefreshing || isSendingTelegram}
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                                />
                                <span className="hidden sm:inline">Refresh</span>
                            </Button>
                        )}

                        {/* Telegram Send Button - Only show on dashboard */}
                        {!isAccountManagementPage && (
                            <Button
                                onClick={handleSendTelegram}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                title="Send account balances to Telegram"
                                disabled={isRefreshing || isSendingTelegram}
                            >
                                <Send
                                    className={`h-4 w-4 ${isSendingTelegram ? "animate-pulse" : ""}`}
                                />
                                <span className="hidden sm:inline">
                                    {isSendingTelegram ? "Sending..." : "Telegram"}
                                </span>
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

                        {/* User Profile & Logout */}
                        <UserMenu />
                    </div>
                </div>
            </div>
        </header>
    );
};
