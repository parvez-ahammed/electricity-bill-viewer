import { rateLimitterConfig } from '@configs/rateLimitter';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import express from 'express';
import { contentNegotiation } from './ContentNegotiation';
import passport from 'passport';
import { jwtStrategy } from '@configs/passport';
import cors from 'cors';
import { appConfig } from '@configs/config';
import compression from 'compression';
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
    app.use(contentNegotiation);
    passport.use('jwt', jwtStrategy);
    app.use(passport.initialize());

    return app;
};
