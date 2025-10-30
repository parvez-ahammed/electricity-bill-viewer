import { appConfig } from '@configs/config';
import { redisClient } from '@configs/redis';
import logger from '@helpers/Logger';
import crypto from 'crypto';

export interface CacheOptions {
    ttl?: number;
    skipCache?: boolean;
}

export class RedisCacheService {
    private readonly defaultTTL: number;

    constructor() {
        this.defaultTTL = appConfig.redis.ttl;
    }

    generateCacheKey(prefix: string, data: Record<string, unknown>): string {
        const sortedData = Object.keys(data)
            .sort()
            .reduce(
                (acc, key) => {
                    acc[key] = data[key];
                    return acc;
                },
                {} as Record<string, unknown>
            );

        const hash = crypto
            .createHash('sha256')
            .update(JSON.stringify(sortedData))
            .digest('hex');

        return `${prefix}:${hash}`;
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const client = await redisClient.getClient();
            logger.debug(`[RedisCache] Getting key: ${key}`);
            const data = await client.get(key);

            if (!data || typeof data !== 'string') {
                logger.debug(`[RedisCache] Key not found or invalid: ${key}`);
                return null;
            }

            const parsed = JSON.parse(data);

            if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
                logger.info(`[RedisCache] Key expired, deleting: ${key}`);
                await this.delete(key);
                return null;
            }

            logger.debug(`[RedisCache] Cache hit for key: ${key}`);
            return parsed.data as T;
        } catch (error) {
            logger.error('Redis Cache Get Error:' + error);
            return null;
        }
    }

    async set<T>(
        key: string,
        value: T,
        options?: CacheOptions
    ): Promise<boolean> {
        try {
            const client = await redisClient.getClient();
            const ttl = options?.ttl || this.defaultTTL;

            const cacheData = {
                data: value,
                cachedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
            };

            logger.debug(`[RedisCache] Setting key: ${key} (TTL: ${ttl}s)`);
            await client.setEx(key, ttl, JSON.stringify(cacheData));
            logger.info(`[RedisCache] Key set: ${key}`);
            return true;
        } catch (error) {
            logger.error('Redis Cache Set Error:' + error);
            return false;
        }
    }

    async delete(key: string): Promise<boolean> {
        try {
            const client = await redisClient.getClient();
            logger.debug(`[RedisCache] Deleting key: ${key}`);
            await client.del(key);
            logger.info(`[RedisCache] Deleted key: ${key}`);
            return true;
        } catch (error) {
            logger.error('Redis Cache Delete Error:' + error);
            return false;
        }
    }

    async deletePattern(pattern: string): Promise<number> {
        try {
            const client = await redisClient.getClient();
            logger.debug(`[RedisCache] Deleting keys with pattern: ${pattern}`);
            const keys = await client.keys(pattern);

            if (keys.length === 0) {
                logger.debug(
                    `[RedisCache] No keys found for pattern: ${pattern}`
                );
                return 0;
            }

            await client.del(keys);
            logger.info(
                `[RedisCache] Deleted ${keys.length} keys for pattern: ${pattern}`
            );
            return keys.length;
        } catch (error) {
            logger.error('Redis Cache Delete Pattern Error:' + error);
            return 0;
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const client = await redisClient.getClient();
            logger.debug(`[RedisCache] Checking existence for key: ${key}`);
            const exists = await client.exists(key);
            return exists === 1;
        } catch (error) {
            logger.error('Redis Cache Exists Error:' + error);
            return false;
        }
    }

    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        options?: CacheOptions
    ): Promise<T> {
        // If skipCache is true, always fetch fresh data
        if (options?.skipCache) {
            logger.debug(
                `[RedisCache] skipCache set. Fetching fresh data for key: ${key}`
            );
            const freshData = await factory();

            // Only cache if the data is successful
            if (this.shouldCacheData(freshData)) {
                await this.set(key, freshData, options);
            }

            return freshData;
        }

        // Try to get from cache
        const cachedData = await this.get<T>(key);

        if (cachedData !== null) {
            logger.info(`[RedisCache] Returning cached data for key: ${key}`);
            return cachedData;
        }

        // Cache miss, fetch fresh data
        logger.debug(
            `[RedisCache] Cache miss for key: ${key}. Fetching fresh data.`
        );
        const freshData = await factory();

        // Store in cache only if data is successful
        if (this.shouldCacheData(freshData)) {
            await this.set(key, freshData, options);
        }

        return freshData;
    }

    private shouldCacheData<T>(data: T): boolean {
        // Check if data has a success property
        if (typeof data === 'object' && data !== null && 'success' in data) {
            const dataWithSuccess = data as { success: boolean };
            return dataWithSuccess.success === true;
        }

        // If no success property, cache by default
        return true;
    }

    async clearAll(): Promise<boolean> {
        try {
            const client = await redisClient.getClient();
            await client.flushDb();
            return true;
        } catch (error) {
            logger.error('Redis Cache Clear All Error:' + error);
            return false;
        }
    }

    async getStats(): Promise<{
        connected: boolean;
        totalKeys: number;
        memoryUsage: string;
    }> {
        try {
            const client = await redisClient.getClient();
            const info = await client.info('memory');
            const dbSize = await client.dbSize();

            const memoryMatch = info.match(/used_memory_human:(.+)/);
            const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'N/A';

            return {
                connected: redisClient.isConnected(),
                totalKeys: dbSize,
                memoryUsage,
            };
        } catch (error) {
            logger.error('Redis Cache Stats Error:' + error);
            return {
                connected: false,
                totalKeys: 0,
                memoryUsage: 'N/A',
            };
        }
    }
}

export const cacheService = new RedisCacheService();
