import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateTokens } from '@/lib/auth';
import { User, UserRole, UserStatus } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token bulunamadı' },
        { status: 401 }
      );
    }

    // Refresh token'ı doğrula
    const payload = verifyToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Geçersiz refresh token' },
        { status: 401 }
      );
    }

    // Yeni kullanıcı bilgilerini oluştur (gerçek uygulamada veritabanından gelecek)
    const user: User = {
      id: payload.userId,
      email: payload.email,
      name: 'Süper Admin', // Gerçek uygulamada veritabanından gelecek
      role: payload.role,
      status: 'active' as UserStatus,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      restaurantId: payload.restaurantId,
    };

    // Yeni token'lar oluştur
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    const response = NextResponse.json({
      success: true,
      user,
      accessToken,
    });

    // Yeni token'ları cookie'lerde sakla
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    response.cookies.set('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60, // 1 gün
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 gün
    });

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
