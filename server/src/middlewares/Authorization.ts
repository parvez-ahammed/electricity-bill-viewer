import { checkPermission } from '@utility/PermissionChecker';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

export const authorization = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const role = req.headers['x-role'];
            const method = req.method;
            const route = req.originalUrl;
            const hasPermission = checkPermission(
                role as string,
                method,
                route
            );

            if (!hasPermission) {
                res.status(httpStatus.FORBIDDEN).json({
                    message:
                        'Forbidden: You do not have permission to access this route',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
