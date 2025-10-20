import { RouteObject } from "react-router-dom";

import { LoginPage } from "@/pages/auth/login.page";
import { SignupPage } from "@/pages/auth/signup.page";

import { AuthLayout } from "@/components/layout/authLayout";

import { authPaths } from "./paths";

export const authRoutes: RouteObject[] = [
    {
        path: "/",
        element: <AuthLayout />,
        children: [
            { path: authPaths.login, element: <LoginPage /> },
            { path: authPaths.signup, element: <SignupPage /> },
        ],
    },
];
