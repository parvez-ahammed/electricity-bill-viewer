import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: (failureCount, error) => {
                // Don't retry on 4xx errors
                if (error instanceof Error && "status" in error) {
                    const status = (error as { status?: number }).status;
                    if (status && status >= 400 && status < 500) {
                        return false;
                    }
                }
                return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
        mutations: {
            retry: 1,
        },
    },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};
