import { z } from 'zod';

export const paginationQuerySchema = z
    .object({
        order: z.string().optional(),
        page: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 1))
            .refine((val) => Number.isInteger(val) && val > 0, {
                message: 'Page must be a positive integer',
            }),
        per_page: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 10))
            .refine((val) => Number.isInteger(val) && val > 0, {
                message: 'Per page must be a positive integer',
            }),
        filter: z
            .string()
            .optional()
            .default('')
            .refine(
                (val) => {
                    if (val === '') return true;
                    const filters = val.split(',');
                    return filters.every((filter) => {
                        const [key, operator, value] = filter.split(':');
                        return key && operator && value;
                    });
                },
                {
                    message: 'Invalid filter query',
                }
            ),

        fields: z.string().optional().default(''),
        filter_operator: z
            .string()
            .optional()
            .default('OR')
            .transform((val) => val.toUpperCase()),
    })
    .strict();
