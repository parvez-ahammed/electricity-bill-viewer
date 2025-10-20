import winston from 'winston';

import { z } from 'zod';

const envSchema = z
    .object({
        WINSTON_LOG_LEVEL: z.string().default('info'),
    })
    .passthrough();

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error(
        'Config validation error:',
        JSON.stringify(parsedEnv.error.format(), null, 2)
    );
    throw new Error('Loki config validation failed.');
}

const winstonConfig = {
    logLevel: parsedEnv.data.WINSTON_LOG_LEVEL,
};

const consoleTransportConfig = {
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
            const colorizer = winston.format.colorize().colorize;
            return `${colorizer(level, `[${level.toUpperCase()}]`)} [${timestamp}] ${message}`;
        })
    ),
};

export const winstonLoggerConfig = {
    level: winstonConfig.logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [new winston.transports.Console(consoleTransportConfig)],
};
