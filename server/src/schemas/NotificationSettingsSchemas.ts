import { IZodValidationSchema } from '@interfaces/IZodValidationSchema';
import { z } from 'zod';

export const UpdateSettingsSchema = z.object({
    chatId: z.string().min(1, 'Chat ID is required'),
    isActive: z.boolean().default(true),
});

export const updateSettingsValidation: IZodValidationSchema = {
    body: UpdateSettingsSchema,
};
