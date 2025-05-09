import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';
import { performanceMonitor } from './performance';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
}

interface CacheOptions {
  expiry?: number; // время жизни в миллисекундах
  forceRefresh?: boolean; // принудительное обновление
}

class Cache {
  private static instance: Cache;
  private readonly defaultExpiry = 5 * 60 * 1000; // 5 минут
  private readonly maxSize = 50 * 1024 * 1024; // 50MB

  private constructor() {}

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  private async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let size = 0;
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          size += value.length;
        }
      }
      return size;
    } catch (error) {
      logger.error('Failed to get storage size', error);
      return 0;
    }
  }

  private async clearOldItems(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const now = Date.now();

      for (const key of keys) {
        if (key.startsWith('cache_')) {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            const item: CacheItem<any> = JSON.parse(value);
            if (item.expiry && item.timestamp + item.expiry < now) {
              await AsyncStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Failed to clear old cache items', error);
    }
  }

  public async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    return performanceMonitor.measureAsync('cache_get', async () => {
      try {
        const cacheKey = `cache_${key}`;
        const value = await AsyncStorage.getItem(cacheKey);

        if (!value) {
          return null;
        }

        const item: CacheItem<T> = JSON.parse(value);
        const now = Date.now();

        // Проверяем срок действия
        if (item.expiry && item.timestamp + item.expiry < now) {
          await AsyncStorage.removeItem(cacheKey);
          return null;
        }

        return item.data;
      } catch (error) {
        logger.error('Cache get error', { key, error });
        return null;
      }
    });
  }

  public async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    return performanceMonitor.measureAsync('cache_set', async () => {
      try {
        const cacheKey = `cache_${key}`;
        const item: CacheItem<T> = {
          data,
          timestamp: Date.now(),
          expiry: options.expiry || this.defaultExpiry,
        };

        const serialized = JSON.stringify(item);
        const currentSize = await this.getStorageSize();

        if (currentSize + serialized.length > this.maxSize) {
          await this.clearOldItems();
        }

        await AsyncStorage.setItem(cacheKey, serialized);
      } catch (error) {
        logger.error('Cache set error', { key, error });
      }
    });
  }

  public async remove(key: string): Promise<void> {
    try {
      const cacheKey = `cache_${key}`;
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      logger.error('Cache remove error', { key, error });
    }
  }

  public async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      logger.error('Cache clear error', error);
    }
  }

  public async getKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => key.startsWith('cache_')).map(key => key.replace('cache_', ''));
    } catch (error) {
      logger.error('Cache getKeys error', error);
      return [];
    }
  }
}

export const cache = Cache.getInstance();
