import { Account, DPDCCredentials, ElectricityProvider, NESCOCredentials, UpdateAccountRequest } from "@/common/apis/accounts.api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Edit2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

export const AccountTable = ({ accounts, provider }: AccountTableProps) => {
    const { updateAccount, deleteAccount, isUpdating, isDeleting } = useAccounts();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<FormData>();

    const startEdit = (account: Account) => {
        setEditingId(account.id);
        setValue("username", account.credentials.username);
        if ('password' in account.credentials) {
            setValue("password", account.credentials.password);
        }
        if ('clientSecret' in account.credentials) {
            setValue("clientSecret", account.credentials.clientSecret || '');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        reset();
    };

    const onSubmit = async (data: FormData) => {
        if (!editingId) return;

        try {
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
        } catch (error) {
            console.error("Failed to update account:", error);
        }
    };

    const handleDelete = (accountId: string) => {
        deleteAccount(accountId);
        setDeleteDialogId(null);
    };

    if (accounts.length === 0) {
        return (
            <div className="text-center py-4 text-muted-foreground text-sm">
                No {provider} accounts configured.
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="h-10">
                        <TableHead className="py-2 text-xs">Username</TableHead>
                        {provider === "DPDC" && <TableHead className="py-2 text-xs">Password</TableHead>}
                        {provider === "DPDC" && <TableHead className="py-2 text-xs">Client Secret</TableHead>}
                        <TableHead className="w-[80px] py-2 text-xs">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {accounts.map((account) => (
                        <TableRow key={account.id} className="h-12">
                            {editingId === account.id ? (
                                // Edit mode
                                <>
                                    <TableCell className="py-1">
                                        <Input
                                            {...register("username", { 
                                                required: "Username is required" 
                                            })}
                                            className="h-7 text-sm"
                                            disabled={isUpdating}
                                        />
                                        {errors.username && (
                                            <p className="text-xs text-destructive mt-1">
                                                {errors.username.message}
                                            </p>
                                        )}
                                    </TableCell>
                                    {provider === "DPDC" && (
                                        <TableCell className="py-1">
                                            <Input
                                                type="password"
                                                {...register("password", { 
                                                    required: "Password is required for DPDC" 
                                                })}
                                                className="h-7 text-sm"
                                                disabled={isUpdating}
                                            />
                                            {errors.password && (
                                                <p className="text-xs text-destructive mt-1">
                                                    {errors.password.message}
                                                </p>
                                            )}
                                        </TableCell>
                                    )}
                                    {provider === "DPDC" && (
                                        <TableCell className="py-1">
                                            <Input
                                                {...register("clientSecret", {
                                                    required: "Client Secret is required for DPDC"
                                                })}
                                                className="h-7 text-sm"
                                                disabled={isUpdating}
                                            />
                                            {errors.clientSecret && (
                                                <p className="text-xs text-destructive mt-1">
                                                    {errors.clientSecret.message}
                                                </p>
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell className="py-1">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={handleSubmit(onSubmit)}
                                                disabled={isUpdating}
                                            >
                                                <Check className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                                onClick={cancelEdit}
                                                disabled={isUpdating}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </>
                            ) : (
                                // View mode
                                <>
                                    <TableCell className="font-mono text-sm py-2">
                                        {account.credentials.username}
                                    </TableCell>
                                    {provider === "DPDC" && 'password' in account.credentials && (
                                        <TableCell className="font-mono text-sm py-2">
                                            {"•".repeat(8)}
                                        </TableCell>
                                    )}
                                    {provider === "DPDC" && 'clientSecret' in account.credentials && (
                                        <TableCell className="font-mono text-sm py-2">
                                            {account.credentials.clientSecret ? 
                                                `${account.credentials.clientSecret.substring(0, 8)}...` : 
                                                'Not set'
                                            }
                                        </TableCell>
                                    )}
                                    <TableCell className="py-2">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => startEdit(account)}
                                                disabled={isUpdating || isDeleting}
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setDeleteDialogId(account.id)}
                                                disabled={isUpdating || isDeleting}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteDialogId} onOpenChange={() => setDeleteDialogId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this account? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteDialogId && handleDelete(deleteDialogId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};