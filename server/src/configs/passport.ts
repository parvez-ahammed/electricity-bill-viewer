import {
    Strategy,
    ExtractJwt,
    VerifyCallbackWithRequest,
    StrategyOptions,
} from 'passport-jwt';
import { appConfig } from '@configs/config';
import { Request } from 'express';
import { IUserPayload } from '@interfaces/IUserPayload';
import { tokenTypes } from '@configs/token';
import ApiError from '@helpers/ApiError';
import httpStatus from 'http-status';

const jwtOptions: StrategyOptions = {
    secretOrKey: appConfig.jwtSecret,
    jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromHeader('x-access-token'),
    ]),
    passReqToCallback: true,
};

const jwtVerify: VerifyCallbackWithRequest = async (
    req: Request,
    payload: IUserPayload,
    done
) => {
    try {
        if (payload.type !== tokenTypes.ACCESS) {
            return done(
                new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type'),
                false
            );
        }

        req.user = payload;

        return done(null, payload);
    } catch (error) {
        return done(error, false);
    }
};
export const jwtStrategy = new Strategy(jwtOptions, jwtVerify);
