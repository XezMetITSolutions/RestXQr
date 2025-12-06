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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Demo: Bildirim listesi
    // Gerçek uygulamada burada veritabanı sorgusu yapılacak
    const notifications = [
      {
        id: 'notif-1',
        type: 'warning',
        priority: 'high',
        title: 'Ödeme Hatası',
        message: 'Pizza Palace işletmesinde ödeme hatası oluştu. Lütfen kontrol edin.',
        recipient: {
          type: 'admin',
          name: 'Admin Panel'
        },
        channel: 'in_app',
        status: 'read',
        sentAt: '2024-03-15T10:30:00Z',
        readAt: '2024-03-15T10:35:00Z',
        createdAt: '2024-03-15T10:30:00Z',
        createdBy: 'System'
      },
      // ... diğer bildirimler
    ];

    // Filtreleme
    let filteredNotifications = notifications;
    if (type && type !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }
    if (status && status !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.status === status);
    }
    if (priority && priority !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
    }

    // Sayfalama
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedNotifications,
      pagination: {
        page,
        limit,
        total: filteredNotifications.length,
        totalPages: Math.ceil(filteredNotifications.length / limit)
      }
    });

  } catch (error) {
    console.error('Notifications list error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const {
      type,
      priority,
      title,
      message,
      recipientType,
      recipientId,
      recipientName,
      channel,
      scheduledAt,
      immediate
    } = await request.json();

    // Validasyon
    if (!type || !priority || !title || !message || !recipientType || !channel) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    // Demo: Bildirim oluşturma
    // Gerçek uygulamada burada:
    // 1. Bildirim veritabanına kaydedilir
    // 2. Zamanlanmış gönderim için job oluşturulur
    // 3. Anında gönderim için kuyruğa eklenir
    // 4. Alıcı listesi oluşturulur

    const notification = {
      id: `notif-${Date.now()}`,
      type,
      priority,
      title,
      message,
      recipient: {
        type: recipientType,
        id: recipientId || null,
        name: recipientName || 'Tüm Kullanıcılar'
      },
      channel,
      status: immediate ? 'pending' : 'scheduled',
      scheduledAt: immediate ? null : scheduledAt,
      createdAt: new Date().toISOString(),
      createdBy: payload.email
    };

    console.log('Notification created:', notification);

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Bildirim başarıyla oluşturuldu'
    });

  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
