import { CurrentUser, authApi } from "@/common/apis/auth.api";
import { STORAGE_KEYS } from "@/common/constants/storage.constant";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

interface User {
    userId: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const clearSessionStorageKeys = useCallback(() => {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.ELECTRICITY_BALANCE_DATA);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        clearSessionStorageKeys();
        setIsLoading(false);
    }, [clearSessionStorageKeys]);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const userData: CurrentUser = await authApi.getCurrentUser();
            setUser(userData);
        } catch {
            logout();
        } finally {
            setIsLoading(false);
        }
    }, [logout]);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (storedToken) {
            setToken(storedToken);
            fetchCurrentUser();
        } else {
            setIsLoading(false);
        }
    }, [fetchCurrentUser]);

    const login = async (newToken: string) => {
        setToken(newToken);
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
        await fetchCurrentUser();
    };

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
