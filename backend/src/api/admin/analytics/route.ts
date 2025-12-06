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
    const dateRange = searchParams.get('dateRange') || '30d';
    const metric = searchParams.get('metric') || 'overview';

    // Demo: Analitik verileri
    // Gerçek uygulamada burada veritabanı sorguları yapılacak
    const analyticsData = {
      overview: {
        totalRestaurants: 1247,
        activeRestaurants: 1189,
        totalUsers: 3421,
        totalRevenue: 2847390,
        monthlyRevenue: 189650,
        growthRate: 12.5
      },
      revenue: {
        daily: [
          { date: '2024-03-01', amount: 6234 },
          { date: '2024-03-02', amount: 7891 },
          { date: '2024-03-03', amount: 9123 },
          { date: '2024-03-04', amount: 8456 },
          { date: '2024-03-05', amount: 7234 },
          { date: '2024-03-06', amount: 6789 },
          { date: '2024-03-07', amount: 8123 },
          { date: '2024-03-08', amount: 9456 },
          { date: '2024-03-09', amount: 7234 },
          { date: '2024-03-10', amount: 6789 },
          { date: '2024-03-11', amount: 8123 },
          { date: '2024-03-12', amount: 9456 },
          { date: '2024-03-13', amount: 7234 },
          { date: '2024-03-14', amount: 6789 },
          { date: '2024-03-15', amount: 8123 }
        ],
        monthly: [
          { month: 'Ocak', amount: 156789 },
          { month: 'Şubat', amount: 178234 },
          { month: 'Mart', amount: 189650 }
        ],
        byPlan: [
          { plan: 'Temel', amount: 456789, count: 234 },
          { plan: 'Pro', amount: 1234567, count: 567 },
          { plan: 'Premium', amount: 1154034, count: 388 }
        ]
      },
      restaurants: {
        byStatus: [
          { status: 'Aktif', count: 1189 },
          { status: 'Beklemede', count: 23 },
          { status: 'Askıya Alınmış', count: 12 },
          { status: 'İptal Edilmiş', count: 23 }
        ],
        byPlan: [
          { plan: 'Temel', count: 234 },
          { plan: 'Pro', count: 567 },
          { plan: 'Premium', count: 388 }
        ],
        byLocation: [
          { location: 'İstanbul', count: 456 },
          { location: 'Ankara', count: 234 },
          { location: 'İzmir', count: 189 },
          { location: 'Bursa', count: 123 },
          { location: 'Antalya', count: 98 },
          { location: 'Diğer', count: 147 }
        ],
        topPerforming: [
          { name: 'Pizza Palace', revenue: 45678, orders: 1234 },
          { name: 'Burger King', revenue: 38945, orders: 987 },
          { name: 'Sushi Master', revenue: 34567, orders: 756 },
          { name: 'Coffee Corner', revenue: 28934, orders: 654 },
          { name: 'Steak House', revenue: 25678, orders: 543 }
        ]
      },
      users: {
        byRole: [
          { role: 'Müdür', count: 456 },
          { role: 'Personel', count: 1234 },
          { role: 'Kasa', count: 567 },
          { role: 'Garson', count: 890 },
          { role: 'Mutfak', count: 274 }
        ],
        byStatus: [
          { status: 'Aktif', count: 3123 },
          { status: 'Beklemede', count: 45 },
          { status: 'Askıya Alınmış', count: 23 },
          { status: 'İptal Edilmiş', count: 230 }
        ],
        newRegistrations: [
          { date: '2024-03-01', count: 23 },
          { date: '2024-03-02', count: 34 },
          { date: '2024-03-03', count: 28 },
          { date: '2024-03-04', count: 41 },
          { date: '2024-03-05', count: 35 },
          { date: '2024-03-06', count: 29 },
          { date: '2024-03-07', count: 38 },
          { date: '2024-03-08', count: 42 },
          { date: '2024-03-09', count: 36 },
          { date: '2024-03-10', count: 31 },
          { date: '2024-03-11', count: 39 },
          { date: '2024-03-12', count: 44 },
          { date: '2024-03-13', count: 37 },
          { date: '2024-03-14', count: 33 },
          { date: '2024-03-15', count: 40 }
        ],
        activeUsers: [
          { date: '2024-03-01', count: 1234 },
          { date: '2024-03-02', count: 1345 },
          { date: '2024-03-03', count: 1289 },
          { date: '2024-03-04', count: 1456 },
          { date: '2024-03-05', count: 1389 },
          { date: '2024-03-06', count: 1323 },
          { date: '2024-03-07', count: 1467 },
          { date: '2024-03-08', count: 1523 },
          { date: '2024-03-09', count: 1456 },
          { date: '2024-03-10', count: 1389 },
          { date: '2024-03-11', count: 1467 },
          { date: '2024-03-12', count: 1523 },
          { date: '2024-03-13', count: 1456 },
          { date: '2024-03-14', count: 1389 },
          { date: '2024-03-15', count: 1467 }
        ]
      },
      qrCodes: {
        totalScans: 456789,
        dailyScans: [
          { date: '2024-03-01', scans: 1234 },
          { date: '2024-03-02', scans: 1456 },
          { date: '2024-03-03', scans: 1389 },
          { date: '2024-03-04', scans: 1567 },
          { date: '2024-03-05', scans: 1498 },
          { date: '2024-03-06', scans: 1423 },
          { date: '2024-03-07', scans: 1589 },
          { date: '2024-03-08', scans: 1645 },
          { date: '2024-03-09', scans: 1578 },
          { date: '2024-03-10', scans: 1509 },
          { date: '2024-03-11', scans: 1598 },
          { date: '2024-03-12', scans: 1654 },
          { date: '2024-03-13', scans: 1587 },
          { date: '2024-03-14', scans: 1512 },
          { date: '2024-03-15', scans: 1598 }
        ],
        topScanned: [
          { restaurant: 'Pizza Palace', scans: 45678 },
          { restaurant: 'Burger King', scans: 38945 },
          { restaurant: 'Sushi Master', scans: 34567 },
          { restaurant: 'Coffee Corner', scans: 28934 },
          { restaurant: 'Steak House', scans: 25678 }
        ],
        byDevice: [
          { device: 'Mobil', count: 345678 },
          { device: 'Masaüstü', count: 111111 }
        ]
      },
      menus: {
        totalMenus: 1247,
        totalItems: 15678,
        averageItemsPerMenu: 12.6,
        mostPopularItems: [
          { name: 'Margherita Pizza', orders: 1234 },
          { name: 'Cheeseburger', orders: 987 },
          { name: 'California Roll', orders: 756 },
          { name: 'Cappuccino', orders: 654 },
          { name: 'Ribeye Steak', orders: 543 }
        ],
        byCategory: [
          { category: 'Pizza', count: 2345 },
          { category: 'Burger', count: 1890 },
          { category: 'Sushi', count: 1234 },
          { category: 'Kahve', count: 987 },
          { category: 'Et', count: 756 },
          { category: 'Salata', count: 543 },
          { category: 'Tatlı', count: 432 },
          { category: 'İçecek', count: 321 }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: analyticsData[metric as keyof typeof analyticsData] || analyticsData.overview,
      dateRange,
      metric
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
