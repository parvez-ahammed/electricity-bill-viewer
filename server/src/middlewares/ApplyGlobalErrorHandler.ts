import ApiError from '@helpers/ApiError';
import logger from '@helpers/Logger';
import { Express, NextFunction, Request, Response } from 'express';
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
                res.status(err.statusCode).json({
                    status: 'error',
                    message: err.message,
                    data: {},
                });
            } else {
                logger.error(err instanceof Error ? err : `Unhandled error: ${String(err)}`);
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                    status: 'error',
                    message: 'Internal Server Error',
                    data: {},
                });
            }
        }
    );
};
