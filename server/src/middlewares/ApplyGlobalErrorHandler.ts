import { Request, Response, NextFunction, Express } from 'express';
import ApiError from '@helpers/ApiError';
import httpStatus from 'http-status';

export const applyGlobalErrorHandler = (app: Express) => {
    app.use((req: Request, res: Response, next: NextFunction) => {
        next(
            new ApiError(
                httpStatus.NOT_FOUND,
                `Not Found - ${req.originalUrl} does not exist`
            )
        );
    });

    app.use(
        (
            err: unknown,
            req: Request,
            res: Response,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            next: NextFunction
        ): void => {
            if (err instanceof ApiError) {
                res.status(err.statusCode).json({ message: err.message });
            } else {
                console.error('Unhandled error:', err);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
    );
};
