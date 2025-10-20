import { useLocales } from "@/config/i18n";
import { Card, CardContent } from "@shadcn";
import { Link } from "react-router-dom";

import { LoginForm } from "./components/loginForm";
import { AnimatedLogo } from "@/components/partials/animatedLogo";
import { Paragraph } from "@/components/partials/typography";

export const Login = () => {
    const { locale } = useLocales();
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6">
            <Card className="w-full max-w-4xl overflow-hidden rounded-2xl border border-black shadow-lg">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <div className="p-4 sm:p-6 md:p-8">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h2 className="text-secondary text-xl font-bold sm:text-2xl">
                                    {locale.auth.info.welcomeBack}
                                </h2>
                                <Paragraph className="text-muted-foreground text-secondary text-sm text-balance sm:text-base">
                                    {locale.auth.info.loginToAccount}
                                </Paragraph>
                            </div>

                            <LoginForm />

                            <div className="text-secondary text-center text-xs sm:text-sm">
                                {locale.auth.info.dontHaveAccount}{" "}
                                <Link
                                    to="/auth/signup"
                                    className="underline underline-offset-4"
                                >
                                    {locale.common.cta.signup}
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="bg-secondary/5 hidden md:flex md:items-center md:justify-center">
                        <AnimatedLogo />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
