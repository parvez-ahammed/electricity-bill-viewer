import { AuthContextProvider } from "@/context/AuthContext";
import { PreferencesProvider } from "@/context/PreferenceContext";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";

import { LoadingSpinner } from "@/components/partials/appLoader/LoadingSpinner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { LoadingProvider } from "./LoadingProvider";
import { QueryProvider } from "./reactQueryProvider";
import { ThemeProvider } from "./themeProvider";

interface AppProviderProps {
    children: React.ReactNode;
}

export const AppProvider = (props: AppProviderProps) => {
    return (
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
                            <AuthContextProvider>
                                <Toaster position="top-right" />
                                <LoadingProvider>
                                    <BrowserRouter>
                                        {props.children}
                                    </BrowserRouter>
                                    <LoadingSpinner />
                                </LoadingProvider>
                            </AuthContextProvider>
                        </TooltipProvider>
                    </PreferencesProvider>
                </QueryProvider>
            </ThemeProvider>
        </Suspense>
    );
};
