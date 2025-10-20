import logger from '@helpers/Logger';
import { applyGlobalMiddlewares } from '@middlewares/ApplyGlobalMiddlewares';
import express, { Express } from 'express';

import routes from '@routes/routes';

import { applyGlobalErrorHandler } from '@middlewares/ApplyGlobalErrorHandler';
import { db } from './database/data-source';

export const app: Express = express();

applyGlobalMiddlewares(app);
app.use('/api', routes);
applyGlobalErrorHandler(app);

export async function checkDbConnection() {
    try {
        await db.initialize();
        await db.query('SELECT 1+1 AS result');
        logger.info('Database connection established');
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
}
