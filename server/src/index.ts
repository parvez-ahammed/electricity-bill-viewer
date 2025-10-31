import { appConfig } from '@configs/config';
import logger from '@helpers/Logger';
import http from 'http';
import 'reflect-metadata';
import { app } from './app';
import { initializeDatabase } from './configs/database';
import { initializeScheduler } from './services/implementations/SchedulerService';

logger.info('Hello from Bill Barta API!');

const server: http.Server = http.createServer(app);
const schedulerService = initializeScheduler();

async function startServer() {
    try {
        await initializeDatabase();
        
        server.listen(appConfig.port, '0.0.0.0', () => {
            logger.info(`Server is running on http://localhost:${appConfig.port}`);

            // Start the daily balance notification scheduler
            schedulerService.startDailyBalanceNotification();
        });
    } catch (error) {
        logger.error('Failed to start server: ' + error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    schedulerService.stop();
    server.close(() => {
        logger.info('HTTP server closed');
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    schedulerService.stop();
    server.close(() => {
        logger.info('HTTP server closed');
    });
});

startServer();
