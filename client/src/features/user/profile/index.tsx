import { EMPTY_STRING } from "@/common/constants/app.constant";
import { useGetUserByUsername } from "@/common/hooks/useUserApi.hook";
import { useLocales } from "@/config/i18n";
import { formatToMonthYear } from "@/lib/utils";
import { useLoading } from "@/providers/LoadingProvider";
import { CalendarDays, Mail, MapPin } from "lucide-react";
import { useParams } from "react-router-dom";

import { ErrorPage } from "@/pages/error.page";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";

export const PublicProfilePage = () => {
    const { username } = useParams<{ username: string }>();
    const { user, isLoading, error } = useGetUserByUsername(
        username || EMPTY_STRING
    );

    const {
        locale: { user: locale },
    } = useLocales();
    const { startLoading, stopLoading } = useLoading();
    if (isLoading) {
        startLoading();
    }
    if (!isLoading) {
        stopLoading();
    }

    if (error || !user) {
        return (
            <ErrorPage
                title={locale.info.profileNotFound}
                description={locale.info.profileNotFoundDesc}
            />
        );
    }

    return (
        <div className="flex min-h-screen w-full max-w-7xl flex-col bg-white">
            <div className="flex flex-col gap-8 py-8 text-black md:flex-row">
                <div className="w-full md:w-1/4">
                    <Card className="overflow-hidden bg-white text-black shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                                <div className="flex-1 space-y-2">
                                    <Avatar className="border-primary/10 h-20 w-20 border-2">
                                        <AvatarImage
                                            src={"/profile-photo-2.svg"}
                                            alt={user.name}
                                        />
                                        <AvatarFallback>
                                            {user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold">
                                                {user.name}
                                            </h2>
                                            <p className="text-muted-foreground text-xs">
                                                @
                                                {user.username ||
                                                    user.name
                                                        .toLowerCase()
                                                        .replace(
                                                            /\s/g,
                                                            EMPTY_STRING
                                                        )}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-xs">
                                        {user.bio ||
                                            "This user hasn't added a bio yet."}
                                    </p>
                                    <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 text-xs">
                                        {user.location && (
                                            <div className="flex items-center">
                                                <MapPin className="mr-1 h-3.5 w-3.5 opacity-70" />
                                                <span>{user.location}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center">
                                            <CalendarDays className="mr-1 h-3.5 w-3.5 opacity-70" />
                                            <span>
                                                {locale.info.joined}{" "}
                                                {formatToMonthYear(
                                                    user.joinDate
                                                )}
                                            </span>
                                        </div>

                                        {user.email && (
                                            <div className="flex items-center">
                                                <Mail className="mr-1 h-3.5 w-3.5 opacity-70" />
                                                <span>{user.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                <div className="w-full md:w-3/4">
                    <div className="space-y-6">
                        <div className="items-left flex flex-col justify-between gap-2 rounded-lg bg-white text-center">
                            <h1 className="text-left text-3xl font-bold">
                                {locale.info.stories}
                            </h1>
                            <div className="h-1 w-full bg-gray-300" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
