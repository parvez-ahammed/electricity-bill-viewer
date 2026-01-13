import { Request } from 'express';

export interface GoogleProfile {
    id: string;
    email: string;
    name: string;
    picture?: string;
}

export interface JwtPayload {
    userId: string;
    email: string;
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export interface CreateUserDto {
    id: string;
    name: string;
    email: string;
}

export interface GoogleTokenResponse {
    access_token: string;
    id_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    refresh_token?: string;
}
