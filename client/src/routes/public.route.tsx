import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/mainLayout";

const AccountManagementPage = lazy(() =>
    import("@/pages/accountManagement.page").then((module) => ({
        default: module.AccountManagementPage,
    }))
);
const ErrorPage = lazy(() =>
    import("@/pages/error.page").then((module) => ({
        default: module.ErrorPage,
    }))
);
const HomePage = lazy(() =>
    import("@/pages/home.page").then((module) => ({
        default: module.HomePage,
    }))
);

export const publicRoutes: RouteObject[] = [
    {
        // Protected routes (require authentication)
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <MainLayout />,
                children: [
                    { path: "", element: <HomePage /> },
                    { path: "settings", element: <AccountManagementPage /> },
                ],
            },
        ],
    },
    {
        // Error pages remain public
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
