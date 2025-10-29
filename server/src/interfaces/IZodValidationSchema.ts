import { ZodSchema } from 'zod';

export interface IZodValidationSchema {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
}
