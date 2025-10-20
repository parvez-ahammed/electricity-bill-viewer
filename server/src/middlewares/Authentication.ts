import ApiError from '@helpers/ApiError';
import { IUserPayload } from '@interfaces/IUserPayload';
import { UserRepository } from '@repositories/UserRepository';

import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import passport from 'passport';

const userRepository = new UserRepository();

class AuthUserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async getUserByWhere(condition: object): Promise<{
        id?: string;
        username?: string;
        name?: string;
        role?: number;
    } | null> {
        const user = await this.userRepository.findOne(condition);
        return user;
    }
}
const authUserService = new AuthUserService(userRepository);

const verification =
    (
        req: Request,
        res: Response,
        resolve: () => void,
        reject: (reason?: unknown) => void,
        next: NextFunction
    ) =>
    async (
        err: Error | null,
        user: IUserPayload | false | null,
        info: Record<string, unknown> | string | undefined
    ): Promise<void> => {
        try {
            if (err) {
                return next(err);
            }
            if (info || !user) {
                return reject(
                    new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate')
                );
            }
            const userInfo = await authUserService.getUserByWhere({
                username: user.username,
            });

            if (!userInfo) {
                return reject(
                    new ApiError(httpStatus.NOT_FOUND, 'User not found')
                );
            }

            req.headers['x-role'] = userInfo.role?.toString() || '0';
            req.headers['x-user-id'] = userInfo.id;
            req.headers['x-username'] = userInfo.username;
            req.headers['x-name'] = userInfo.name;

            resolve();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            const authErr = new ApiError(
                httpStatus.UNAUTHORIZED,
                'Authentication failed'
            );

            next(authErr);
        }
    };

export const authentication =
    () => async (req: Request, res: Response, next: NextFunction) => {
        new Promise<void>((resolve, reject) => {
            passport.authenticate(
                'jwt',
                { session: false },
                verification(req, res, resolve, reject, next)
            )(req, res, next);
        })
            .then(() => next())
            .catch((err) => next(err));
    };
