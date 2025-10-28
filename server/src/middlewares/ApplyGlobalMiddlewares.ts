import { appConfig } from '@configs/config';
import { corsConfig } from '@configs/cors';
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

    app.use(cors(corsConfig));
    app.use(helmet());

    app.use(rateLimit(rateLimitterConfig));
    app.use(express.json());

    return app;
};
