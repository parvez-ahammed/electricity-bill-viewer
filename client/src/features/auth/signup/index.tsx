import { useLocales } from "@/config/i18n";
import { Card, CardContent } from "@shadcn";
import { Link } from "react-router-dom";

import { SignupForm } from "./components/signupForm";
import { AnimatedLogo } from "@/components/partials/animatedLogo";
import { Paragraph, Title } from "@/components/partials/typography";

export const Signup = () => {
    const { locale } = useLocales();
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6">
            <Card className="w-full max-w-4xl overflow-hidden rounded-2xl border border-black shadow-lg">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <Title className="font-bold text-black">
                                    {locale.auth.info.welcomeToDevJots}
                                </Title>
                                <Paragraph className="text-muted-foreground text-balance">
                                    {locale.auth.info.signUpToJotDown}
                                </Paragraph>
                            </div>

                            <SignupForm />

                            <div className="text-center text-sm">
                                {locale.auth.info.alreadyHaveAccount}{" "}
                                <Link
                                    to="/auth/login"
                                    className="underline underline-offset-4"
                                >
                                    {locale.common.cta.login}
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
