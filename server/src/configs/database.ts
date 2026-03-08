import { User } from '@entities/User';
import logger from '@helpers/Logger';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { Account } from '../entities/Account';
import { TelegramNotificationSettings } from '../entities/TelegramNotificationSettings';

// Determine the best data directory path
const getDataDirectory = (): string => {
    const possiblePaths = [
        path.join(process.cwd(), 'data'), // Primary: ./data
        '/app/data', // Docker volume mount
        '/tmp', // Fallback: temporary directory
    ];

    for (const dirPath of possiblePaths) {
        try {
            // Check if directory exists or can be created
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            // Test write permissions
            const testFile = path.join(dirPath, '.write-test');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);

            logger.info(`Using data directory: ${dirPath}`);
            return dirPath;
        } catch (error) {
            logger.warn(`Cannot use directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`);
            continue;
        }
    }

    throw new Error('No writable directory found for database storage');
};

// Get the data directory and database path
const dataDir = getDataDirectory();
const databasePath = path.join(dataDir, 'accounts.db');
const authDatabasePath = path.join(dataDir, 'auth.db');

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: databasePath,
    synchronize: true, // Auto-create tables in development
    logging: false,
    entities: [Account, TelegramNotificationSettings],
    migrations: [],
    subscribers: [],
});

export const AuthDataSource = new DataSource({
    type: 'sqlite',
    database: authDatabasePath,
    synchronize: true, // Auto-create tables in development
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
});

export const initializeDatabase = async (): Promise<void> => {
    try {
        await AppDataSource.initialize();
        logger.info('Account database connection initialized successfully');

        await AuthDataSource.initialize();
        logger.info('Auth database connection initialized successfully');
    } catch (error) {
        logger.error(`Error during database initialization: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
};
