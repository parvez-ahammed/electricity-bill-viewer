import { AuthenticatedRequest } from '@interfaces/Auth';
import { AuthService } from '@services/AuthService';
import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class AuthController extends BaseController {
    private authService: AuthService;

    constructor() {
        super();
        this.authService = new AuthService();
    }

    googleLogin = (req: Request, res: Response): void => {
        try {
            const authUrl = this.authService.getAuthUrl();
            res.redirect(authUrl);
        } catch (error) {
            console.error('Error generating Google auth URL:', error);
            this.fail(res, 'Failed to initiate Google authentication');
        }
    };

    googleCallback = async (req: Request, res: Response): Promise<void> => {
        try {
            const { code } = req.query;

            if (!code || typeof code !== 'string') {
                res.status(400).json({ message: 'Authorization code is required' });
                return;
            }

            // Use AuthService to handle the complete OAuth flow
            const { user, token } = await this.authService.handleGoogleCallback(code);

            // Redirect to frontend with the JWT token
            const frontendUrl = process.env.FRONTEND_URL!;
            res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            const frontendUrl = process.env.FRONTEND_URL!;
            res.redirect(`${frontendUrl}/login?error=google`);
        }
    };


    getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await this.handleRequest(res, async () => {
             if (!req.user) {
                this.unauthorized(res, 'User not authenticated');
                return;
            }

            // User info is already in the JWT payload
            this.ok(res, {
                userId: req.user.userId,
                email: req.user.email,
            }, 'User information retrieved successfully');
        });
    };

    logout = (req: Request, res: Response): void => {
        // JWT is stateless, so logout is handled client-side by removing the token
        this.ok(res, {}, 'Logged out successfully');
    };
}
