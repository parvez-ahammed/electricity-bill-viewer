import jwt from 'jsonwebtoken';
import { appConfig } from '@configs/config';
import { IUser } from '@interfaces/IUser';
import ITokenService from '../interfaces/ITokenService';
import { ITokenPayload } from '@interfaces/ITokenPayload';
import { tokenTypes } from '@configs/token';
export default class TokenService implements ITokenService {
    generateToken(user: IUser): string {
        const payload: ITokenPayload = {
            type: tokenTypes.ACCESS,
            username: user.username,
            name: user.name,
            role: user.role,
        };
        const token = jwt.sign(payload, appConfig.jwtSecret, {
            expiresIn: appConfig.jwtExpiresIn,
        });

        return token;
    }

    async verifyToken(token: string) {
        const payload: ITokenPayload = (await jwt.verify(
            token,
            appConfig.jwtSecret
        )) as ITokenPayload;

        return payload;
    }
}
