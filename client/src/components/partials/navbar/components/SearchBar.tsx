import { EMPTY_STRING } from "@/common/constants/app.constant";
import { useGetAllUsers } from "@/common/hooks/useUserApi.hook";
import { useLocales } from "@/config/i18n";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";

import { Users } from "./Users";

interface SearchBarProps {
    className?: string;
    isMobile?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClose?: () => void;
    autoFocus?: boolean;
}

export const SearchBar = ({
    className,
    isMobile = false,
    value,
    onChange,
    onClose,
    autoFocus = false,
}: SearchBarProps) => {
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(
        value || searchParams.get("search") || EMPTY_STRING
    );
    const [isFocused, setIsFocused] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const { users } = useGetAllUsers();
    const { locale } = useLocales();

    const navigate = useNavigate();

    useEffect(() => {
        if (value !== undefined) {
            setSearchQuery(value);
        }
    }, [value]);

    const performSearch = (searchValue: string) => {
        if (onChange) {
            const fakeEvent = {
                target: { value: searchValue },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(fakeEvent);
            return;
        }

        const newParams = new URLSearchParams(searchParams);
        if (searchValue) {
            newParams.set("search", searchValue);
        } else {
            newParams.delete("search");
        }

        navigate(`?${newParams.toString()}`);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            performSearch(val);
        }, 500);
    };

    const handleFocus = () => setIsFocused(true);

    const handleBlur = (e: React.FocusEvent) => {
        if (
            searchRef.current &&
            searchRef.current.contains(e.relatedTarget as Node)
        ) {
            return;
        }
        setIsFocused(false);
    };

    const showResults = isFocused;

    const handleResultClick = (id: string) => {
        navigate(`/user/${id}`);
        setIsFocused(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setIsFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div
            className={cn(
                "relative",
                !isMobile && "mx-5 hidden w-xl flex-1 md:block",
                className
            )}
            ref={searchRef}
        >
            <div className="relative flex items-center">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-black" />
                </div>

                <Input
                    placeholder={locale.navbar.info.searchStorisAndUsers}
                    className="border-black pl-8 text-black"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoFocus={autoFocus}
                />

                {isMobile && onClose && (
                    <Button
                        className="ml-2 p-2"
                        onClick={onClose}
                        aria-label="Close search"
                    >
                        <X className="h-5 w-5 text-white" />
                    </Button>
                )}
            </div>

            {showResults && (
                <div
                    className={cn(
                        "absolute top-full right-0 left-0 z-50 mt-1 rounded-md border bg-white shadow-lg",
                        isMobile && "fixed top-auto right-4 left-4"
                    )}
                >
                    <Users
                        users={users}
                        handleResultClick={handleResultClick}
                    />

                    {!searchQuery.trim() && (
                        <div className="text-muted-foreground p-4 text-center text-sm">
                            {locale.navbar.info.typeToSearch}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
