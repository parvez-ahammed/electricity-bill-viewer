import { appConfig } from './config';

export const rateLimitterConfig = {
    windowMs: appConfig.rateLimitWindowMs,
    max: appConfig.rateLimitMax,
    message: 'Too many requests, please try again later.',
};
