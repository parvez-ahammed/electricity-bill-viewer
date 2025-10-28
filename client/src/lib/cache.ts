import { EMPTY_STRING } from "@/common/constants/app.constant";

type CacheItems = "preferences";

export interface CacheService {
    save(key: CacheItems, val: string): Promise<void>;
    get(key: CacheItems): Promise<string | null>;
    remove(key: CacheItems): Promise<void>;
}

class WebCacheService implements CacheService {
    async get(key: string): Promise<string | null> {
        return new Promise<string | null>((resolve) => {
            const data = window.localStorage.getItem(key);
            if (!data) {
                resolve(null);
                return;
            }

            if (data === "undefined" || data.trim() === EMPTY_STRING) {
                resolve(null);
                return;
            }

            resolve(data);
        });
    }

    async remove(key: string): Promise<void> {
        return new Promise<void>((resolve) => {
            window.localStorage.removeItem(key);
            resolve();
        });
    }

    async save(key: string, val: string): Promise<void> {
        return new Promise<void>((resolve) => {
            window.localStorage.setItem(key, val);
            resolve();
        });
    }
}

export class CacheServiceFactory {
    static getCacheService(): CacheService {
        return new WebCacheService();
    }
}
