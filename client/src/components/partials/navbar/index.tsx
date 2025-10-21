import { useValidToken } from "@/common/hooks/useGetUserInfo";
import { useAuthContext } from "@/context/AuthContext";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { AuthorizedButtons } from "./components/AuthorizedButtons";
import { SearchBar } from "./components/SearchBar";
import { UnauthorizedButtons } from "./components/UnauthorizedButtons";
import { Text } from "@/components/partials/typography";
import { Button } from "@/components/ui";

export const Navbar = () => {
    const { isAuthenticated } = useAuthContext();
    const isValidToken = useValidToken();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    const isBaseRoute = location.pathname === "/";

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        if (mobileSearchOpen) setMobileSearchOpen(false);
    };

    const toggleMobileSearch = () => {
        setMobileSearchOpen(!mobileSearchOpen);
        if (mobileMenuOpen) setMobileMenuOpen(false);
    };
    const showOthers = false;

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

                    {showOthers && isBaseRoute && (
                        <>
                            <SearchBar />
                            {!mobileSearchOpen && (
                                <Button
                                    className="p-2 md:hidden"
                                    onClick={toggleMobileSearch}
                                    aria-label="Search"
                                >
                                    <Search className="h-5 w-5 text-white" />
                                </Button>
                            )}
                        </>
                    )}
                    {showOthers && (
                        <div className="hidden items-center gap-4 md:flex">
                            {isAuthenticated && isValidToken ? (
                                <AuthorizedButtons />
                            ) : (
                                <UnauthorizedButtons />
                            )}
                        </div>
                    )}

                    {!mobileSearchOpen && showOthers && (
                        <Button
                            className="p-2 md:hidden"
                            onClick={toggleMobileMenu}
                            aria-label={
                                mobileMenuOpen ? "Close menu" : "Open menu"
                            }
                        >
                            {mobileMenuOpen ? (
                                <X className="h-5 w-5 text-white" />
                            ) : (
                                <Menu className="h-5 w-5 text-white" />
                            )}
                        </Button>
                    )}
                </div>

                {showOthers && isBaseRoute && mobileSearchOpen && (
                    <div className="bg-white/60 pb-4 backdrop-blur-md md:hidden">
                        <SearchBar
                            isMobile
                            onClose={toggleMobileSearch}
                            autoFocus
                        />
                    </div>
                )}

                {showOthers && mobileMenuOpen && (
                    <div className="border-t border-gray-200 bg-white/90 py-4 backdrop-blur-sm md:hidden">
                        {isAuthenticated && isValidToken ? (
                            <AuthorizedButtons isMobile />
                        ) : (
                            <UnauthorizedButtons isMobile />
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};
