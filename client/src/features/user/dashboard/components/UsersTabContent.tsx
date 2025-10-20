import { EMPTY_STRING } from "@/common/constants/app.constant";
import { useDeleteUser, useGetAllUsers } from "@/common/hooks/useUserApi.hook";
import { useLocales } from "@/config/i18n";
import { formatToMonthYear } from "@/lib/utils";
import {
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Search,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Text } from "@/components/partials/typography";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const getRoleName = (roleCode: string) => {
    switch (roleCode) {
        case "1":
            return "Admin";
        default:
            return "User";
    }
};
export const UsersTabContent = () => {
    const [searchQuery, setSearchQuery] = useState(EMPTY_STRING);
    const [currentPage, setCurrentPage] = useState(1);

    const { users: allUsers, error } = useGetAllUsers(true);
    const loading = false;
    const {
        locale: { user: locale },
    } = useLocales();

    const usersPerPage = 5;
    const totalPages = Math.ceil(allUsers.length / usersPerPage);
    const paginatedUsers = allUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = event.target.value;
        setSearchQuery(searchValue);
        setCurrentPage(1);
        const newParams = new URLSearchParams(searchParams);
        if (searchValue) {
            newParams.set("search", searchValue);
        } else {
            newParams.delete("search");
        }

        navigate(`?${newParams.toString()}`);
    };
    const { deleteUser } = useDeleteUser();

    const handleDeleteUser = (userId: string) => {
        deleteUser(userId);
    };

    return (
        <Card className="border-0">
            <CardContent className="px-2">
                <div className="mb-6 flex flex-col gap-4 md:flex-row">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                        <Input
                            placeholder="Search users..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(event) => handleSearchChange(event)}
                        />
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {locale.table.header.name}
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                    {locale.table.header.role}
                                </TableHead>
                                <TableHead className="hidden lg:table-cell">
                                    {locale.table.header.stories}
                                </TableHead>
                                <TableHead className="hidden lg:table-cell">
                                    {locale.table.header.joined}
                                </TableHead>
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-24 text-center"
                                    >
                                        {locale.table.info.loading}
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-24 text-center text-red-500"
                                    >
                                        {locale.table.info.error}{" "}
                                        {error.message}
                                    </TableCell>
                                </TableRow>
                            ) : paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src="/profile-photo-2.svg"
                                                        alt={user.name}
                                                    />
                                                    <AvatarFallback>
                                                        {user.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {user.name}
                                                    </span>
                                                    <span className="text-muted-foreground text-xs">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span className="font-medium">
                                                {getRoleName(user.role)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {locale.table.info.notAvailable}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {formatToMonthYear(user.joinDate)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <span className="sr-only">
                                                            Open menu
                                                        </span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="bg-white"
                                                >
                                                    <DropdownMenuItem
                                                        className="text-destructive-foreground"
                                                        onSelect={(e) =>
                                                            e.preventDefault()
                                                        }
                                                    >
                                                        <AlertDialog>
                                                            <AlertDialogTrigger>
                                                                <Text className="text-destructive-foreground w-full">
                                                                    {
                                                                        locale
                                                                            .cta
                                                                            .delete
                                                                    }
                                                                </Text>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        {
                                                                            locale
                                                                                .alert
                                                                                .deleteTitle
                                                                        }
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        {
                                                                            locale
                                                                                .alert
                                                                                .deleteDescription
                                                                        }
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>
                                                                        {
                                                                            locale
                                                                                .cta
                                                                                .cancel
                                                                        }
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() =>
                                                                            handleDeleteUser(
                                                                                user.id
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            locale
                                                                                .cta
                                                                                .confirm
                                                                        }
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-24 text-center"
                                    >
                                        {locale.table.info.noUsersFound}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {allUsers.length > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-muted-foreground text-sm">
                            Showing{" "}
                            <span className="font-medium">
                                {(currentPage - 1) * usersPerPage + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                                {Math.min(
                                    currentPage * usersPerPage,
                                    allUsers.length
                                )}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium">
                                {allUsers.length}
                            </span>{" "}
                            users
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1)
                                    )
                                }
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">
                                    {locale.cta.previousPage}
                                </span>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages)
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">
                                    {locale.cta.nextPage}
                                </span>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
