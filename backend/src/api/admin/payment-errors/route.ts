import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const errorType = searchParams.get('errorType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Demo: Ödeme hataları listesi
    // Gerçek uygulamada burada veritabanı sorgusu yapılacak
    const paymentErrors = [
      {
        id: 'err-1',
        subscriptionId: 'sub-2',
        restaurantId: 'rest-2',
        restaurantName: 'Burger King',
        owner: 'Mehmet Demir',
        email: 'mehmet@burgerking.com',
        plan: 'Pro',
        amount: 3490,
        errorCode: 'card_declined',
        errorMessage: 'Kart reddedildi - Yetersiz bakiye',
        errorType: 'insufficient_funds',
        status: 'pending',
        attemptCount: 3,
        lastAttempt: '2024-03-03T14:20:00Z',
        nextRetry: '2024-03-05T10:00:00Z'
      },
      // ... diğer hatalar
    ];

    // Filtreleme
    let filteredErrors = paymentErrors;
    if (status && status !== 'all') {
      filteredErrors = filteredErrors.filter(e => e.status === status);
    }
    if (errorType && errorType !== 'all') {
      filteredErrors = filteredErrors.filter(e => e.errorType === errorType);
    }

    // Sayfalama
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedErrors = filteredErrors.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedErrors,
      pagination: {
        page,
        limit,
        total: filteredErrors.length,
        totalPages: Math.ceil(filteredErrors.length / limit)
      }
    });

  } catch (error) {
    console.error('Payment errors list error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
