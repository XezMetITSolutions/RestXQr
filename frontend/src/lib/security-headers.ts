import { NextRequest, NextResponse } from 'next/server';

// Güvenlik başlıkları konfigürasyonu
const SECURITY_HEADERS = {
  // XSS koruması
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', '),
  
  // Strict Transport Security (HTTPS için)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cross-Origin Policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Güvenlik başlıklarını response'a ekleme
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// CORS konfigürasyonu
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400'
};

// CORS başlıklarını ekleme
export function addCORSHeaders(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Güvenli cookie ayarları
export const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7 // 7 gün
};

// JWT cookie ayarları
export const JWT_COOKIE_OPTIONS = {
  ...SECURE_COOKIE_OPTIONS,
  name: 'accessToken',
  maxAge: 60 * 60 // 1 saat
};

// Refresh token cookie ayarları
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  ...SECURE_COOKIE_OPTIONS,
  name: 'refreshToken',
  maxAge: 60 * 60 * 24 * 7 // 7 gün
};

// CSRF token cookie ayarları
export const CSRF_COOKIE_OPTIONS = {
  ...SECURE_COOKIE_OPTIONS,
  name: 'csrf-token',
  maxAge: 60 * 60 * 24 // 1 gün
};

// Güvenli response oluşturma
export function createSecureResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // Güvenlik başlıklarını ekle
  addSecurityHeaders(response);
  
  // CORS başlıklarını ekle
  addCORSHeaders(response);
  
  return response;
}

// Hata response'u oluşturma
export function createErrorResponse(
  error: string, 
  status: number = 500, 
  code?: string
): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error,
      code,
      timestamp: new Date().toISOString()
    },
    { status }
  );
  
  addSecurityHeaders(response);
  return response;
}

// Güvenli redirect
export function createSecureRedirect(url: string, status: number = 302): NextResponse {
  const response = NextResponse.redirect(url, { status });
  addSecurityHeaders(response);
  return response;
}

// Request güvenlik kontrolü
export function validateRequestSecurity(request: NextRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Host header kontrolü
  const host = request.headers.get('host');
  const allowedHosts = process.env.ALLOWED_HOSTS?.split(',') || ['localhost:3000'];
  
  if (host && !allowedHosts.includes(host)) {
    errors.push('Invalid host header');
  }
  
  // User-Agent kontrolü
  const userAgent = request.headers.get('user-agent');
  if (!userAgent || userAgent.length < 10) {
    errors.push('Invalid user agent');
  }
  
  // Content-Length kontrolü
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
    errors.push('Request too large');
  }
  
  // Referer kontrolü (CSRF için)
  const referer = request.headers.get('referer');
  const origin = request.headers.get('origin');
  
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    if (!referer && !origin) {
      errors.push('Missing referer or origin header');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Güvenlik middleware
export function securityMiddleware(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    // Request güvenlik kontrolü
    const securityCheck = validateRequestSecurity(request);
    
    if (!securityCheck.isValid) {
      return createErrorResponse(
        'Security validation failed',
        400,
        'SECURITY_ERROR'
      );
    }
    
    try {
      const response = await handler(request, ...args);
      
      // Response'a güvenlik başlıklarını ekle
      if (response instanceof NextResponse) {
        addSecurityHeaders(response);
      }
      
      return response;
    } catch (error) {
      console.error('Security middleware error:', error);
      return createErrorResponse(
        'Internal server error',
        500,
        'INTERNAL_ERROR'
      );
    }
  };
}

// API endpoint güvenlik wrapper'ı
export function withSecurity(handler: Function) {
  return securityMiddleware(handler);
}
