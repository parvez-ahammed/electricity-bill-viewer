import logger from '@helpers/Logger';
import { Request, Response, NextFunction } from 'express';
export const latencyLogger = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const timeInMs = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);

        logger.info(`[${req.method}] ${req.originalUrl} - ${timeInMs} ms`);
    });

    next();
};
