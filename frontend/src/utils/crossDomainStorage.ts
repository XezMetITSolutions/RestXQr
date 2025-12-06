/**
 * Cross-Domain localStorage Utility
 * Tüm subdomain'lerin aynı localStorage'a erişmesini sağlar
 */

type StorageMethod = 'getItem' | 'setItem' | 'removeItem' | 'clear' | 'getAllKeys';

interface StorageRequest {
  method: StorageMethod;
  key?: string;
  value?: string;
  requestId: string;
}

interface StorageResponse {
  requestId: string;
  result: any;
  error: string | null;
}

class CrossDomainStorage {
  private iframe: HTMLIFrameElement | null = null;
  private isReady = false;
  private readyPromise: Promise<void>;
  private pendingRequests: Map<string, { resolve: (value: any) => void; reject: (reason: any) => void }> = new Map();
  private bridgeUrl: string;

  constructor() {
    // Ana domain'deki bridge URL'i
    this.bridgeUrl = this.getBridgeUrl();
    this.readyPromise = this.initialize();
  }

  private getBridgeUrl(): string {
    if (typeof window === 'undefined') return '';
    
    const hostname = window.location.hostname;
    
    // Localhost ise
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${window.location.protocol}//${hostname}:${window.location.port}/storage-bridge.html`;
    }
    
    // Production - Ana domain'i bul
    const parts = hostname.split('.');
    let baseDomain = hostname;
    
    // Subdomain varsa ana domain'i al (guzellestir.com)
    if (parts.length > 2) {
      baseDomain = parts.slice(-2).join('.');
    }
    
    return `https://${baseDomain}/storage-bridge.html`;
  }

  private async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    return new Promise((resolve) => {
      // Iframe oluştur
      this.iframe = document.createElement('iframe');
      this.iframe.style.display = 'none';
      this.iframe.src = this.bridgeUrl;

      // Message listener
      window.addEventListener('message', this.handleMessage.bind(this));

      // Iframe yüklendiğinde
      this.iframe.onload = () => {
        // Bridge'in ready mesajını bekle
        const checkReady = (event: MessageEvent) => {
          if (event.data && event.data.ready) {
            this.isReady = true;
            window.removeEventListener('message', checkReady);
            resolve();
          }
        };
        window.addEventListener('message', checkReady);
        
        // Timeout ile fallback
        setTimeout(() => {
          if (!this.isReady) {
            console.warn('Storage bridge timeout, falling back to local storage');
            this.isReady = true;
            resolve();
          }
        }, 3000);
      };

      document.body.appendChild(this.iframe);
    });
  }

  private handleMessage(event: MessageEvent) {
    const data = event.data as StorageResponse;
    
    if (!data.requestId) return;

    const pending = this.pendingRequests.get(data.requestId);
    if (!pending) return;

    this.pendingRequests.delete(data.requestId);

    if (data.error) {
      pending.reject(new Error(data.error));
    } else {
      pending.resolve(data.result);
    }
  }

  private async sendRequest(method: StorageMethod, key?: string, value?: string): Promise<any> {
    await this.readyPromise;

    // Bridge yoksa veya hazır değilse fallback to localStorage
    if (!this.iframe || !this.isReady) {
      return this.fallbackToLocalStorage(method, key, value);
    }

    return new Promise((resolve, reject) => {
      const requestId = `${Date.now()}_${Math.random()}`;
      
      this.pendingRequests.set(requestId, { resolve, reject });

      const request: StorageRequest = {
        method,
        key,
        value,
        requestId
      };

      this.iframe!.contentWindow!.postMessage(request, '*');

      // Timeout
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          // Fallback to localStorage on timeout
          resolve(this.fallbackToLocalStorage(method, key, value));
        }
      }, 5000);
    });
  }

  private fallbackToLocalStorage(method: StorageMethod, key?: string, value?: string): any {
    if (typeof window === 'undefined') return null;

    switch (method) {
      case 'getItem':
        return key ? localStorage.getItem(key) : null;
      case 'setItem':
        if (key && value !== undefined) {
          localStorage.setItem(key, value);
        }
        return { success: true };
      case 'removeItem':
        if (key) localStorage.removeItem(key);
        return { success: true };
      case 'clear':
        localStorage.clear();
        return { success: true };
      case 'getAllKeys':
        return Object.keys(localStorage);
      default:
        return null;
    }
  }

  async getItem(key: string): Promise<string | null> {
    return this.sendRequest('getItem', key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.sendRequest('setItem', key, value);
  }

  async removeItem(key: string): Promise<void> {
    await this.sendRequest('removeItem', key);
  }

  async clear(): Promise<void> {
    await this.sendRequest('clear');
  }

  async getAllKeys(): Promise<string[]> {
    return this.sendRequest('getAllKeys');
  }
}

// Singleton instance
let storageInstance: CrossDomainStorage | null = null;

export function getCrossDomainStorage(): CrossDomainStorage {
  if (!storageInstance) {
    storageInstance = new CrossDomainStorage();
  }
  return storageInstance;
}

export default CrossDomainStorage;
