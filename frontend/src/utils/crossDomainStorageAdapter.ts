/**
 * Zustand Persist için Cross-Domain Storage Adapter
 * Async storage'ı sync gibi kullanmak için cache layer ile
 */

import { getCrossDomainStorage } from './crossDomainStorage';
import { StateStorage } from 'zustand/middleware';

class CrossDomainStorageAdapter implements StateStorage {
  private storage = getCrossDomainStorage();
  private cache: Map<string, string> = new Map();
  private initialized = false;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize() {
    if (typeof window === 'undefined') return;
    
    try {
      // Tüm anahtarları al ve cache'e yükle
      const keys = await this.storage.getAllKeys();
      
      for (const key of keys) {
        const value = await this.storage.getItem(key);
        if (value) {
          this.cache.set(key, value);
        }
      }
      
      this.initialized = true;
      console.log('Cross-domain storage initialized with', keys.length, 'keys');
    } catch (error) {
      console.error('Failed to initialize cross-domain storage:', error);
      this.initialized = true; // Fallback to local storage
    }
  }

  getItem(key: string): string | null {
    // Cache'den oku (synchronous)
    const cached = this.cache.get(key);
    
    if (cached !== undefined) {
      return cached;
    }

    // Cache miss - localStorage'dan oku (fallback)
    if (typeof window !== 'undefined') {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          this.cache.set(key, value);
        }
        return value;
      } catch (error) {
        console.error('localStorage getItem error:', error);
      }
    }
    
    return null;
  }

  setItem(key: string, value: string): void {
    // Cache'e yaz (synchronous)
    this.cache.set(key, value);

    // Background'da cross-domain storage'a yaz (async)
    this.storage.setItem(key, value).catch(error => {
      console.error('Cross-domain storage setItem error:', error);
      // Fallback: localStorage'a yaz
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.error('localStorage setItem fallback error:', e);
        }
      }
    });

    // Ayrıca localStorage'a da yaz (immediate fallback)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('localStorage setItem error:', error);
      }
    }
  }

  removeItem(key: string): void {
    // Cache'den kaldır
    this.cache.delete(key);

    // Background'da cross-domain storage'dan kaldır
    this.storage.removeItem(key).catch(error => {
      console.error('Cross-domain storage removeItem error:', error);
    });

    // localStorage'dan kaldır
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('localStorage removeItem error:', error);
      }
    }
  }
}

// Singleton instance
let adapterInstance: CrossDomainStorageAdapter | null = null;

export function getCrossDomainStorageAdapter(): StateStorage {
  if (!adapterInstance) {
    adapterInstance = new CrossDomainStorageAdapter();
  }
  return adapterInstance;
}

export default CrossDomainStorageAdapter;
