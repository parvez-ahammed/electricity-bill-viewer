import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export const LoginPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const error = searchParams.get('error');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (error === 'authentication_failed') {
            toast.error('Authentication failed. Please try again.');
        }
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <svg
                            className="h-6 w-6 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome to Bill Barta</CardTitle>
                    <CardDescription>
                        Manage your electricity bills with ease
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Create Account</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="login" className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-md text-sm text-muted-foreground mb-4 text-center">
                                Welcome back! Sign in to access your dashboard.
                            </div>
                            <GoogleLoginButton mode="login" />
                        </TabsContent>
                        
                        <TabsContent value="signup" className="space-y-4">
                             <div className="bg-slate-50 p-4 rounded-md text-sm text-muted-foreground mb-4 text-center">
                                New here? Create an account to start tracking your bills.
                            </div>
                            <GoogleLoginButton mode="signup" />
                        </TabsContent>
                    </Tabs>

                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
