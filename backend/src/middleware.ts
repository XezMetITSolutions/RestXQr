import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Admin sayfalarını koru - Login kontrolü kaldırıldı
  if (pathname.startsWith('/admin')) {
    // Admin sayfalarına direkt erişim sağla
    return NextResponse.next();
  }
  
  // Business sayfalarını koru
  if (pathname.startsWith('/business')) {
    // Login sayfası hariç
    if (pathname === '/isletme-giris') {
      return NextResponse.next();
    }
    
    // Token kontrolü
    const accessToken = request.cookies.get('accessToken')?.value;
    
    if (!accessToken) {
      return NextResponse.redirect(new URL('/isletme-giris', request.url));
    }
    
    // Demo token kontrolü (business paneli için)
    if (accessToken === 'demo-access-token') {
      return NextResponse.next();
    }
    
    // Token doğrulama
    const payload = verifyToken(accessToken);
    if (!payload) {
      console.log('Business token verification failed for route:', pathname);
      return NextResponse.redirect(new URL('/isletme-giris', request.url));
    }
    
    // Business rolü kontrolü
    if (!['restaurant_owner', 'restaurant_admin', 'waiter', 'kitchen', 'cashier'].includes(payload.role)) {
      return NextResponse.redirect(new URL('/isletme-giris', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/business/:path*',
  ],
};
