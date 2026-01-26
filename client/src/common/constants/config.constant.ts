import { z } from "zod";

const envSchema = z.object({
    VITE_BACKEND_API_PATH: z
        .string()
        .min(1, "VITE_BACKEND_API_PATH must be at least 1 character long")
        .default("/api/v1"),
    VITE_BACKEND_URL: z
        .string()
        .url("VITE_BACKEND_URL must be a valid URL")
        .default("http://localhost:3000"),
});

function validateEnv() {
    const env = {
        VITE_BACKEND_API_PATH:
            import.meta.env.VITE_BACKEND_API_PATH || "/api/v1",
        VITE_BACKEND_URL:
            import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
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
    backendUrl: validatedEnv.VITE_BACKEND_URL,
    backendApiUrl: validatedEnv.VITE_BACKEND_URL + validatedEnv.VITE_BACKEND_API_PATH,
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
} as const;
