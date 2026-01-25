import { RouteObject } from "react-router-dom";

import { AccountManagementPage } from "@/pages/accountManagement.page";
import { ErrorPage } from "@/pages/error.page";
import { HomePage } from "@/pages/home.page";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/mainLayout";

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
                    { path: "accounts", element: <AccountManagementPage /> },
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

