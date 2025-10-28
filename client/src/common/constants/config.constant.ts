import { z } from "zod";

const envSchema = z.object({
    VITE_BACKEND_API_PATH: z
        .string()
        .min(1, "VITE_BACKEND_API_PATH must be at least 1 character long")
        .default("/api/v1"),
});

function validateEnv() {
    const env = {
        VITE_BACKEND_API_PATH:
            import.meta.env.VITE_BACKEND_API_PATH || "/api/v1",
    };

    try {
        return envSchema.parse(env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map((err) => err.path.join("."));
            // eslint-disable-next-line no-console
            console.error(
                `Missing or invalid environment variables: ${missingVars.join(", ")}`
            );
            // eslint-disable-next-line no-console
            console.error("Please check your .env file");
        } else {
            // eslint-disable-next-line no-console
            console.error(
                "An unknown error occurred while validating environment variables"
            );
        }
        throw error;
    }
}

const validatedEnv = validateEnv();

export const config = {
    backendApiUrl: validatedEnv.VITE_BACKEND_API_PATH,
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
} as const;
