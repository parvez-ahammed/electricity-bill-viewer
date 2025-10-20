import ApiError from '@helpers/ApiError';
import { Request } from 'express';
import httpStatus from 'http-status';

export const getUserInfoFromRequest = (req: Request) => {
    if (!req) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Request is not provided'
        );
    }
    const userId: string = <string>req.headers['x-user-id'];
    const role: string = <string>req.headers['x-role'];
    const name: string = <string>req.headers['x-name'];
    const username: string = <string>req.headers['x-username'];
    return { userId, role, name, username };
};
