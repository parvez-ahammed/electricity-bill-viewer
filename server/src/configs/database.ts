import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { Account } from '../entities/Account';

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
            
            console.log(`Using data directory: ${dirPath}`);
            return dirPath;
        } catch (error) {
            console.warn(`Cannot use directory ${dirPath}:`, error instanceof Error ? error.message : error);
            continue;
        }
    }
    
    throw new Error('No writable directory found for database storage');
};

// Get the data directory and database path
const dataDir = getDataDirectory();
const databasePath = path.join(dataDir, 'accounts.db');

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: databasePath,
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