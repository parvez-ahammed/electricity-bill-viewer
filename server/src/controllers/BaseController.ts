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
        console.error(error);
        new ResponseBuilder(res)
            .setStatus(httpStatus.INTERNAL_SERVER_ERROR)
            .setMessage('Internal server error')
            .setData({ error: errorMessage })
            .sendError();
    }

    protected validateUser(req: Request | AuthenticatedRequest, res: Response): string | null {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user?.userId) {
            this.unauthorized(res);
            return null;
        }
        return authReq.user.userId;
    }

    protected async handleRequest(res: Response, action: () => Promise<void>): Promise<void> {
        try {
            await action();
        } catch (error) {
            this.fail(res, error);
        }
    }
}
