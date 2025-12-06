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
    const plan = searchParams.get('plan');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Demo: Abonelik listesi
    // Gerçek uygulamada burada veritabanı sorgusu yapılacak
    const subscriptions = [
      {
        id: 'sub-1',
        restaurantId: 'rest-1',
        restaurantName: 'Pizza Palace',
        owner: 'Ahmet Yılmaz',
        email: 'ahmet@pizzapalace.com',
        plan: 'premium',
        status: 'active',
        amount: 4980,
        nextBillingDate: '2024-04-15',
        totalRevenue: 14940
      },
      // ... diğer abonelikler
    ];

    // Filtreleme
    let filteredSubscriptions = subscriptions;
    if (status && status !== 'all') {
      filteredSubscriptions = filteredSubscriptions.filter(s => s.status === status);
    }
    if (plan && plan !== 'all') {
      filteredSubscriptions = filteredSubscriptions.filter(s => s.plan === plan);
    }

    // Sayfalama
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedSubscriptions,
      pagination: {
        page,
        limit,
        total: filteredSubscriptions.length,
        totalPages: Math.ceil(filteredSubscriptions.length / limit)
      }
    });

  } catch (error) {
    console.error('Subscriptions list error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
