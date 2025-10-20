import { EMPTY_STRING } from "@/common/constants/app.constant";
import { useGetUserInfo } from "@/common/hooks/useGetUserInfo";
import { useGetUser } from "@/common/hooks/useUserApi.hook";
import { useLocales } from "@/config/i18n";
import { formatToMonthYear } from "@/lib/utils";
import { CalendarDays, Mail, MapPin } from "lucide-react";

import { Title } from "@/components/partials/typography";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export const PersonalInformationCard = () => {
    const { userId, isAdmin } = useGetUserInfo();
    const { user } = useGetUser(userId);

    const {
        locale: { user: locale },
    } = useLocales();

    return (
        <Card className="bg-white">
            <CardHeader className="relative pt-0 pb-0">
                <div className="mt-10 flex flex-col items-center">
                    <Avatar className="border-background -mt-12 h-24 w-24 border-4 shadow-md">
                        <AvatarImage
                            src={"/profile-photo-2.svg"}
                            alt={user?.name}
                        />
                    </Avatar>

                    <div className="mt-4 text-center">
                        <CardTitle className="text-2xl">{user?.name}</CardTitle>
                        {user?.bio && (
                            <div className="space-y-2">
                                <Title
                                    level={3}
                                    className="text-muted-foreground text-sm font-medium"
                                >
                                    {user?.bio}
                                </Title>
                            </div>
                        )}
                        <CardDescription className="mt-1">
                            {"@" + user?.username}
                        </CardDescription>

                        {isAdmin && (
                            <Badge
                                variant="outline"
                                className="border-primary/30 bg-primary/10 text-primary mt-2"
                            >
                                {locale.info.admin}
                            </Badge>
                        )}

                        {user?.location && (
                            <div className="text-muted-foreground mt-2 flex items-center justify-center text-sm">
                                <MapPin className="mr-1 h-3 w-3" />
                                <span>{user?.location}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="Paragraph-6">
                <div className="space-y-2 pt-2">
                    <Title
                        level={3}
                        className="text-muted-foreground text-sm font-medium"
                    >
                        {locale.info.contact}
                    </Title>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                            <Mail className="text-muted-foreground mr-2 h-4 w-4" />
                            <span>{user?.email}</span>
                        </div>
                        <div className="flex items-center">
                            <CalendarDays className="text-muted-foreground mr-2 h-4 w-4" />
                            <span>
                                {locale.info.joined}{" "}
                                {formatToMonthYear(
                                    user?.joinDate || EMPTY_STRING
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
