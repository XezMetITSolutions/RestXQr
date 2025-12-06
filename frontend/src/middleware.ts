import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { languages, fallbackLng } from './i18n/settings';

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore locales are readonly
  const locales: string[] = languages;
  const languagesHeader = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return match(languagesHeader, locales, fallbackLng);
  } catch (e) {
    return fallbackLng;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Subdomain routing kontrolü
  const subdomain = hostname.split('.')[0];

  // Ana domain'ler (subdomain routing yapılmayacak)  
  const mainDomains = ['localhost', 'www', 'restxqr'];

  // Query parameter'dan subdomain bilgisi al (geçici çözüm)
  const querySubdomain = searchParams.get('subdomain');

  // Debug - geçici
  if (pathname.startsWith('/menu/masa/')) {
    console.log('Menu Debug:', {
      pathname,
      hostname,
      subdomain,
      mainDomainsCheck: mainDomains.includes(subdomain),
      hasSubdomain: !mainDomains.includes(subdomain) && hostname.includes('.'),
      querySubdomain
    });
  }

  // Eğer subdomain varsa ve ana domain değilse VEYA query parameter varsa
  // Ama business sayfaları için subdomain routing yapma (sonsuz döngü önleme)
  if (((!mainDomains.includes(subdomain) && hostname.includes('.')) || querySubdomain) && !pathname.startsWith('/business')) {
    // Subdomain-based routing
    if (pathname === '/login') {
      return NextResponse.rewrite(new URL('/isletme-giris', request.url));
    }
    if (pathname === '/mutfak') {
      return NextResponse.rewrite(new URL('/business/kitchen', request.url));
    }
    if (pathname === '/garson') {
      return NextResponse.rewrite(new URL('/business/waiter', request.url));
    }
    if (pathname === '/kasa') {
      return NextResponse.rewrite(new URL('/business/cashier', request.url));
    }

    // Menu routing - /menu/masa/[table] → /menu?restaurant=subdomain&table=[table]
    if (pathname.startsWith('/menu/masa/')) {
      const tableNumber = pathname.split('/')[3];
      const url = new URL('/menu', request.url);
      url.searchParams.set('restaurant', subdomain || querySubdomain || 'demo');
      url.searchParams.set('table', tableNumber !== undefined ? tableNumber : '1');

      // Mevcut token'ı koru
      const token = searchParams.searchParams.get('token');
      if (token) {
        url.searchParams.set('token', token);
      }

      return NextResponse.rewrite(url);
    }

    // Subdomain ana sayfası - landing page göster
    // Artık direkt menüye yönlendirme yok, ana sayfa gösterilecek
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = languages.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Exclude API, static files, and existing routes that shouldn't be localized if any
    if (
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.includes('.') // files
    ) {
      return NextResponse.next();
    }

    const locale = getLocale(request);

    // e.g. incoming request is /products
    // The new URL is now /en/products
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!api|_next/static|_next/image|favicon.ico|business).*)',
  ],
};