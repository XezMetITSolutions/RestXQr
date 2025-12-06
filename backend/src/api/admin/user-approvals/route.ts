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
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Demo: Kullanıcı onayları listesi
    // Gerçek uygulamada burada veritabanı sorgusu yapılacak
    const userApprovals = [
      {
        id: 'app-1',
        userId: 'user-1',
        restaurantId: 'rest-1',
        restaurantName: 'Pizza Palace',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet.yilmaz@email.com',
        role: 'manager',
        position: 'Restoran Müdürü',
        status: 'pending',
        appliedAt: '2024-03-15T10:30:00Z',
        experience: '5 yıl restoran yönetimi deneyimi',
        expectedSalary: 15000
      },
      // ... diğer başvurular
    ];

    // Filtreleme
    let filteredApprovals = userApprovals;
    if (status && status !== 'all') {
      filteredApprovals = filteredApprovals.filter(a => a.status === status);
    }
    if (role && role !== 'all') {
      filteredApprovals = filteredApprovals.filter(a => a.role === role);
    }

    // Sayfalama
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedApprovals = filteredApprovals.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedApprovals,
      pagination: {
        page,
        limit,
        total: filteredApprovals.length,
        totalPages: Math.ceil(filteredApprovals.length / limit)
      }
    });

  } catch (error) {
    console.error('User approvals list error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
