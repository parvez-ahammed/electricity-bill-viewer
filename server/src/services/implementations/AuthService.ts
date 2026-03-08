import { appConfig } from '@configs/config';
import logger from '@helpers/Logger';
import { CreateUserDto, GoogleProfile } from '@interfaces/Auth';
import { UserRepository } from '@repositories/UserRepository';
import crypto from 'crypto';
import { google } from 'googleapis';
import { User } from '../../entities/User';
import { JwtService } from './JwtService';

export class AuthService {
    private userRepository: UserRepository;
    private oauth2Client;

    constructor() {
        this.userRepository = new UserRepository();

        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    getAuthUrl(): string {
        const state = crypto.randomBytes(32).toString('hex');
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            state,
        });
    }

    async getCallbackRedirectUrl(code: string): Promise<string> {
        const frontendUrl = appConfig.frontendUrl;
        try {
            const { token } = await this.handleGoogleCallback(code);
            return `${frontendUrl}/auth/callback?token=${token}`;
        } catch (error) {
            logger.error(`Google OAuth callback error: ${error instanceof Error ? error.message : String(error)}`);
            return `${frontendUrl}/login?error=google`;
        }
    }

    async handleGoogleCallback(code: string): Promise<{ user: User; token: string }> {
        try {
            const { tokens } = await this.oauth2Client.getToken({
                code,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            });
            this.oauth2Client.setCredentials(tokens);

            const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
            const { data } = await oauth2.userinfo.get();

            if (!data.id || !data.email || !data.name) {
                throw new Error('Incomplete user profile from Google');
            }

            const googleProfile: GoogleProfile = {
                id: data.id,
                email: data.email,
                name: data.name,
                picture: data.picture || undefined,
            };

            const user = await this.findOrCreateUser(googleProfile);
            const token = this.generateJWT(user);

            return { user, token };
        } catch (error) {
            logger.error(`Google OAuth error: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error('Failed to authenticate with Google');
        }
    }

    async findOrCreateUser(googleProfile: GoogleProfile): Promise<User> {
        let user = await this.userRepository.findByGoogleId(googleProfile.id);
        if (user) return user;

        user = await this.userRepository.findByEmail(googleProfile.email);
        if (user) return user;

        const createUserDto: CreateUserDto = {
            id: googleProfile.id,
            name: googleProfile.name,
            email: googleProfile.email,
        };

        return await this.userRepository.create(createUserDto);
    }

    generateJWT(user: User): string {
        return JwtService.sign({
            userId: user.id,
            email: user.email,
        });
    }

    async verifyToken(token: string): Promise<User | null> {
        try {
            const payload = JwtService.verify(token);
            return await this.userRepository.findById(payload.userId);
        } catch (error) {
            return null;
        }
    }
}
