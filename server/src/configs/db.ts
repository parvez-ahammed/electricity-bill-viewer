import { z } from 'zod';
import 'dotenv/config';

const dbEnvSchema = z
    .object({
        DB_HOST: z.string().default('localhost'),
        DB_PORT: z.coerce.number().default(5432),
        DB_USER: z.string().min(1, 'DB_USER is required'),
        DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
        DB_NAME: z.string().min(1, 'DB_NAME is required'),
    })
    .passthrough();

const parsedEnv = dbEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error(
        'Config validation error:',
        JSON.stringify(parsedEnv.error.format(), null, 2)
    );
    throw new Error('Database config validation failed.');
}

export const dbConfig = {
    dbHost: parsedEnv.data.DB_HOST,
    dbPort: parsedEnv.data.DB_PORT,
    dbUser: parsedEnv.data.DB_USER,
    dbPass: parsedEnv.data.DB_PASSWORD,
    dbName: parsedEnv.data.DB_NAME,
};

export const TABLE_NAMES = {
    AUTH: 'auth',
    INTERACTIONS: 'interactions',
    USERS: 'users',
};
