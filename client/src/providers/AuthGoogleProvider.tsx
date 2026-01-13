import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';

interface AuthGoogleProviderProps {
    children: React.ReactNode;
}

export const AuthGoogleProvider: React.FC<AuthGoogleProviderProps> = ({ children }) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    if (!clientId) {
        console.warn('Google Client ID is not configured');
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>{children}</AuthProvider>
        </GoogleOAuthProvider>
    );
};
