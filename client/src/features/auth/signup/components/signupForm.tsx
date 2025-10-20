import { EMPTY_STRING } from "@/common/constants/app.constant";
import {
    SignupFormValues,
    signupFormSchema,
} from "@/common/constants/validation.constant";
import { useSignUp } from "@/common/hooks/useAuthApi.hook";
import { useLocales } from "@/config/i18n";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shadcn";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";

import { SignupFields } from "./signFields";

export const SignupForm = () => {
    const { handleSubmit, isLoading, error } = useSignUp();
    const { locale } = useLocales();

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            email: EMPTY_STRING,
            confirmPassword: EMPTY_STRING,
        },
    });

    const onSubmit = (values: SignupFormValues) => {
        handleSubmit(values);
    };
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
            >
                <SignupFields form={form} />

                {error && (
                    <div className="text-red-500">
                        {locale.auth.message.signupFailed}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full bg-black text-white hover:bg-gray-800"
                    disabled={isLoading}
                >
                    {isLoading
                        ? locale.auth.info.signingUp
                        : locale.common.cta.signup}
                </Button>
            </form>
        </Form>
    );
};
