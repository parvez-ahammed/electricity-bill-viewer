import winston from './Winston';

class Logger {
    private static instance: Logger;

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public error(message: string | Error): void {
        const errorMessage =
            message instanceof Error
                ? `Error: ${message.stack || message.message}`
                : `Error: ${message}`;
        winston.error(errorMessage);
    }

    public info(message: string): void {
        winston.info(message);
    }

    public warn(message: string): void {
        winston.warn(message);
    }
}
const logger = Logger.getInstance();
export default logger;
