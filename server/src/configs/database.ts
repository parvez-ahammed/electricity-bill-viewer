import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { Account } from '../entities/Account';

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: path.join(dataDir, 'accounts.db'),
    synchronize: true, // Auto-create tables in development
    logging: false,
    entities: [Account],
    migrations: [],
    subscribers: [],
});

export const initializeDatabase = async (): Promise<void> => {
    try {
        await AppDataSource.initialize();
        console.log('Database connection initialized successfully');
    } catch (error) {
        console.error('Error during database initialization:', error);
        throw error;
    }
};