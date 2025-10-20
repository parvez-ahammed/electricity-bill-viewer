import { EMPTY_STRING } from "@/common/constants/app.constant";
import { useUpdateUser } from "@/common/hooks/useUserApi.hook";
import { IUser } from "@/common/interfaces/userApi.interface";
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
import { Textarea } from "@/components/ui/textarea";

import {
    EditProfileFormValues,
    editProfileFormSchema,
} from "../constant/validation.constant";

interface EditProfileDialogProps {
    user: IUser | undefined;
}

export const UpdateProfile = ({ user }: EditProfileDialogProps) => {
    const { updateUser, isPending } = useUpdateUser();
    const form = useForm<EditProfileFormValues>({
        resolver: zodResolver(editProfileFormSchema),
        defaultValues: {
            name: user?.name || EMPTY_STRING,
            location: user?.location || EMPTY_STRING,
            bio: user?.bio || EMPTY_STRING,
        },
    });
    const {
        locale: { user: locale },
    } = useLocales();

    const onSubmit = (values: EditProfileFormValues) => {
        updateUser({ userId: user?.id || EMPTY_STRING, formData: values });
    };

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name || EMPTY_STRING,
                location: user.location || EMPTY_STRING,
                bio: user.bio || EMPTY_STRING,
            });
        }
    }, [user, form]);

    return (
        <Card className="w-full shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">
                    {locale.info.editProfile}
                </CardTitle>
                <CardDescription className="text-gray-500">
                    {locale.info.editProfileDesc}
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6 pt-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-12 items-start gap-4">
                                    <FormLabel
                                        htmlFor="name"
                                        className="col-span-3 pt-2 text-right text-sm font-medium"
                                    >
                                        {locale.formLabel.name}
                                    </FormLabel>
                                    <div className="col-span-9 space-y-1.5">
                                        <FormControl>
                                            <Input
                                                id="name"
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
                            name="location"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-12 items-start gap-4">
                                    <FormLabel
                                        htmlFor="location"
                                        className="col-span-3 pt-2 text-right text-sm font-medium"
                                    >
                                        {locale.formLabel.location}
                                    </FormLabel>
                                    <div className="col-span-9 space-y-1.5">
                                        <FormControl>
                                            <Input
                                                id="location"
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
                            name="bio"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-12 items-start gap-4">
                                    <FormLabel
                                        htmlFor="bio"
                                        className="col-span-3 pt-2 text-right text-sm font-medium"
                                    >
                                        {locale.formLabel.bio}
                                    </FormLabel>
                                    <div className="col-span-9 space-y-1.5">
                                        <FormControl>
                                            <Textarea
                                                id="bio"
                                                {...field}
                                                className="min-h-[120px] w-full resize-y"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end px-6 py-4">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-black px-5 text-white hover:bg-gray-800"
                        >
                            {isPending
                                ? locale.info.saving
                                : locale.cta.saveChanges}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
};
