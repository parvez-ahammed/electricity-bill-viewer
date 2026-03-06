import ApiError from '@helpers/ApiError';
import { AuthenticatedRequest } from '@interfaces/Auth';
import { Request, Response } from 'express';
import { AuthService } from '../../services/implementations/AuthService';
import { BaseController } from '../BaseController';

export class AuthController extends BaseController {
    private authService: AuthService;

    constructor() {
        super();
        this.authService = new AuthService();
    }

    googleLogin = (req: Request, res: Response): void => {
        const authUrl = this.authService.getAuthUrl();
        res.redirect(authUrl);
    };

    googleCallback = async (req: Request, res: Response): Promise<void> => {
        const { code } = req.query;

        if (!code || typeof code !== 'string') {
            throw new ApiError(400, 'Authorization code is required');
        }

        const redirectUrl = await this.authService.getCallbackRedirectUrl(code);
        res.redirect(redirectUrl);
    };


    getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const userId = this.getValidatedUserId(req);

        // User info is already in the JWT payload
        this.ok(res, {
            userId: userId,
            email: req.user?.email,
        }, 'User information retrieved successfully');
    };

    logout = (req: Request, res: Response): void => {
        // JWT is stateless, so logout is handled client-side by removing the token
        this.ok(res, {}, 'Logged out successfully');
    };
}
