import { CacheService, CacheServiceFactory } from "@/lib/cache";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface IPreferences {
    theme: string;
}

interface PreferencesContextType {
    preferences: IPreferences;
    setPreferences: (preferences: IPreferences) => void;
}

interface PreferencesProviderProps {
    children: React.ReactNode;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
    undefined
);

const defaultPreferences: IPreferences = {
    theme: "system",
};

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({
    children,
}) => {
    const cacheService: CacheService = CacheServiceFactory.getCacheService();
    const [preferences, setPreferences] = useState<IPreferences | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPreferences = async () => {
            const savedPreferences = await cacheService.get("preferences");

            if (savedPreferences) {
                const parsedPref = JSON.parse(savedPreferences);
                setPreferences(parsedPref);
            } else {
                setPreferences(defaultPreferences);
                cacheService.save(
                    "preferences",
                    JSON.stringify(defaultPreferences)
                );
            }

            setLoading(false);
        };

        loadPreferences();
    }, []);

    useEffect(() => {
        if (!loading && preferences) {
            cacheService.save("preferences", JSON.stringify(preferences));
        }
    }, [preferences, loading]);

    if (loading || !preferences) {
        return <></>;
    }

    return (
        <PreferencesContext.Provider value={{ preferences, setPreferences }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = (): PreferencesContextType => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error(
            "usePreferences must be used within a PreferencesProvider"
        );
    }
    return context;
};
