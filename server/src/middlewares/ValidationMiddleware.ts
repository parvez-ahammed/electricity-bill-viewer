import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';
import httpStatus from 'http-status';
import logger from '@helpers/Logger';
import { IZodValidationSchema } from '@interfaces/IZodValidationSchema.';

export function validate(schema: IZodValidationSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schema.body) req.body = schema.body.parse(req.body);
            if (schema.params) req.params = schema.params.parse(req.params);
            if (schema.query) req.query = schema.query.parse(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue: ZodIssue) => ({
                    message: `${issue.path.join('.')} is ${issue.message}`,
                }));
                logger.error(JSON.stringify(errorMessages));
                res.status(httpStatus.BAD_REQUEST).json({
                    error: 'The given data was invalid.',
                });
            } else {
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                    error: 'Internal Server Error',
                });
            }
        }
    };
}
