import { RefreshCw, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Text } from "@/components/partials/typography";
import { Button } from "@/components/ui";

export const Navbar = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const location = useLocation();

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
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center">
                            <Text className="bg-black px-3 py-1 text-xl font-bold text-white">
                                BillBarta
                            </Text>
                        </Link>
                        
                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center gap-4">
                            <Link 
                                to="/" 
                                className={`text-sm font-medium transition-colors hover:text-primary ${
                                    location.pathname === "/" ? "text-primary" : "text-muted-foreground"
                                }`}
                            >
                                Dashboard
                            </Link>
                            <Link 
                                to="/accounts" 
                                className={`text-sm font-medium transition-colors hover:text-primary ${
                                    location.pathname === "/accounts" ? "text-primary" : "text-muted-foreground"
                                }`}
                            >
                                Account Management
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mobile Navigation */}
                        <div className="md:hidden">
                            <Link to="/accounts">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-2"
                                    title="Account Management"
                                >
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        {/* Cache Refresh Button */}
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
                    </div>
                </div>
            </div>
        </header>
    );
};
