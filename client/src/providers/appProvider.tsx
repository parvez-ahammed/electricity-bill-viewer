import { PreferencesProvider } from "@/context/PreferenceContext";
import { AuthGoogleProvider } from "@/providers/AuthGoogleProvider";
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
                            <BrowserRouter>
                                <AuthGoogleProvider>
                                    <TooltipProvider>
                                        <Toaster 
                                            position="top-right" 
                                            richColors 
                                            expand={true}
                                            visibleToasts={5}
                                            closeButton={true}
                                            duration={4000}
                                        />
                                        <LoadingProvider>
                                            {props.children}
                                            <LoadingSpinner />
                                        </LoadingProvider>
                                    </TooltipProvider>
                                </AuthGoogleProvider>
                            </BrowserRouter>
                        </PreferencesProvider>
                    </QueryProvider>
                </ThemeProvider>
            </Suspense>
        </ErrorBoundary>
    );
};
