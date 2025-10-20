import { IZodValidationSchema } from '@interfaces/IZodValidationSchema.';
import { z } from 'zod';

const loginWithEmailPasswordBody = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .trim()
        .min(5, 'Email must be at least 5 characters long'),
    password: z
        .string()
        .trim()
        .min(1, 'Password must be at least 1 character long'),
});

const updatePasswordBody = z
    .object({
        currentPassword: z
            .string()
            .min(1, { message: 'Current password is required' }),
        newPassword: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters' })
            .regex(/[A-Z]/, {
                message: 'Password must contain at least one uppercase letter',
            })
            .regex(/[a-z]/, {
                message: 'Password must contain at least one lowercase letter',
            })
            .regex(/[0-9]/, {
                message: 'Password must contain at least one number',
            }),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: 'New password must be different from the current password',
        path: ['newPassword'],
    });

const registerUserBody = z
    .object({
        username: z
            .string()
            .min(1, 'Username is required')
            .max(10, 'Username cannot exceed 10 characters')
            .refine((val) => val.trim().length > 0, {
                message: 'Username cannot be empty after trimming',
            })
            .transform((val) => val.trim()),
        name: z
            .string()
            .min(1)
            .transform((val) => val.trim()),
        email: z
            .string()
            .email()
            .min(1)
            .transform((val) => val.trim()),
        password: z
            .string()
            .min(1)
            .transform((val) => val.trim()),
        role: z.number().int(),
    })
    .strict();

const loginWithEmailPasswordSchema: IZodValidationSchema = {
    body: loginWithEmailPasswordBody,
};

const updatePasswordSchema: IZodValidationSchema = {
    body: updatePasswordBody,
};
const registerUserSchema: IZodValidationSchema = {
    body: registerUserBody,
};

export {
    loginWithEmailPasswordSchema,
    updatePasswordSchema,
    registerUserSchema,
};
