import { AuthenticatedRequest } from '@interfaces/Auth';
import { AuthService } from '@services/AuthService';
import { Request, Response } from 'express';
import { google } from 'googleapis';
import { BaseController } from '../BaseController';

export class AuthController extends BaseController {
    private authService: AuthService;
    private oauth2Client;

    constructor() {
        super();
        this.authService = new AuthService();
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    googleLogin = (req: Request, res: Response): void => {
        try {
            const authUrl = this.oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['openid', 'email', 'profile'],
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                prompt: 'consent',
            });
            res.redirect(authUrl);
        } catch (error) {
            console.error('Error generating Google auth URL:', error);
            this.fail(res, 'Failed to initiate Google authentication');
        }
    };

    googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Code missing' });
    }

    const redirectUri =
      'https://billbarta.parvez.cloud/api/v1/auth/google/callback';

    const { tokens } = await this.oauth2Client.getToken({
      code,
      redirect_uri: redirectUri, // MUST MATCH STEP 1
    });

    this.oauth2Client.setCredentials(tokens);

    const userInfo = await this.oauth2Client
      .request({ url: 'https://www.googleapis.com/oauth2/v3/userinfo' });

    const user = await this.authService.findOrCreateUser(userInfo.data);
    const jwt = this.authService.generateJWT(user);

    const frontendUrl = process.env.FRONTEND_URL!;
    res.redirect(`${frontendUrl}/auth/callback?token=${jwt}`);
  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google`);
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
