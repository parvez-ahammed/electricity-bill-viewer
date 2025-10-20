import { ITokenPayload } from '@interfaces/ITokenPayload';
import { IUser } from '@interfaces/IUser';

export default interface ITokenService {
    generateToken(user: IUser): string;
    verifyToken(token: string): Promise<ITokenPayload>;
}
