import { RouteObject } from "react-router-dom";

import { ErrorPage } from "@/pages/error.page";

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
