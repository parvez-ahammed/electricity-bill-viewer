import accountRouter from '@routes/v1/account.routes';
import electricityRouter from '@routes/v1/electricity.routes';
import telegramRouter from '@routes/v1/telegram.routes';
import Router from 'express';
import httpStatus from 'http-status';

const v1Router = Router();

v1Router.get('/', async (req, res) => {
    res.status(httpStatus.OK).send(
        'Version 1 of the Bill Barta API is up and running!'
    );
});

const defaultRoutes = [
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
];

defaultRoutes.forEach((route) => {
    v1Router.use(route.prefix, route.router);
});

export default v1Router;
