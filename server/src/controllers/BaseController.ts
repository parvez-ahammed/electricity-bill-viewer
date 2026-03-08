import ApiError from '@helpers/ApiError';
import logger from '@helpers/Logger';
import { ResponseBuilder } from '@helpers/ResponseBuilder';
import { AuthenticatedRequest } from '@interfaces/Auth';
import { Request, Response } from 'express';
import httpStatus from 'http-status';

export abstract class BaseController {
    protected ok<T>(res: Response, data: T, message: string): void {
        new ResponseBuilder(res)
            .setStatus(httpStatus.OK)
            .setData(data)
            .setMessage(message)
            .send();
    }

    protected created<T>(res: Response, data: T, message: string): void {
        new ResponseBuilder(res)
            .setStatus(httpStatus.CREATED)
            .setData(data)
            .setMessage(message)
            .send();
    }

    protected clientError(res: Response, message: string, code: number = httpStatus.BAD_REQUEST): void {
        new ResponseBuilder(res)
            .setStatus(code)
            .setMessage(message)
            .setData({})
            .sendError();
    }

    protected unauthorized(res: Response, message: string = 'Authentication required'): void {
        new ResponseBuilder(res)
            .setStatus(httpStatus.UNAUTHORIZED)
            .setMessage(message)
            .setData({})
            .sendError();
    }

    protected notFound(res: Response, message: string = 'Resource not found'): void {
        new ResponseBuilder(res)
            .setStatus(httpStatus.NOT_FOUND)
            .setMessage(message)
            .setData({})
            .sendError();
    }

    protected fail(res: Response, error: unknown | Error): void {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(error instanceof Error ? error : `Unhandled controller error: ${errorMessage}`);
        new ResponseBuilder(res)
            .setStatus(httpStatus.INTERNAL_SERVER_ERROR)
            .setMessage('Internal server error')
            .setData({ error: errorMessage })
            .sendError();
    }

    protected getValidatedUserId(req: Request | AuthenticatedRequest): string {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user?.userId) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
        }
        return authReq.user.userId;
    }
}
