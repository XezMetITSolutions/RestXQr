import { useState, useEffect, useRef, useCallback } from 'react';

interface UseMemoizedFetchOptions {
  cacheTime?: number; // Cache süresi (ms)
  staleTime?: number; // Stale süresi (ms)
  retryCount?: number; // Yeniden deneme sayısı
  retryDelay?: number; // Yeniden deneme gecikmesi (ms)
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isStale: boolean;
}

export function useMemoizedFetch<T>(
  url: string,
  options: UseMemoizedFetchOptions = {}
) {
  const {
    cacheTime = 5 * 60 * 1000, // 5 dakika
    staleTime = 1 * 60 * 1000, // 1 dakika
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const retryCountRef = useRef(0);

  const fetchData = useCallback(async () => {
    const cacheKey = url;
    const cached = cacheRef.current.get(cacheKey);
    const now = Date.now();

    // Cache'den veri varsa ve henüz stale değilse
    if (cached && !cached.isStale && (now - cached.timestamp) < staleTime) {
      setData(cached.data);
      return;
    }

    // Cache'den veri varsa ama stale ise, önce cache'den göster
    if (cached && cached.isStale) {
      setData(cached.data);
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache'e kaydet
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: now,
        isStale: false
      });

      setData(result);
      retryCountRef.current = 0;

      // Cache temizleme zamanlayıcısı
      setTimeout(() => {
        cacheRef.current.delete(cacheKey);
      }, cacheTime);

    } catch (err) {
      const error = err as Error;
      setError(error);

      // Yeniden deneme
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData();
        }, retryDelay * retryCountRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, [url, cacheTime, staleTime, retryCount, retryDelay]);

  const invalidateCache = useCallback(() => {
    cacheRef.current.delete(url);
  }, [url]);

  const refetch = useCallback(() => {
    invalidateCache();
    fetchData();
  }, [invalidateCache, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidateCache
  };
}
