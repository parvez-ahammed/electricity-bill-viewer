import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import { PublicOnlyRoute } from "@/components/auth/PublicOnlyRoute";

const AuthCallbackPage = lazy(() =>
    import("@/pages/AuthCallbackPage").then((module) => ({
        default: module.AuthCallbackPage,
    }))
);
const LoginPage = lazy(() =>
    import("@/pages/LoginPage").then((module) => ({
        default: module.LoginPage,
    }))
);

export const authRoutes: RouteObject[] = [
    {
        // Public-only routes (redirect authenticated users away)
        element: <PublicOnlyRoute />,
        children: [
            {
                path: "/login",
                element: <LoginPage />,
            },
        ],
    },
    {
        // Auth callback must remain accessible for OAuth flow
        path: "/auth/callback",
        element: <AuthCallbackPage />,
    },
];
