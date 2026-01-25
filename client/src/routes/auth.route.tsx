import { PublicOnlyRoute } from '@/components/auth/PublicOnlyRoute';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';
import { LoginPage } from '@/pages/LoginPage';
import { RouteObject } from 'react-router-dom';

export const authRoutes: RouteObject[] = [
    {
        // Public-only routes (redirect authenticated users away)
        element: <PublicOnlyRoute />,
        children: [
            {
                path: '/login',
                element: <LoginPage />,
            },
        ],
    },
    {
        // Auth callback must remain accessible for OAuth flow
        path: '/auth/callback',
        element: <AuthCallbackPage />,
    },
];
