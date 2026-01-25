import { AuthenticatedRequest } from '@interfaces/Auth';
import { AuthService } from '@services/AuthService';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    googleLogin = (req: Request, res: Response): void => {
        try {
            const authUrl = this.authService.getAuthUrl();
            res.redirect(authUrl);
        } catch (error) {
            console.error('Error generating Google auth URL:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to initiate Google authentication',
            });
        }
    };

    googleCallback = async (req: Request, res: Response): Promise<void> => {
        try {
            const { code } = req.query;

            if (!code || typeof code !== 'string') {
                res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Authorization code is required',
                });
                return;
            }

            const { user, token } = await this.authService.handleGoogleCallback(code);

            // Check if this is a fetch/AJAX request (from frontend using fetch API)
            const isFetchRequest = req.headers.accept?.includes('application/json') ||
                                   req.headers['x-requested-with'] === 'XMLHttpRequest';

            if (isFetchRequest) {
                // Return JSON for fetch requests (frontend will handle navigation)
                res.status(httpStatus.OK).json({
                    success: true,
                    data: {
                        token,
                        user: {
                            userId: user.id,
                            email: user.email,
                        },
                    },
                });
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
                res.status(httpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'Failed to authenticate with Google',
                });
            } else {
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                res.redirect(`${frontendUrl}/login?error=authentication_failed`);
            }
        }
    };

    getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(httpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            // User info is already in the JWT payload
            res.status(httpStatus.OK).json({
                success: true,
                data: {
                    userId: req.user.userId,
                    email: req.user.email,
                },
            });
        } catch (error) {
            console.error('Error getting current user:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to get user information',
            });
        }
    };

    logout = (req: Request, res: Response): void => {
        // JWT is stateless, so logout is handled client-side by removing the token
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Logged out successfully',
        });
    };
}
