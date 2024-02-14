import { Injectable } from '@angular/core';

interface TimedCache<T> { cacheDictionnary: { [url: string]: { value: T, time: number, expiration: number } } };

export const CACHE: string = "cache";

@Injectable({
    providedIn: 'root'
})
export class TimedCacheService {
    private retrieveCache<T>(): TimedCache<T> {
        const savedCache = localStorage.getItem(CACHE);
        if (!savedCache) {
            return { cacheDictionnary: {} };
        }

        return JSON.parse(savedCache);
    }

    private removeValueFromCache(key: string) {
        const cache = this.retrieveCache();
        delete cache.cacheDictionnary[key];
        localStorage.setItem(CACHE, JSON.stringify(cache));
    }

    public cacheValue<T>(key: string, value: T, expiration = 7200000  /* 2 hours in milliseconds 2 * 60 * 60 * 1000 = 7200000 */) {
        const cache = this.retrieveCache<T>();
        cache.cacheDictionnary[key] = { value, time: Date.now(), expiration };
        localStorage.setItem(CACHE, JSON.stringify(cache));
    }

    public retrieveValue<T>(key: string): T | null {
        const cache = this.retrieveCache<T>();

        if (cache.cacheDictionnary[key]?.time < Date.now() - cache.cacheDictionnary[key]?.expiration) {
            this.removeValueFromCache(key);
            return null;
        }

        return cache.cacheDictionnary[key]?.value ?? null;
    }
}
