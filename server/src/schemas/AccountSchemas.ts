import { IZodValidationSchema } from '@interfaces/IZodValidationSchema';
import { ElectricityProvider } from '@interfaces/Shared';
import { z } from 'zod';

const DPDCCredentialsSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required for DPDC'),
    clientSecret: z.string().min(1, 'ClientSecret is required ')});

const NESCOCredentialsSchema = z.object({
    username: z.string().min(1, 'Username is required'),
});

export const CreateAccountSchema = z.object({
    provider: z.nativeEnum(ElectricityProvider),
    credentials: z.union([DPDCCredentialsSchema, NESCOCredentialsSchema]),
}).refine((data) => {
    if (data.provider === ElectricityProvider.DPDC) {
        return DPDCCredentialsSchema.safeParse(data.credentials).success;
    }
    if (data.provider === ElectricityProvider.NESCO) {
        return NESCOCredentialsSchema.safeParse(data.credentials).success;
    }
    return false;
}, {
    message: 'Invalid credentials for the specified provider',
});

export const UpdateAccountSchema = z.object({
    credentials: z.union([DPDCCredentialsSchema, NESCOCredentialsSchema]),
});

export const AccountParamsSchema = z.object({
    id: z.string().uuid('Invalid account ID format'),
});

export const SetNicknameSchema = z.object({
    nickname: z.string().min(1, 'Nickname is required and must be a non-empty string').trim(),
});

// Validation schemas for middleware
export const createAccountValidation: IZodValidationSchema = {
    body: CreateAccountSchema,
};

export const updateAccountValidation: IZodValidationSchema = {
    params: AccountParamsSchema,
    body: UpdateAccountSchema,
};

export const accountParamsValidation: IZodValidationSchema = {
    params: AccountParamsSchema,
};

export const setNicknameValidation: IZodValidationSchema = {
    params: AccountParamsSchema,
    body: SetNicknameSchema,
};

export const providerParamsValidation: IZodValidationSchema = {
    params: z.object({
        provider: z.nativeEnum(ElectricityProvider),
    }),
};