import { config } from '@/common/constants/config.constant';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { CodeResponse, useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';


interface GoogleLoginButtonProps {
    mode?: 'login' | 'signup';
}

export const GoogleLoginButton = ({ mode = 'login' }: GoogleLoginButtonProps) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (codeResponse: CodeResponse) => {
            setIsLoading(true);
            try {
                // Exchange the authorization code for JWT token from our backend
                const response = await fetch(
                    `${config.backendApiUrl}/auth/google/callback?code=${codeResponse.code}`,
                    {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data?.token) {
                        // Login and navigate to home
                        await login(data.data.token);
                        toast.success('Successfully logged in!');
                        navigate('/');
                    } else {
                        toast.error('Failed to authenticate with Google');
                    }
                } else {
                    toast.error('Failed to authenticate with Google');
                }
            } catch (error) {
                console.error('Google login error:', error);
                toast.error('An error occurred during login');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            toast.error('Google login failed');
        },
        flow: 'auth-code',
        // For login, omit prompt to let Google decide (usually standard account selection).
        // For signup, force 'consent' to ensure we get a refresh token/permissions.
        prompt: mode === 'signup' ? 'consent' : undefined,
    } as any); // Cast to any because 'prompt' property might differ in type definitions

    const label = mode === 'signup' ? 'Create Account with Google' : 'Sign in with Google';

    return (
        <Button
            onClick={() => handleGoogleLogin()}
            disabled={isLoading}
            className="w-full"
            variant="outline"
        >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
            </svg>
            {isLoading ? 'Connecting...' : label}
        </Button>
    );
};
