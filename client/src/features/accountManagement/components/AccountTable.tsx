import {
    Account,
    DPDCCredentials,
    ElectricityProvider,
    NESCOCredentials,
    UpdateAccountRequest,
} from "@/common/apis/accounts.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Edit2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useAccounts } from "../hooks/useAccounts";

interface AccountTableProps {
    accounts: Account[];
    provider: ElectricityProvider;
}

type FormData = {
    username: string;
    password?: string;
    clientSecret?: string;
};

const getSchema = (provider: ElectricityProvider) =>
    z.object({
        username: z.string().min(1, { message: "Username is required" }),
        password:
            provider === "DPDC"
                ? z
                      .string()
                      .min(1, { message: "Password is required for DPDC" })
                : z.string().optional(),
        clientSecret:
            provider === "DPDC"
                ? z
                      .string()
                      .min(1, { message: "Client Secret is required for DPDC" })
                : z.string().optional(),
    });

export const AccountTable = ({ accounts, provider }: AccountTableProps) => {
    const {
        updateAccount,
        deleteAccount,
        forceDeleteAccount,
        isUpdating,
        isDeleting,
    } = useAccounts();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(getSchema(provider)),
    });

    const startEdit = (account: Account) => {
        setEditingId(account.id);
        setValue("username", account.credentials.username);
        if ("password" in account.credentials) {
            setValue("password", account.credentials.password);
        }
        if ("clientSecret" in account.credentials) {
            setValue("clientSecret", account.credentials.clientSecret || "");
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        reset();
    };

    const onSubmit = async (data: FormData) => {
        if (!editingId) return;

        let credentials;

        if (provider === "DPDC") {
            credentials = {
                username: data.username,
                password: data.password!,
                clientSecret: data.clientSecret!,
            } as DPDCCredentials;
        } else {
            credentials = {
                username: data.username,
            } as NESCOCredentials;
        }

        const request: UpdateAccountRequest = {
            credentials,
        };

        updateAccount({ id: editingId, data: request });
        setEditingId(null);
        reset();
    };

    const handleDelete = (accountId: string) => {
        const account = accounts.find((acc) => acc.id === accountId);
        const isCorrupted =
            account &&
            "_isCorrupted" in account.credentials &&
            account.credentials._isCorrupted;

        if (isCorrupted) {
            forceDeleteAccount(accountId);
        } else {
            deleteAccount(accountId);
        }
        setDeleteDialogId(null);
    };

    const colCount = provider === "DPDC" ? 4 : 2;

    return (
        <div className="w-full">
            <Table>
                <TableHeader>
                    <TableRow className="h-10 border-b-[3px] border-[var(--color-neo-border)]">
                        <TableHead className="py-2 text-xs font-black uppercase tracking-wider text-black neo-table-cell">Username</TableHead>
                        {provider === "DPDC" && (
                            <TableHead className="py-2 text-xs font-black uppercase tracking-wider text-black neo-table-cell">
                                Password
                            </TableHead>
                        )}
                        {provider === "DPDC" && (
                            <TableHead className="py-2 text-xs font-black uppercase tracking-wider text-black neo-table-cell">
                                Client Secret
                            </TableHead>
                        )}
                        <TableHead className="w-[100px] min-w-[100px] py-2 text-xs font-black uppercase tracking-wider text-black neo-table-cell text-center">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {accounts.length === 0 ? (
                        <TableRow className="h-20 bg-white/50">
                            <TableCell colSpan={colCount} className="text-center py-8 font-bold italic text-black/60 neo-table-cell">
                                NO {provider} ACCOUNTS CONFIGURED. ADD ONE ABOVE.
                            </TableCell>
                        </TableRow>
                    ) : (
                        accounts.map((account) => (
                        <TableRow key={account.id} className="h-12">
                            {editingId === account.id ? (
                                // Edit mode
                                <>
                                    <TableCell className="py-1 neo-table-cell">
                                        <Input
                                            {...register("username")}
                                            className="h-7 text-sm"
                                            disabled={isUpdating}
                                        />
                                        {errors.username && (
                                            <p className="text-destructive mt-1 text-xs">
                                                {errors.username.message}
                                            </p>
                                        )}
                                    </TableCell>
                                    {provider === "DPDC" && (
                                        <TableCell className="py-1 neo-table-cell">
                                            <PasswordInput
                                                {...register("password")}
                                                className="h-7 text-sm"
                                                disabled={isUpdating}
                                            />
                                            {errors.password && (
                                                <p className="text-destructive mt-1 text-xs">
                                                    {errors.password.message}
                                                </p>
                                            )}
                                        </TableCell>
                                    )}
                                    {provider === "DPDC" && (
                                        <TableCell className="py-1 neo-table-cell">
                                            <Input
                                                {...register("clientSecret")}
                                                className="h-7 text-sm"
                                                disabled={isUpdating}
                                            />
                                            {errors.clientSecret && (
                                                <p className="text-destructive mt-1 text-xs">
                                                    {
                                                        errors.clientSecret
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell className="py-1 neo-table-cell">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-green-600 hover:bg-green-600 hover:text-white"
                                                onClick={handleSubmit(onSubmit)}
                                                disabled={isUpdating}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-600 hover:text-white"
                                                onClick={cancelEdit}
                                                disabled={isUpdating}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </>
                            ) : (
                                // View mode
                                <>
                                    <TableCell className="py-2 font-mono text-sm font-bold neo-table-cell">
                                        <div className="flex items-center gap-2">
                                            {account.credentials.username}
                                            {"_isCorrupted" in
                                                account.credentials &&
                                                account.credentials
                                                    ._isCorrupted && (
                                                    <span className="inline-flex items-center bg-red-600 px-2 py-1 text-[10px] font-black uppercase text-white neo-border border-[2px]">
                                                        Corrupted
                                                    </span>
                                                )}
                                        </div>
                                    </TableCell>
                                    {provider === "DPDC" &&
                                        "password" in account.credentials && (
                                            <TableCell className="py-2 font-mono text-sm font-bold neo-table-cell">
                                                {"•".repeat(8)}
                                            </TableCell>
                                        )}
                                    {provider === "DPDC" &&
                                        "clientSecret" in
                                            account.credentials && (
                                            <TableCell className="py-2 font-mono text-sm font-bold neo-table-cell">
                                                {account.credentials
                                                    .clientSecret
                                                    ? "•".repeat(12)
                                                    : "Not set"}
                                            </TableCell>
                                        )}
                                    <TableCell className="py-2 neo-table-cell">
                                        <div className="flex justify-center items-center gap-1">
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-600 hover:text-white"
                                                onClick={() =>
                                                    startEdit(account)
                                                }
                                                disabled={
                                                    isUpdating ||
                                                    isDeleting ||
                                                    ("_isCorrupted" in
                                                        account.credentials &&
                                                        account.credentials
                                                            ._isCorrupted)
                                                }
                                                title={
                                                    "_isCorrupted" in
                                                        account.credentials &&
                                                    account.credentials
                                                        ._isCorrupted
                                                        ? "Cannot edit corrupted account"
                                                        : "Edit account"
                                                }
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="xs"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-600 hover:text-white"
                                                onClick={() =>
                                                    setDeleteDialogId(
                                                        account.id
                                                    )
                                                }
                                                disabled={
                                                    isUpdating || isDeleting
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </>
                            )}
                        </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteDialogId}
                onOpenChange={() => setDeleteDialogId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                            {(() => {
                                const account = accounts.find(
                                    (acc) => acc.id === deleteDialogId
                                );
                                const isCorrupted =
                                    account &&
                                    "_isCorrupted" in account.credentials &&
                                    account.credentials._isCorrupted;

                                if (isCorrupted) {
                                    return "This account appears to be corrupted (possibly due to encryption key changes). Deleting it will permanently remove the corrupted data. This action cannot be undone.";
                                }

                                return "Are you sure you want to delete this account? This action cannot be undone.";
                            })()}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                deleteDialogId && handleDelete(deleteDialogId)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
