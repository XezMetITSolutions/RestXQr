import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyPassword, generateTokens, isValidEmail, isStrongPassword } from '@/lib/auth';
import { User, UserRole, UserStatus } from '@/types';
import { COOKIE_CONFIG } from '@/config/env';

// Demo admin kullanıcıları (gerçek uygulamada veritabanından gelecek)
const DEMO_ADMINS = [
  {
    id: 'admin-1',
    email: 'admin@masapp.com',
    password: '$2b$12$edZ0/kaYeqOg2DXwUUjQZOFopMWTWt..Ao4gSFT/6P9bM7EzbauG.', // admin123
    name: 'Süper Admin',
    role: 'super_admin' as UserRole,
    status: 'active' as UserStatus,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: 'admin-2',
    email: 'support@masapp.com',
    password: '$2b$12$edZ0/kaYeqOg2DXwUUjQZOFopMWTWt..Ao4gSFT/6P9bM7EzbauG.', // admin123
    name: 'Destek Admin',
    role: 'super_admin' as UserRole,
    status: 'active' as UserStatus,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  }
];

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();
    
    console.log('Login attempt for:', email);

    // Input validasyonu
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const admin = DEMO_ADMINS.find(a => a.email === email);
    if (!admin) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Şifre doğrulama
    const isPasswordValid = await verifyPassword(password, admin.password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Kullanıcı durumu kontrolü
    if (admin.status !== 'active') {
      return NextResponse.json(
        { error: 'Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.' },
        { status: 403 }
      );
    }

    // JWT token oluştur
    const user: User = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      status: admin.status,
      createdAt: admin.createdAt,
      lastLogin: new Date(),
    };

    const { accessToken, refreshToken } = generateTokens(user);

    // Response oluştur
    const response = NextResponse.json({
      success: true,
      user,
      accessToken,
      refreshToken,
      expiresIn: rememberMe ? '7d' : '24h'
    });

    // HTTP-only cookie'lerde token'ları sakla
    const cookieOptions = COOKIE_CONFIG;

    response.cookies.set('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // 7 gün veya 1 gün
    });

    response.cookies.set('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 gün
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
