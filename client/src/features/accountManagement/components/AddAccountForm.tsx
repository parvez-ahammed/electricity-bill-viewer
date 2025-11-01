import {
    CreateAccountRequest,
    DPDCCredentials,
    ElectricityProvider,
    NESCOCredentials
} from "@/common/apis/accounts.api";
import { PasswordInput } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAccounts } from "../hooks/useAccounts";

interface AddAccountFormProps {
    provider: ElectricityProvider;
    onCancel: () => void;
    onSuccess: () => void;
}

type FormData = {
    username: string;
    password?: string;
    clientSecret?: string;
};

export const AddAccountForm = ({ provider, onCancel, onSuccess }: AddAccountFormProps) => {
    const { createAccount, isCreating } = useAccounts();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        
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

            const request: CreateAccountRequest = {
                provider,
                credentials,
            };

            createAccount(request);
            reset();
            onSuccess();
        } catch (error) {
            console.error("Failed to create account:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="border border-dashed rounded p-3 bg-muted/20">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Username */}
                    <div className="space-y-1">
                        <Label htmlFor={`username-${provider}`} className="text-xs">
                            Username *
                        </Label>
                        <Input
                            id={`username-${provider}`}
                            {...register("username", { 
                                required: "Username is required" 
                            })}
                            placeholder="Enter username"
                            className="h-8 text-sm"
                            disabled={isSubmitting || isCreating}
                        />
                        {errors.username && (
                            <p className="text-xs text-destructive">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    {/* Password (DPDC only) */}
                    {provider === "DPDC" && (
                        <div className="space-y-1">
                            <Label htmlFor={`password-${provider}`} className="text-xs">
                                Password *
                            </Label>
                            <PasswordInput
                                id={`password-${provider}`}
                                {...register("password", { 
                                    required: provider === "DPDC" ? "Password is required for DPDC" : false 
                                })}
                                placeholder="Enter password"
                                className="h-8 text-sm"
                                disabled={isSubmitting || isCreating}
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Client Secret (DPDC mandatory) */}
                    {provider === "DPDC" && (
                        <div className="space-y-1">
                            <Label htmlFor={`clientSecret-${provider}`} className="text-xs">
                                Client Secret *
                            </Label>
                            <Input
                                id={`clientSecret-${provider}`}
                                {...register("clientSecret", {
                                    required: "Client Secret is required for DPDC"
                                })}
                                placeholder="Enter client secret"
                                className="h-8 text-sm"
                                disabled={isSubmitting || isCreating}
                            />
                            {errors.clientSecret && (
                                <p className="text-xs text-destructive">
                                    {errors.clientSecret.message}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onCancel}
                        disabled={isSubmitting || isCreating}
                        className="h-7 px-3 text-xs"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isSubmitting || isCreating}
                        className="h-7 px-3 text-xs"
                    >
                        {isSubmitting || isCreating ? "Adding..." : "Add"}
                    </Button>
                </div>
            </form>
        </div>
    );
};