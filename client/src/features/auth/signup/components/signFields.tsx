import { SignupFormValues } from "@/common/constants/validation.constant";
import { useLocales } from "@/config/i18n";
import type { UseFormReturn } from "react-hook-form";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface SignFieldsProps {
    form: UseFormReturn<SignupFormValues>;
}

export const SignupFields = ({ form }: SignFieldsProps) => {
    const { locale } = useLocales();
    return (
        <>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem className="grid gap-2">
                        <FormLabel htmlFor="name">
                            {locale.auth.formLabel.name}
                        </FormLabel>
                        <FormControl>
                            <Input required id="name" type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem className="grid gap-2">
                        <FormLabel htmlFor="username">
                            {locale.auth.formLabel.username}
                        </FormLabel>
                        <FormControl>
                            <Input id="username" type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem className="grid gap-2">
                        <FormLabel htmlFor="email">
                            {locale.auth.formLabel.email}
                        </FormLabel>
                        <FormControl>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem className="grid gap-2">
                        <FormLabel htmlFor="password">
                            {locale.auth.formLabel.password}
                        </FormLabel>

                        <FormControl>
                            <Input id="password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                    <FormItem className="grid gap-2">
                        <FormLabel htmlFor="confirmPassword">
                            {locale.auth.formLabel.confirmPassword}
                        </FormLabel>
                        <FormControl>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
};
