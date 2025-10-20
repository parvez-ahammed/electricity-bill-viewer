import { EMPTY_STRING } from "@/common/constants/app.constant";
import { RouteObject } from "react-router-dom";

import { HomePage } from "@/pages/home.page";
import { AdminSettingsPage } from "@/pages/user/adminSettings.page";
import { UserProfilePage } from "@/pages/user/profille.page";

import { MainLayout } from "@/components/layout/mainLayout";
import { RouteProtector } from "@/components/partials/routeProtector";

export const protectedRoutes: RouteObject[] = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { path: EMPTY_STRING, element: <HomePage /> },
            {
                path: "/profile",
                element: (
                    <RouteProtector>
                        <UserProfilePage />
                    </RouteProtector>
                ),
            },
            {
                path: "/admin/settings",
                element: (
                    <RouteProtector>
                        <AdminSettingsPage />
                    </RouteProtector>
                ),
            },
        ],
    },
];
