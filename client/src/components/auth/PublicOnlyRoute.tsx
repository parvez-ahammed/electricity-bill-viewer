import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Route guard for public-only pages (like login).
 * Redirects authenticated users to home page.
 */
export const PublicOnlyRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // If authenticated, redirect to home
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
