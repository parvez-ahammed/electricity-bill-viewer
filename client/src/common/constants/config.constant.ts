import { z } from "zod";

const envSchema = z.object({
    VITE_BACKEND_API_PATH: z
        .string()
        .min(1, "VITE_BACKEND_API_PATH must be at least 1 character long")
        .default("/api/v1"), // Use relative path for production (nginx will proxy)
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
            console.error(
                `Missing or invalid environment variables: ${missingVars.join(", ")}`
            );
            console.error("Please check your .env file");
        } else {
            console.error(
                "An unknown error occurred while validating environment variables"
            );
        }
        throw error;
    }
}

export const config = {
    backendApiUrl: validateEnv().VITE_BACKEND_API_PATH,
};
