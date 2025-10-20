import { winstonLoggerConfig } from '@configs/winston';
import winston from 'winston';
class Winston {
    private static instance: winston.Logger;

    private constructor() {}

    public static getInstance(): winston.Logger {
        if (!Winston.instance) {
            Winston.instance = winston.createLogger(winstonLoggerConfig);
        }
        return Winston.instance;
    }
}

const wintstonlogger = Winston.getInstance();
export default wintstonlogger;
