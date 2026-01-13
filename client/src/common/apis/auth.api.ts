const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
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
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
};
