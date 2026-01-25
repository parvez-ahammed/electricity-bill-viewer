import { authMiddleware } from '@middlewares/AuthMiddleware';
import accountRouter from '@routes/v1/account.routes';
import authRouter from '@routes/v1/auth.routes';
import electricityRouter from '@routes/v1/electricity.routes';
import notificationSettingsRouter from '@routes/v1/notificationSettings.route';
import telegramRouter from '@routes/v1/telegram.routes';
import Router from 'express';
import httpStatus from 'http-status';

const v1Router = Router();

v1Router.get('/', async (req, res) => {
    res.status(httpStatus.OK).send(
        'Version 1 of the Bill Barta API is up and running!'
    );
});

// Public routes (no authentication required)
const publicRoutes = [
    {
        prefix: '/auth',
        router: authRouter,
    },
];

// Protected routes (authentication required)
const protectedRoutes = [
    {
        prefix: '/electricity',
        router: electricityRouter,
    },
    {
        prefix: '/telegram',
        router: telegramRouter,
    },
    {
        prefix: '/accounts',
        router: accountRouter,
    },
    {
        prefix: '/notification-settings',
        router: notificationSettingsRouter,
    },
];

// Register public routes (no middleware)
publicRoutes.forEach((route) => {
    v1Router.use(route.prefix, route.router);
});

// Register protected routes (with auth middleware)
protectedRoutes.forEach((route) => {
    v1Router.use(route.prefix, authMiddleware, route.router);
});

export default v1Router;
