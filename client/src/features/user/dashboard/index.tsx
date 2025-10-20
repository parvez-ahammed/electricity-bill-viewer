import { useGetUserInfo } from "@/common/hooks/useGetUserInfo";
import { useGetUser } from "@/common/hooks/useUserApi.hook";
import { useLocales } from "@/config/i18n";

import { PersonalInformationCard } from "./components/PersonalInformationCard";
import { UpdatePassword } from "./components/UpdatePassword";
import { UpdateProfile } from "./components/UpdateProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSettings } from "@/features/user/dashboard/components/AdminSettings";

export const Profile = () => {
    const { isAdmin } = useGetUserInfo();

    const { userId } = useGetUserInfo();
    const { user } = useGetUser(userId);
    const {
        locale: { user: locale },
    } = useLocales();

    return (
        <div className="mx-auto w-full max-w-7xl py-8 text-black">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="self-start rounded-md shadow-md">
                    <PersonalInformationCard />
                </div>

                <div className="md:col-span-2">
                    <Tabs defaultValue="editProfile" className="w-full">
                        <div className="mb-4 flex items-center justify-between rounded-lg border-1 p-2 shadow-md">
                            <TabsList>
                                <TabsTrigger value="editProfile">
                                    {locale.info.editProfile}
                                </TabsTrigger>

                                <TabsTrigger value="updatePassword">
                                    {locale.info.updatePassword}
                                </TabsTrigger>

                                {isAdmin && (
                                    <TabsTrigger value="dashboard">
                                        {locale.info.adminSettings}
                                    </TabsTrigger>
                                )}
                            </TabsList>
                        </div>

                        <TabsContent
                            value="editProfile"
                            className="mt-0 rounded-md"
                        >
                            <UpdateProfile user={user} />
                        </TabsContent>

                        <TabsContent
                            value="updatePassword"
                            className="mt-0 rounded-md"
                        >
                            <UpdatePassword user={user} />
                        </TabsContent>

                        {isAdmin && (
                            <TabsContent
                                value="dashboard"
                                className="mt-0 rounded-md border-1"
                            >
                                <AdminSettings />
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </div>
        </div>
    );
};
