import { config } from '@/common/constants/config.constant';

export interface GoogleLoginResponse {
    success: boolean;
    data: {
        userId: string;
        email: string;
    };
}

export const authApi = {
    async getCurrentUser(): Promise<GoogleLoginResponse> {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${config.backendApiUrl}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch current user');
        }

        return response.json();
    },

    async logout(): Promise<void> {
        const token = localStorage.getItem('auth_token');
        await fetch(`${config.backendApiUrl}/auth/logout`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
};
