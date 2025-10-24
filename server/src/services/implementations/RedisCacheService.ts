import { appConfig } from '@configs/config';
import { redisClient } from '@configs/redis';
import crypto from 'crypto';

export interface CacheOptions {
    ttl?: number; // Time to live in seconds
    skipCache?: boolean; // Skip cache and fetch fresh data
}

export class RedisCacheService {
    private readonly defaultTTL: number;

    constructor() {
        this.defaultTTL = appConfig.redis.ttl;
    }

    /**
     * Generate a consistent cache key from any object
     */
    generateCacheKey(prefix: string, data: Record<string, unknown>): string {
        // Sort keys to ensure consistent ordering
        const sortedData = Object.keys(data)
            .sort()
            .reduce(
                (acc, key) => {
                    acc[key] = data[key];
                    return acc;
                },
                {} as Record<string, unknown>
            );

        // Create a hash of the sorted data
        const hash = crypto
            .createHash('sha256')
            .update(JSON.stringify(sortedData))
            .digest('hex');

        return `${prefix}:${hash}`;
    }

    /**
     * Get data from cache
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const client = await redisClient.getClient();
            const data = await client.get(key);

            if (!data || typeof data !== 'string') {
                return null;
            }

            const parsed = JSON.parse(data);

            // Check if data has expired (additional check beyond Redis TTL)
            if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
                await this.delete(key);
                return null;
            }

            return parsed.data as T;
        } catch (error) {
            console.error('Redis Cache Get Error:', error);
            return null;
        }
    }

    /**
     * Set data in cache with TTL
     */
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

            await client.setEx(key, ttl, JSON.stringify(cacheData));
            return true;
        } catch (error) {
            console.error('Redis Cache Set Error:', error);
            return false;
        }
    }

    /**
     * Delete data from cache
     */
    async delete(key: string): Promise<boolean> {
        try {
            const client = await redisClient.getClient();
            await client.del(key);
            return true;
        } catch (error) {
            console.error('Redis Cache Delete Error:', error);
            return false;
        }
    }

    /**
     * Delete multiple keys matching a pattern
     */
    async deletePattern(pattern: string): Promise<number> {
        try {
            const client = await redisClient.getClient();
            const keys = await client.keys(pattern);

            if (keys.length === 0) {
                return 0;
            }

            await client.del(keys);
            return keys.length;
        } catch (error) {
            console.error('Redis Cache Delete Pattern Error:', error);
            return 0;
        }
    }

    /**
     * Check if cache exists and is valid
     */
    async exists(key: string): Promise<boolean> {
        try {
            const client = await redisClient.getClient();
            const exists = await client.exists(key);
            return exists === 1;
        } catch (error) {
            console.error('Redis Cache Exists Error:', error);
            return false;
        }
    }

    /**
     * Get or set data with a factory function
     */
    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        options?: CacheOptions
    ): Promise<T> {
        // If skipCache is true, always fetch fresh data
        if (options?.skipCache) {
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
            return cachedData;
        }

        // Cache miss, fetch fresh data
        const freshData = await factory();

        // Store in cache only if data is successful
        if (this.shouldCacheData(freshData)) {
            await this.set(key, freshData, options);
        }

        return freshData;
    }

    /**
     * Check if data should be cached based on success criteria
     */
    private shouldCacheData<T>(data: T): boolean {
        // Check if data has a success property
        if (typeof data === 'object' && data !== null && 'success' in data) {
            const dataWithSuccess = data as { success: boolean };
            return dataWithSuccess.success === true;
        }

        // If no success property, cache by default
        return true;
    }

    /**
     * Clear all cache (use with caution)
     */
    async clearAll(): Promise<boolean> {
        try {
            const client = await redisClient.getClient();
            await client.flushDb();
            return true;
        } catch (error) {
            console.error('Redis Cache Clear All Error:', error);
            return false;
        }
    }

    /**
     * Get cache statistics
     */
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
            console.error('Redis Cache Stats Error:', error);
            return {
                connected: false,
                totalKeys: 0,
                memoryUsage: 'N/A',
            };
        }
    }
}

export const cacheService = new RedisCacheService();
