import authRouter from '@routes/v1/AuthRoute';
import userRouter from '@routes/v1/UserRoute';
import electricityRouter from '@routes/v1/electricity.routes';
import Router from 'express';
import httpStatus from 'http-status';

const v1Router = Router();

v1Router.get('/', async (req, res) => {
    res.status(httpStatus.OK).send(
        'Version 1 of the Neatify API is up and running!'
    );
});

const defaultRoutes = [
    {
        prefix: '/users',
        router: userRouter,
    },
    {
        prefix: '/auth',
        router: authRouter,
    },
    {
        prefix: '/electricity',
        router: electricityRouter,
    },
];

defaultRoutes.forEach((route) => {
    v1Router.use(route.prefix, route.router);
});

export default v1Router;
