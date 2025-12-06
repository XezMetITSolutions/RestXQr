import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './auth-security';

// Rate limiting konfigürasyonu
interface RateLimitConfig {
  windowMs: number; // Zaman penceresi (ms)
  maxRequests: number; // Maksimum istek sayısı
  skipSuccessfulRequests?: boolean; // Başarılı istekleri atla
  skipFailedRequests?: boolean; // Başarısız istekleri atla
  keyGenerator?: (req: NextRequest) => string; // Özel key generator
}

// Varsayılan rate limit konfigürasyonları
const RATE_LIMITS = {
  // Genel API istekleri
  general: {
    windowMs: 15 * 60 * 1000, // 15 dakika
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  // Authentication istekleri
  auth: {
    windowMs: 15 * 60 * 1000, // 15 dakika
    maxRequests: 5,
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  },
  
  // Arama istekleri
  search: {
    windowMs: 1 * 60 * 1000, // 1 dakika
    maxRequests: 30,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  // Upload istekleri
  upload: {
    windowMs: 60 * 60 * 1000, // 1 saat
    maxRequests: 10,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  // Admin istekleri
  admin: {
    windowMs: 5 * 60 * 1000, // 5 dakika
    maxRequests: 200,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }
};

// IP adresini güvenli şekilde alma
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return '127.0.0.1'; // Fallback
}

// User ID'ye göre rate limiting
function getUserID(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      // JWT token'dan user ID çıkarma (basit implementasyon)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || null;
    } catch {
      return null;
    }
  }
  return null;
}

// Rate limit key generator
function generateRateLimitKey(request: NextRequest, type: string): string {
  const ip = getClientIP(request);
  const userId = getUserID(request);
  
  // User ID varsa onu kullan, yoksa IP kullan
  const identifier = userId || ip;
  
  return `${type}:${identifier}`;
}

// Rate limiting middleware
export function createRateLimit(config: RateLimitConfig) {
  return (handler: Function) => {
    return async (request: NextRequest, ...args: any[]) => {
      const key = config.keyGenerator 
        ? config.keyGenerator(request) 
        : generateRateLimitKey(request, 'general');
      
      // Rate limit kontrolü
      const isAllowed = checkRateLimit(
        key, 
        'general'
      );
      
      if (!isAllowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(config.windowMs / 1000)
          },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(Date.now() + config.windowMs).toISOString()
            }
          }
        );
      }
      
      return handler(request, ...args);
    };
  };
}

// Önceden tanımlanmış rate limit middleware'leri
export const generalRateLimit = createRateLimit(RATE_LIMITS.general);
export const authRateLimit = createRateLimit(RATE_LIMITS.auth);
export const searchRateLimit = createRateLimit(RATE_LIMITS.search);
export const uploadRateLimit = createRateLimit(RATE_LIMITS.upload);
export const adminRateLimit = createRateLimit(RATE_LIMITS.admin);

// Rate limit bilgilerini response'a ekleme
export function addRateLimitHeaders(
  response: NextResponse, 
  config: RateLimitConfig,
  remaining: number
): void {
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(Date.now() + config.windowMs).toISOString());
}

// Rate limit durumu kontrolü
export function getRateLimitStatus(key: string, config: RateLimitConfig): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  // Bu fonksiyon gerçek implementasyonda rate limit store'dan bilgi alır
  // Şimdilik basit bir implementasyon
  return {
    allowed: true,
    remaining: config.maxRequests,
    resetTime: Date.now() + config.windowMs
  };
}

// Rate limit bypass (admin için)
export function bypassRateLimit(request: NextRequest): boolean {
  const userRole = request.headers.get('x-user-role');
  return userRole === 'super_admin';
}

// Rate limit middleware with bypass
export function createRateLimitWithBypass(config: RateLimitConfig) {
  return (handler: Function) => {
    return async (request: NextRequest, ...args: any[]) => {
      // Admin bypass kontrolü
      if (bypassRateLimit(request)) {
        return handler(request, ...args);
      }
      
      return createRateLimit(config)(handler)(request, ...args);
    };
  };
}

// Client-side rate limit bilgisi
export function getRateLimitInfo(response: Response): {
  limit: number;
  remaining: number;
  resetTime: number;
} {
  return {
    limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0'),
    remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
    resetTime: new Date(response.headers.get('X-RateLimit-Reset') || Date.now()).getTime()
  };
}
