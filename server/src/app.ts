import { applyGlobalMiddlewares } from '@middlewares/ApplyGlobalMiddlewares';
import express, { Express } from 'express';
import 'express-async-errors';

import routes from '@routes/routes';

import { applyGlobalErrorHandler } from '@middlewares/ApplyGlobalErrorHandler';

export const app: Express = express();

applyGlobalMiddlewares(app);
app.use('/api', routes);
applyGlobalErrorHandler(app);
