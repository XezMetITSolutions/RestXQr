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
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Demo: Sistem ayarları
    // Gerçek uygulamada burada veritabanı sorgusu yapılacak
    const settings = [
      {
        id: 'site-name',
        category: 'general',
        key: 'SITE_NAME',
        name: 'Site Adı',
        description: 'Web sitesinin genel adı',
        value: 'restXqr Admin Panel',
        type: 'text',
        required: true,
        sensitive: false,
        lastModified: '2024-03-15T10:30:00Z',
        modifiedBy: 'Admin User'
      },
      {
        id: 'site-url',
        category: 'general',
        key: 'SITE_URL',
        name: 'Site URL',
        description: 'Web sitesinin ana URL adresi',
        value: 'https://admin.masapp.com',
        type: 'text',
        required: true,
        sensitive: false,
        lastModified: '2024-03-15T10:30:00Z',
        modifiedBy: 'Admin User'
      },
      {
        id: 'maintenance-mode',
        category: 'general',
        key: 'MAINTENANCE_MODE',
        name: 'Bakım Modu',
        description: 'Sistem bakım modunda mı?',
        value: false,
        type: 'boolean',
        required: false,
        sensitive: false,
        lastModified: '2024-03-15T10:30:00Z',
        modifiedBy: 'Admin User'
      },
      {
        id: 'session-timeout',
        category: 'security',
        key: 'SESSION_TIMEOUT',
        name: 'Oturum Zaman Aşımı',
        description: 'Kullanıcı oturumunun süresi (dakika)',
        value: 30,
        type: 'number',
        required: true,
        sensitive: false,
        lastModified: '2024-03-15T10:30:00Z',
        modifiedBy: 'Admin User'
      },
      {
        id: 'max-login-attempts',
        category: 'security',
        key: 'MAX_LOGIN_ATTEMPTS',
        name: 'Maksimum Giriş Denemesi',
        description: 'Hesap kilitleme öncesi maksimum deneme sayısı',
        value: 5,
        type: 'number',
        required: true,
        sensitive: false,
        lastModified: '2024-03-15T10:30:00Z',
        modifiedBy: 'Admin User'
      },
      {
        id: 'jwt-secret',
        category: 'security',
        key: 'JWT_SECRET',
        name: 'JWT Gizli Anahtarı',
        description: 'JWT token imzalama için kullanılan gizli anahtar',
        value: '••••••••••••••••',
        type: 'password',
        required: true,
        sensitive: true,
        lastModified: '2024-03-15T10:30:00Z',
        modifiedBy: 'Admin User'
      },
      {
        id: 'smtp-host',
        category: 'email',
        key: 'SMTP_HOST',
        name: 'SMTP Sunucu',
        description: 'Email gönderimi için SMTP sunucu adresi',
        value: 'smtp.gmail.com',
        type: 'text',
        required: true,
        sensitive: false,
        lastModified: '2024-03-15T10:30:00Z',
        modifiedBy: 'Admin User'
      },
      {
        id: 'smtp-port',
        category: 'email',
        key: 'SMTP_PORT',
        name: 'SMTP Port',
        description: 'SMTP sunucu port numarası',
        value: 587,
        type: 'number',
        required: true,
        sensitive: false,
        lastModified: '2024-03-15T10:30:00Z',
        modifiedBy: 'Admin User'
      },
      {
        id: 'stripe-secret-key',
        category: 'payment',
        key: 'STRIPE_SECRET_KEY',
        name: 'Stripe Gizli Anahtarı',
        description: 'Stripe ödeme sistemi gizli anahtarı',
        value: '••••••••••••••••',
        type: 'password',
        required: true,
        sensitive: true,
        lastModified: '2024-03-15T10:30:00Z',
        modifiedBy: 'Admin User'
      },
      {
        id: 'notification-enabled',
        category: 'notification',
        key: 'NOTIFICATION_ENABLED',
        name: 'Bildirim Sistemi',
        description: 'Sistem bildirimleri aktif mi?',
        value: true,
        type: 'boolean',
        required: false,
        sensitive: false,
        lastModified: '2024-03-15T10:30:00Z',
        modifiedBy: 'Admin User'
      }
    ];

    // Filtreleme
    let filteredSettings = settings;
    if (category && category !== 'all') {
      filteredSettings = filteredSettings.filter(s => s.category === category);
    }
    if (search) {
      filteredSettings = filteredSettings.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.key.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredSettings
    });

  } catch (error) {
    console.error('System settings error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { settingId, value } = await request.json();

    if (!settingId || value === undefined) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    // Demo: Ayar güncelleme
    // Gerçek uygulamada burada:
    // 1. Ayar veritabanında güncellenir
    // 2. Değişiklik logu kaydedilir
    // 3. Gerekirse sistem yeniden başlatılır
    // 4. Diğer servislere bildirim gönderilir

    console.log('Setting updated:', settingId, value);

    return NextResponse.json({
      success: true,
      message: 'Ayar başarıyla güncellendi',
      data: {
        settingId,
        value,
        updatedAt: new Date().toISOString(),
        updatedBy: payload.email
      }
    });

  } catch (error) {
    console.error('Update setting error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
