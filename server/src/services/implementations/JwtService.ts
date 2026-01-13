import { JwtPayload } from '@interfaces/Auth';
import jwt from 'jsonwebtoken';

export class JwtService {
    private static readonly SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    private static readonly EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

    static sign(payload: JwtPayload): string {
        return jwt.sign(payload as object, this.SECRET, {
            expiresIn: this.EXPIRES_IN,
        } as jwt.SignOptions);
    }

    static verify(token: string): JwtPayload {
        try {
            return jwt.verify(token, this.SECRET) as JwtPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    static decode(token: string): JwtPayload | null {
        try {
            return jwt.decode(token) as JwtPayload;
        } catch (error) {
            return null;
        }
    }
}
