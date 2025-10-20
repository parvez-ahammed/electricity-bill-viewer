import { EMPTY_STRING } from "@/common/constants/app.constant";
import { useUpdatePassword } from "@/common/hooks/useAuthApi.hook";
import type { IUser } from "@/common/interfaces/userApi.interface";
import { useLocales } from "@/config/i18n";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
    type UpdatePasswordFormValues,
    updatePasswordFormSchema,
} from "../constant/validation.constant";

interface UpdatePasswordDialogProps {
    user: IUser | undefined;
}

export const UpdatePassword = ({ user }: UpdatePasswordDialogProps) => {
    const { updatePassword, isPending, isSuccess } = useUpdatePassword();
    const form = useForm<UpdatePasswordFormValues>({
        resolver: zodResolver(updatePasswordFormSchema),
        defaultValues: {
            currentPassword: EMPTY_STRING,
            newPassword: EMPTY_STRING,
            confirmPassword: EMPTY_STRING,
        },
    });
    const {
        locale: { user: locale },
    } = useLocales();

    const onSubmit = (values: UpdatePasswordFormValues) => {
        updatePassword({
            userId: user?.id || EMPTY_STRING,
            formData: {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            },
        });
    };

    useEffect(() => {
        if (isSuccess) {
            form.reset({
                currentPassword: EMPTY_STRING,
                newPassword: EMPTY_STRING,
                confirmPassword: EMPTY_STRING,
            });
        }
    }, [isSuccess, form]);

    return (
        <Card className="w-full shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">
                    {locale.info.updatePassword}
                </CardTitle>
                <CardDescription className="text-gray-500">
                    {locale.info.updatePasswordDesc}
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6 pt-2">
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-12 items-start gap-4">
                                    <FormLabel
                                        htmlFor="currentPassword"
                                        className="col-span-3 pt-2 text-right text-sm font-medium"
                                    >
                                        {locale.formLabel.currentPassword}
                                    </FormLabel>
                                    <div className="col-span-9 space-y-1.5">
                                        <FormControl>
                                            <Input
                                                id="currentPassword"
                                                type="password"
                                                {...field}
                                                className="w-full"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-12 items-start gap-4">
                                    <FormLabel
                                        htmlFor="newPassword"
                                        className="col-span-3 pt-2 text-right text-sm font-medium"
                                    >
                                        {locale.formLabel.newPassword}
                                    </FormLabel>
                                    <div className="col-span-9 space-y-1.5">
                                        <FormControl>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                {...field}
                                                className="w-full"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-12 items-start gap-4">
                                    <FormLabel
                                        htmlFor="confirmPassword"
                                        className="col-span-3 pt-2 text-right text-sm font-medium"
                                    >
                                        {locale.formLabel.confirmPassword}
                                    </FormLabel>
                                    <div className="col-span-9 space-y-1.5">
                                        <FormControl>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                {...field}
                                                className="w-full"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end border-t border-gray-100 px-6 py-4">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-black px-5 text-white hover:bg-gray-800"
                        >
                            {isPending
                                ? locale.info.updating
                                : locale.cta.updatePassword}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
};
