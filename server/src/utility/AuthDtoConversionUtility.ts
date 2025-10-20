import { AuthResponseDto } from '@dtos/AuthResponse.dto';
import { LoginResponseDto } from '@dtos/LoginResponse.dto';
import { IAuth } from '@interfaces/IAuth';
import { IUser } from '@interfaces/IUser';

export class AuthDtoConversionUtlity {
    static convertAuth(auth: IAuth): AuthResponseDto {
        if (!auth) {
            return null;
        }
        return {
            id: auth.id,
            userId: auth.userId,
        };
    }

    static convertLoginResponse(token: string, user: IUser): LoginResponseDto {
        if (!user) {
            return null;
        }
        return {
            token,
            user,
        };
    }
}
