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
                this.clientError(res, 'Authorization code is required');
                return;
            }

            const { user, token } = await this.authService.handleGoogleCallback(code);

            // Check if this is a fetch/AJAX request (from frontend using fetch API)
            const isFetchRequest = req.headers.accept?.includes('application/json') ||
                                   req.headers['x-requested-with'] === 'XMLHttpRequest';

            if (isFetchRequest) {
                // Return JSON for fetch requests (frontend will handle navigation)
                this.ok(res, {
                    token,
                    user: {
                        userId: user.id,
                        email: user.email,
                    },
                }, 'Authenticated successfully');
            } else {
                // Redirect for direct browser navigation
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
            }
        } catch (error) {
            console.error('Google callback error:', error);
            
            // Check if this is a fetch request
            const isFetchRequest = req.headers.accept?.includes('application/json') ||
                                   req.headers['x-requested-with'] === 'XMLHttpRequest';

            if (isFetchRequest) {
                this.unauthorized(res, 'Failed to authenticate with Google');
            } else {
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                res.redirect(`${frontendUrl}/login?error=authentication_failed`);
            }
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
