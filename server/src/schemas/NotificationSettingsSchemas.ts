import { IZodValidationSchema } from '@interfaces/IZodValidationSchema';
import { z } from 'zod';

export const UpdateSettingsSchema = z.object({
    chatId: z.string().min(1, 'Chat ID is required').regex(/^-?\d+$/, 'Chat ID must be a numeric Telegram ID'),
    isActive: z.boolean().default(true),
});

export const updateSettingsValidation: IZodValidationSchema = {
    body: UpdateSettingsSchema,
};
