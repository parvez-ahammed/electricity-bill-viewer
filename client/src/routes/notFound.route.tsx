import { lazy } from "react";
import { RouteObject } from "react-router-dom";

const ErrorPage = lazy(() =>
    import("@/pages/error.page").then((module) => ({
        default: module.ErrorPage,
    }))
);

export const notFoundRoutes: RouteObject[] = [
    {
        path: "*",
        element: (
            <ErrorPage
                statusCode={404}
                title={"Page Not Found"}
                description={
                    "The page you're looking for has drifted into a black hole"
                }
            />
        ),
    },
];
