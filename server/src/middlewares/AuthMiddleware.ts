import { AuthenticatedRequest } from '@interfaces/Auth';
import { JwtService } from '@services/JwtService';
import { NextFunction, Response } from 'express';

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                status: 'error',
                message: 'Authentication required. Please provide a valid token.',
                data: {},
            });
            return;
        }

        const token = authHeader.substring(7);
        const payload = JwtService.verify(token);
        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token. Please login again.',
            data: {},
        });
    }
};
