import { appConfig } from '@configs/config';
import logger from '@helpers/Logger';
import http from 'http';
import 'reflect-metadata';
import { app } from './app';
logger.info('Hello from Bill Barta API!');

const server: http.Server = http.createServer(app);

async function startServer() {
    server.listen(appConfig.port, '0.0.0.0', () =>
        logger.info(`Server is running on http://localhost:${appConfig.port}`)
    );
}

startServer();
