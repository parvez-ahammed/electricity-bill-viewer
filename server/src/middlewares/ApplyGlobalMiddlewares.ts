import { appConfig } from '@configs/config';
import { jwtStrategy } from '@configs/passport';
import { rateLimitterConfig } from '@configs/rateLimitter';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import passport from 'passport';
import { contentNegotiation } from './ContentNegotiation';
import { latencyLogger } from './LatencyLoggerMiddleware';
export const applyGlobalMiddlewares = (
    app: express.Application
): express.Application => {
    if (appConfig.enableLatencyLogger) {
        app.use(latencyLogger);
    }
    app.use(
        compression({
            threshold: 1024,
        })
    );

    // Configure CORS to accept multiple origins
    const allowedOrigins = [
        appConfig.frontendUrl,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        // Add IP address patterns for local network
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
        /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
        /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/,
    ];

    app.use(
        cors({
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true);

                // Check if origin is in allowed list or matches pattern
                const isAllowed = allowedOrigins.some((allowedOrigin) => {
                    if (typeof allowedOrigin === 'string') {
                        return origin === allowedOrigin;
                    }
                    if (allowedOrigin instanceof RegExp) {
                        return allowedOrigin.test(origin);
                    }
                    return false;
                });

                if (isAllowed) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: [
                'GET',
                'POST',
                'PUT',
                'DELETE',
                'PATCH',
                'HEAD',
                'OPTIONS',
            ],
            allowedHeaders: [
                'Content-Type',
                'Origin',
                'X-Requested-With',
                'Accept',
                'x-client-key',
                'x-client-token',
                'x-client-secret',
                'Authorization',
            ],
        })
    );
    // https://helmetjs.github.io/
    app.use(helmet());

    app.use(rateLimit(rateLimitterConfig));
    app.use(express.json());
    app.use(contentNegotiation);
    passport.use('jwt', jwtStrategy);
    app.use(passport.initialize());

    return app;
};
