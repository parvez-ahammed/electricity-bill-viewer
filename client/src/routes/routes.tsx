import { useRoutes } from "react-router-dom";

import { authRoutes } from "./auth.route";
import { notFoundRoutes } from "./notFound.route";
import { publicRoutes } from "./public.route";

export const AppRoutes = () => {
    const allRoutes = [...authRoutes, ...publicRoutes, ...notFoundRoutes];
    const routeElement = useRoutes(allRoutes);
    return routeElement;
};
