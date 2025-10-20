import 'dotenv/config';
import ms from 'ms';
import { z } from 'zod';

const envSchema = z
    .object({
        PORT: z.coerce.number().default(3000),
        JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
        JWT_EXPIRES_IN: z.any().refine((val) => ms(val), {
            message:
                'JWT_EXPIRES_IN must be a valid duration string (e.g., "2d", "1h", "30m")',
        }),
        RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
        RATE_LIMIT_MAX: z.coerce.number().default(10000),
        FRONTEND_URL: z.string().optional().default('http://localhost:5173'),
        GEMINI_API_KEY: z.string().optional(),
        ENABLE_LATENCY_LOGGER: z
            .enum(['true', 'false'])
            .transform((val) => val === 'true')
            .default('false'),

        // DPDC Service Configuration
        DPDC_CLIENT_ID: z.string().optional().default('auth-ui'),
        DPDC_CLIENT_SECRET: z.string().optional(),
        DPDC_TENANT_CODE: z.string().optional().default('DPDC'),
        DPDC_COOKIE: z.string().optional(),

        // NESCO Service Configuration
        NESCO_COOKIE: z.string().optional(),
        NESCO_CSRF_TOKEN: z.string().optional(),

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
    port: parsedEnv.data.PORT,
    jwtSecret: parsedEnv.data.JWT_SECRET,
    jwtExpiresIn: parsedEnv.data.JWT_EXPIRES_IN,
    rateLimitWindowMs: parsedEnv.data.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: parsedEnv.data.RATE_LIMIT_MAX,
    frontendUrl: parsedEnv.data.FRONTEND_URL,
    geminiApiKey: parsedEnv.data.GEMINI_API_KEY,
    enableLatencyLogger: parsedEnv.data.ENABLE_LATENCY_LOGGER,

    // DPDC Configuration
    dpdc: {
        clientId: parsedEnv.data.DPDC_CLIENT_ID,
        clientSecret: parsedEnv.data.DPDC_CLIENT_SECRET,
        tenantCode: parsedEnv.data.DPDC_TENANT_CODE,
        cookie: parsedEnv.data.DPDC_COOKIE,
    },

    // NESCO Configuration
    nesco: {
        cookie: parsedEnv.data.NESCO_COOKIE,
        csrfToken: parsedEnv.data.NESCO_CSRF_TOKEN,
    },

    // Telegram Configuration
    telegram: {
        botToken: parsedEnv.data.TELEGRAM_BOT_TOKEN,
        chatId: parsedEnv.data.TELEGRAM_CHAT_ID,
    },

    // Electricity Credentials
    electricityCredentials: parsedEnv.data.ELECTRICITY_CREDENTIALS,
};
