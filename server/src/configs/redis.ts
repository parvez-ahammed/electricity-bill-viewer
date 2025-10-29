import { appConfig } from '@configs/config';
import { createClient, RedisClientType } from 'redis';

class RedisClient {
    private client: RedisClientType | null = null;
    private isConnecting = false;

    async getClient(): Promise<RedisClientType> {
        if (this.client?.isOpen) {
            return this.client;
        }

        if (this.isConnecting) {
            // Wait for the connection to complete
            await new Promise((resolve) => setTimeout(resolve, 100));
            return this.getClient();
        }

        this.isConnecting = true;

        // Import logger here to avoid circular dependency issues
        const logger = (await import('@helpers/Logger')).default;

        try {
            this.client = createClient({
                socket: {
                    host: appConfig.redis.host,
                    port: appConfig.redis.port,
                    connectTimeout: 10000,
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            logger.error(
                                'Redis: Max reconnection attempts reached'
                            );
                            return new Error(
                                'Max reconnection attempts reached'
                            );
                        }
                        return Math.min(retries * 100, 3000);
                    },
                },
                password: appConfig.redis.password,
            });

            this.client.on('error', (err) => {
                logger.error(`Redis Client Error: ${err}`);
            });

            this.client.on('connect', () => {
                logger.info('Redis: Connected successfully');
            });

            this.client.on('ready', () => {
                logger.info('Redis: Ready to accept commands');
            });

            this.client.on('reconnecting', () => {
                logger.info('Redis: Reconnecting...');
            });

            this.client.on('end', () => {
                logger.info('Redis: Connection closed');
            });

            await this.client.connect();
            this.isConnecting = false;
            return this.client;
        } catch (error) {
            this.isConnecting = false;
            const logger = (await import('@helpers/Logger')).default;
            logger.error(`Redis: Failed to connect: ${error}`);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.client?.isOpen) {
            await this.client.quit();
            this.client = null;
        }
    }

    isConnected(): boolean {
        return this.client?.isOpen ?? false;
    }
}

export const redisClient = new RedisClient();
