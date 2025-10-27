import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Text } from "@/components/partials/typography";
import { Button } from "@/components/ui";

export const Navbar = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Call the global refresh function exposed by AccountBalance
            const refreshFn = (
                window as Window & {
                    refreshElectricityData?: () => Promise<void>;
                }
            ).refreshElectricityData;
            if (refreshFn) {
                await refreshFn();
            }
        } finally {
            // Keep spinning for a bit to show feedback
            setTimeout(() => setIsRefreshing(false), 1000);
        }
    };

    return (
        <header className="sticky top-0 z-20 border-y-1 border-black bg-white/80 px-2 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
            <div className="container mx-auto max-w-7xl">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <Text className="bg-black px-3 py-1 text-xl font-bold text-white">
                                BillBarta
                            </Text>
                        </Link>
                    </div>

                    {/* Cache Refresh Button */}
                    <div className="flex items-center gap-2">
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
