import { CreateUserDto, GoogleProfile } from '@interfaces/Auth';
import { UserRepository } from '@repositories/UserRepository';
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
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
        });
    }

    async handleGoogleCallback(code: string): Promise<{ user: User; token: string }> {
        try {
            // Exchange authorization code for tokens
            // The redirect_uri must match exactly what was used in the frontend
            const { tokens } = await this.oauth2Client.getToken({
                code,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI
            });
            this.oauth2Client.setCredentials(tokens);

            // Get user profile from Google
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

            // Find or create user
            const user = await this.findOrCreateUser(googleProfile);

            // Generate JWT token
            const token = this.generateJWT(user);

            return { user, token };
        } catch (error) {
            console.error('Google OAuth error:', error);
            throw new Error('Failed to authenticate with Google');
        }
    }

    async findOrCreateUser(googleProfile: GoogleProfile): Promise<User> {
        // Try to find existing user by Google ID
        let user = await this.userRepository.findByGoogleId(googleProfile.id);

        if (user) {
            return user;
        }

        // Try to find by email (in case user exists but Google ID changed)
        user = await this.userRepository.findByEmail(googleProfile.email);

        if (user) {
            return user;
        }

        // Create new user
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
