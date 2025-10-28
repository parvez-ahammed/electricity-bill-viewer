import { PreferencesProvider } from "@/context/PreferenceContext";
import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { LoadingSpinner } from "@/components/partials/appLoader/LoadingSpinner";
import { ErrorBoundary } from "@/components/partials/errorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";

import { LoadingProvider } from "./LoadingProvider";
import { QueryProvider } from "./reactQueryProvider";
import { ThemeProvider } from "./themeProvider";

interface AppProviderProps {
    children: React.ReactNode;
}

export const AppProvider = (props: AppProviderProps) => {
    return (
        <ErrorBoundary>
            <Suspense fallback={<div>Loading...</div>}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryProvider>
                        <PreferencesProvider>
                            <TooltipProvider>
                                <Toaster position="top-right" richColors />
                                <LoadingProvider>
                                    <BrowserRouter>
                                        {props.children}
                                    </BrowserRouter>
                                    <LoadingSpinner />
                                </LoadingProvider>
                            </TooltipProvider>
                        </PreferencesProvider>
                    </QueryProvider>
                </ThemeProvider>
            </Suspense>
        </ErrorBoundary>
    );
};
