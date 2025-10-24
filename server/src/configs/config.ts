import 'dotenv/config';
import { z } from 'zod';

const envSchema = z
    .object({
        NODE_ENV: z
            .enum(['development', 'production', 'test'])
            .default('development'),
        PORT: z.coerce.number().default(3000),
        RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
        RATE_LIMIT_MAX: z.coerce.number().default(10000),
        FRONTEND_URL: z.string().optional().default('http://localhost:5173'),
        ENABLE_LATENCY_LOGGER: z
            .enum(['true', 'false'])
            .transform((val) => val === 'true')
            .default('false'),

        // Redis Configuration
        REDIS_HOST: z.string().default('localhost'),
        REDIS_PORT: z.coerce.number().default(6379),
        REDIS_PASSWORD: z.string().optional().default(''),
        REDIS_TTL: z.coerce.number().default(86400), // 24 hours in seconds

        // DPDC Service Configuration
        DPDC_CLIENT_SECRET: z.string(),

        // Telegram Bot Configuration
        TELEGRAM_BOT_TOKEN: z.string().optional(),
        TELEGRAM_CHAT_ID: z.string().optional(),

        // Electricity Credentials for automated reports
        ELECTRICITY_CREDENTIALS: z.string().optional(),
    })
    .passthrough();

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error(
        'Config validation error:',
        JSON.stringify(parsedEnv.error.format(), null, 2)
    );
    throw new Error('App config validation failed.');
}

export const appConfig = {
    nodeEnv: parsedEnv.data.NODE_ENV,
    port: parsedEnv.data.PORT,
    rateLimitWindowMs: parsedEnv.data.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: parsedEnv.data.RATE_LIMIT_MAX,
    frontendUrl: parsedEnv.data.FRONTEND_URL,
    enableLatencyLogger: parsedEnv.data.ENABLE_LATENCY_LOGGER,

    // Redis Configuration
    redis: {
        host: parsedEnv.data.REDIS_HOST,
        port: parsedEnv.data.REDIS_PORT,
        password: parsedEnv.data.REDIS_PASSWORD || undefined,
        ttl: parsedEnv.data.REDIS_TTL,
    },

    // DPDC Configuration
    dpdc: {
        clientSecret: parsedEnv.data.DPDC_CLIENT_SECRET,
    },

    // Telegram Configuration
    telegram: {
        botToken: parsedEnv.data.TELEGRAM_BOT_TOKEN,
        chatId: parsedEnv.data.TELEGRAM_CHAT_ID,
    },

    // Electricity Credentials
    electricityCredentials: parsedEnv.data.ELECTRICITY_CREDENTIALS,
};
