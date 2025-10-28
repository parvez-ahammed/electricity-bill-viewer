import logger from '@helpers/Logger';
import { CorsOptions } from 'cors';
import { appConfig } from './config';

/**
 * CORS configuration for the application
 * Allows requests from configured origins and local network IPs
 */
export const corsConfig: CorsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            appConfig.frontendUrl,
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ];

        // Regex patterns for local network IPs
        const localNetworkPatterns = [
            /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
            /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
            /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/,
        ];

        // Allow requests with no origin (mobile apps, curl, Postman, etc.)
        if (!origin) {
            return callback(null, true);
        }

        // Check if origin is in allowed list
        const isAllowedOrigin = allowedOrigins.includes(origin);

        // Check if origin matches local network pattern
        const isLocalNetwork = localNetworkPatterns.some((pattern) =>
            pattern.test(origin)
        );

        if (isAllowedOrigin || isLocalNetwork) {
            callback(null, true);
        } else if (appConfig.nodeEnv === 'development') {
            // In development, log warning but allow the request
            logger.warn(
                `CORS: Allowing unrecognized origin in development mode: ${origin}`
            );
            callback(null, true);
        } else {
            // In production, block unrecognized origins
            logger.error(`CORS: Blocked origin - ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Origin',
        'X-Requested-With',
        'Accept',
        'x-client-key',
        'x-client-token',
        'x-client-secret',
        'x-skip-cache',
        'Authorization',
    ],
};
