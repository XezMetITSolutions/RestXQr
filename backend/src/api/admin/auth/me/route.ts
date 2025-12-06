import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Cookie'den access token'ı al
    const accessToken = request.cookies.get('accessToken')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    // Token'ı doğrula
    const payload = verifyToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Kullanıcı bilgilerini döndür
    const user: User = {
      id: payload.userId,
      email: payload.email,
      name: 'Süper Admin', // Demo için sabit
      role: payload.role,
      status: 'active',
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
    };

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}