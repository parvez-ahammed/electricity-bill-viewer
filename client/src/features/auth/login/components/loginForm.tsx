import { EMPTY_STRING } from "@/common/constants/app.constant";
import {
    LoginFormValues,
    loginFormSchema,
} from "@/common/constants/validation.constant";
import { useLogin } from "@/common/hooks/useAuthApi.hook";
import { useLocales } from "@/config/i18n";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shadcn";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";

import { LoginFields } from "./loginFields";

export const LoginForm = () => {
    const { handleSubmit, isLoading, error } = useLogin();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: EMPTY_STRING,
            password: EMPTY_STRING,
        },
    });

    const onSubmit = (values: LoginFormValues) => {
        handleSubmit(values);
    };
    const { locale } = useLocales();
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
            >
                <LoginFields form={form} />

                {error && (
                    <div className="text-secondary">
                        {error
                            ? error.message
                            : locale.auth.message.loginFailed}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-black text-white shadow-xs hover:bg-black/80"
                    variant={isLoading ? "secondary" : "default"}
                >
                    {isLoading
                        ? locale.auth.info.loggingIn
                        : locale.common.cta.login}
                </Button>
            </form>
        </Form>
    );
};
