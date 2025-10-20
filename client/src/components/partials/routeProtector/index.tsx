import { Navigate } from "react-router-dom";

import { LoadingSpinner } from "../appLoader";

import { useCheckAuthentication } from "./hooks/useCheckAuthentication";
import { useCheckAuthorization } from "./hooks/useCheckAuthorization";

interface IProtectedRouteProps {
    children: React.ReactNode;
}

export const RouteProtector = ({ children }: IProtectedRouteProps) => {
    const { authenticated, loading: authenticationLoading } =
        useCheckAuthentication();
    const { authorized, loading: authorizationLoading } =
        useCheckAuthorization();

    if (authenticationLoading || authorizationLoading) {
        return <LoadingSpinner />;
    }

    if (!authenticated) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (!authorized) {
        return <Navigate to="/forbidden" replace />;
    }

    return <>{children}</>;
};
