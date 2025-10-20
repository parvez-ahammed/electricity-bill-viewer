import { DataSource } from 'typeorm';
import { dbConfig } from '../configs/db';
import { Auth } from './entity/Auth';
import { User } from './entity/User';

export const db = new DataSource({
    type: 'postgres',
    host: dbConfig.dbHost,
    port: dbConfig.dbPort,
    username: dbConfig.dbUser,
    password: dbConfig.dbPass,
    database: dbConfig.dbName,
    entities: [User, Auth],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
    logging: false,
});
