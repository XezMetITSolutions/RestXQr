/**
 * Merkezi Storage Konfigürasyonu
 * Tüm Zustand store'lar için cross-domain storage
 */

import { createJSONStorage } from 'zustand/middleware';
import { getCrossDomainStorageAdapter } from '@/utils/crossDomainStorageAdapter';

/**
 * Cross-domain localStorage ile çalışan storage konfigürasyonu
 * Tüm subdomain'ler aynı localStorage'a erişir
 */
export const crossDomainStorage = createJSONStorage(() => getCrossDomainStorageAdapter());

/**
 * Standart localStorage (fallback)
 */
export const standardStorage = createJSONStorage(() => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
});

/**
 * Store'lar için persist options helper
 */
export function createPersistOptions(name: string, useCrossDomain = true) {
  return {
    name,
    storage: useCrossDomain ? crossDomainStorage : standardStorage,
  };
}

export default {
  crossDomainStorage,
  standardStorage,
  createPersistOptions,
};
