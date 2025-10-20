import { LoginFormValues } from "@/common/constants/validation.constant";
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

interface LoginFieldsProps {
    form: UseFormReturn<LoginFormValues>;
}

export const LoginFields = ({ form }: LoginFieldsProps) => {
    const { locale } = useLocales();
    return (
        <>
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem className="grid gap-2">
                        <FormLabel htmlFor="email" className="text-black">
                            {locale.auth.formLabel.email}
                        </FormLabel>
                        <FormControl>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                className="text-black"
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
                        <div className="flex items-center">
                            <FormLabel
                                htmlFor="password"
                                className="text-secondary"
                            >
                                {locale.auth.formLabel.password}
                            </FormLabel>
                        </div>
                        <FormControl>
                            <Input
                                id="password"
                                type="password"
                                {...field}
                                className="text-secondary"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
};
