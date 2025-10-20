import { IUser } from '@interfaces/IUser';

export interface LoginResponseDto {
    token: string;
    user: IUser;
}
