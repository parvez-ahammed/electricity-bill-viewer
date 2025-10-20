import { IZodValidationSchema } from '@interfaces/IZodValidationSchema.';
import { z } from 'zod';

const createUserBody = z
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

const getUserByIdParams = z
    .object({
        id: z.string().uuid(),
    })
    .strict();

const updateUserBody = z
    .object({
        username: z.string().trim().min(1).optional(),
        name: z.string().trim().min(1).optional(),
        email: z.string().email().trim().min(1).optional(),
        password: z.string().trim().min(1).optional(),
        role: z.number({}).int().optional(),
        bio: z.string().trim().min(1).optional(),
        location: z.string().trim().min(1).optional(),
    })
    .strict();
const toggleUserFollowParams = z
    .object({ id: z.string().uuid().optional() })
    .strict();

const deleteUserParams = z
    .object({
        id: z.string().uuid(),
    })
    .strict();

const createUserSchema: IZodValidationSchema = {
    body: createUserBody,
};

const getUserByIdSchema: IZodValidationSchema = {
    params: getUserByIdParams,
};

const updateUserSchema: IZodValidationSchema = {
    body: updateUserBody,
    params: getUserByIdParams,
};
const deleteUserSchema: IZodValidationSchema = {
    params: deleteUserParams,
};

const toggleUserFollowSchema: IZodValidationSchema = {
    params: toggleUserFollowParams,
};
export {
    createUserSchema,
    getUserByIdSchema,
    updateUserSchema,
    deleteUserSchema,
    toggleUserFollowSchema,
};
