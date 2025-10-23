import { appConfig } from '@configs/config';
import { rateLimitterConfig } from '@configs/rateLimitter';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
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
    app.use(
        cors({
            origin: appConfig.frontendUrl,
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

    return app;
};
