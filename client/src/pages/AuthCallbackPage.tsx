import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export const AuthCallbackPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const hasProcessedLogin = useRef(false);

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessedLogin.current) return;

        const token = searchParams.get('token');

        if (token) {
            hasProcessedLogin.current = true;
            login(token)
                .then(() => {
                    toast.success('Successfully logged in!');
                    navigate('/');
                })
                .catch(() => {
                    toast.error('Failed to complete login');
                    navigate('/login');
                });
        } else {
            toast.error('No authentication token received');
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="text-muted-foreground">Completing sign in...</p>
            </div>
        </div>
    );
};
