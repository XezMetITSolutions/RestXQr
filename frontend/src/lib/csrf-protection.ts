import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken, verifyCSRFToken } from './auth-security';

// CSRF token'ı cookie'de saklama
export function setCSRFToken(response: NextResponse): string {
  const token = generateCSRFToken();
  
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 24 saat
  });
  
  return token;
}

// CSRF token'ı request'ten alma
export function getCSRFToken(request: NextRequest): string | null {
  return request.cookies.get('csrf-token')?.value || null;
}

// CSRF token doğrulama
export function validateCSRFToken(request: NextRequest): boolean {
  const cookieToken = getCSRFToken(request);
  const headerToken = request.headers.get('x-csrf-token');
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  return verifyCSRFToken(headerToken, cookieToken);
}

// CSRF middleware
export function csrfMiddleware(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    // GET, HEAD, OPTIONS istekleri için CSRF kontrolü yapma
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request, ...args);
    }
    
    // CSRF token doğrulama
    if (!validateCSRFToken(request)) {
      return NextResponse.json(
        { error: 'CSRF token validation failed' },
        { status: 403 }
      );
    }
    
    return handler(request, ...args);
  };
}

// CSRF token'ı response'a ekleme
export function addCSRFTokenToResponse(response: NextResponse, token: string): void {
  response.headers.set('x-csrf-token', token);
}

// Güvenli form oluşturma helper'ı
export function createSecureFormData(data: any, csrfToken: string): FormData {
  const formData = new FormData();
  
  // CSRF token ekle
  formData.append('_csrf', csrfToken);
  
  // Diğer verileri ekle
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, String(data[key]));
    }
  });
  
  return formData;
}

// API endpoint'ler için CSRF koruması
export function withCSRFProtection(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // CSRF token doğrulama
      if (!validateCSRFToken(request)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'CSRF token validation failed',
            code: 'CSRF_ERROR'
          },
          { status: 403 }
        );
      }
      
      return await handler(request, ...args);
    } catch (error) {
      console.error('CSRF protection error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  };
}

// Client-side CSRF token alma
export function getCSRFTokenFromClient(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => 
    cookie.trim().startsWith('csrf-token=')
  );
  
  return csrfCookie ? csrfCookie.split('=')[1] : null;
}

// Client-side güvenli fetch
export async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const csrfToken = getCSRFTokenFromClient();
  
  if (!csrfToken) {
    throw new Error('CSRF token not found');
  }
  
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'x-csrf-token': csrfToken,
      'Content-Type': 'application/json'
    }
  };
  
  return fetch(url, secureOptions);
}

// CSRF token yenileme
export async function refreshCSRFToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
    
    return null;
  } catch (error) {
    console.error('CSRF token refresh error:', error);
    return null;
  }
}
