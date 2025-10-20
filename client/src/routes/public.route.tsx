import { RouteObject } from "react-router-dom";

import { ErrorPage } from "@/pages/error.page";

import { MainLayout } from "@/components/layout/mainLayout";

import { PublicProfilePage } from "@/features/user/profile";

export const publicRoutes: RouteObject[] = [
    {
        path: "/user",
        element: <MainLayout />,
        children: [{ path: ":username", element: <PublicProfilePage /> }],
    },
    {
        path: "/unauthorized",
        element: (
            <ErrorPage
                statusCode={401}
                title={"Unauthorized"}
                description={"You're not authorized to access this page"}
            />
        ),
    },
    {
        path: "/forbidden",
        element: (
            <ErrorPage
                statusCode={403}
                title={"Forbidden"}
                description={
                    "You do not have permission to access this resource."
                }
            />
        ),
    },
];
