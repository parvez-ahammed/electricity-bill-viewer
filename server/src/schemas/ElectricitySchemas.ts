import { z } from 'zod';

export const electricityProviderSchema = z.enum(['DPDC', 'NESCO'], {
    errorMap: () => ({
        message: 'Provider must be one of: DPDC, NESCO',
    }),
});

export const credentialSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    provider: electricityProviderSchema,
});

export const multipleCredentialsSchema = z.object({
    credentials: z
        .array(credentialSchema)
        .min(1, 'At least one credential is required')
        .max(10, 'Maximum 10 credentials allowed per request'),
});

export const singleAccountUsageSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    provider: electricityProviderSchema,
});

export type ElectricityProviderInput = z.infer<
    typeof electricityProviderSchema
>;
export type CredentialInput = z.infer<typeof credentialSchema>;
export type MultipleCredentialsInput = z.infer<
    typeof multipleCredentialsSchema
>;
export type SingleAccountUsageInput = z.infer<typeof singleAccountUsageSchema>;
