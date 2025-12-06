import { useState, useEffect, useCallback } from 'react';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  storage?: 'localStorage' | 'sessionStorage' | 'memory';
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Custom cache hook with TTL support
 */
export function useCache<T>(
  key: string,
  options: CacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, storage = 'localStorage' } = options; // Default 5 minutes
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get storage instance
  const getStorage = () => {
    if (typeof window === 'undefined') return null;
    
    switch (storage) {
      case 'localStorage':
        return localStorage;
      case 'sessionStorage':
        return sessionStorage;
      default:
        return null;
    }
  };

  // Get data from cache
  const getCachedData = useCallback((): T | null => {
    const storageInstance = getStorage();
    if (!storageInstance) return null;

    try {
      const cached = storageInstance.getItem(key);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        storageInstance.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }, [key, storage]);

  // Set data to cache
  const setCachedData = useCallback((newData: T) => {
    const storageInstance = getStorage();
    if (!storageInstance) return;

    try {
      const cacheItem: CacheItem<T> = {
        data: newData,
        timestamp: Date.now(),
        ttl,
      };

      storageInstance.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }, [key, ttl, storage]);

  // Load data from cache or fetch function
  const loadData = useCallback(async (fetchFn: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get from cache first
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        setIsLoading(false);
        return cachedData;
      }

      // Fetch new data
      const newData = await fetchFn();
      setData(newData);
      setCachedData(newData);
      setIsLoading(false);
      return newData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, [getCachedData, setCachedData]);

  // Clear cache
  const clearCache = useCallback(() => {
    const storageInstance = getStorage();
    if (storageInstance) {
      storageInstance.removeItem(key);
    }
    setData(null);
  }, [key, storage]);

  // Initialize with cached data
  useEffect(() => {
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
    }
  }, [getCachedData]);

  return {
    data,
    isLoading,
    error,
    loadData,
    clearCache,
    refresh: () => {
      clearCache();
      return loadData;
    },
  };
}

/**
 * Hook for managing multiple cache entries
 */
export function useCacheManager() {
  const clearAllCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Clear localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith('cache_')) {
        sessionStorage.removeItem(key);
      }
    });
  }, []);

  const getCacheStats = useCallback(() => {
    if (typeof window === 'undefined') return { localStorage: 0, sessionStorage: 0 };

    const localStorageCount = Object.keys(localStorage)
      .filter(key => key.startsWith('cache_')).length;
    
    const sessionStorageCount = Object.keys(sessionStorage)
      .filter(key => key.startsWith('cache_')).length;

    return {
      localStorage: localStorageCount,
      sessionStorage: sessionStorageCount,
    };
  }, []);

  return {
    clearAllCache,
    getCacheStats,
  };
}
