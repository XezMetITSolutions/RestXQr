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

    // Demo: Kullanıcı rolleri
    // Gerçek uygulamada burada veritabanı sorgusu yapılacak
    const roles = [
      {
        id: 'super-admin',
        name: 'Süper Admin',
        description: 'Tüm sistem yetkilerine sahip kullanıcı',
        permissions: ['all'],
        userCount: 2,
        createdAt: '2024-01-01T00:00:00Z',
        isActive: true
      },
      {
        id: 'admin',
        name: 'Admin',
        description: 'Sınırlı admin yetkilerine sahip kullanıcı',
        permissions: ['users.read', 'restaurants.read', 'analytics.read'],
        userCount: 5,
        createdAt: '2024-01-01T00:00:00Z',
        isActive: true
      },
      {
        id: 'moderator',
        name: 'Moderatör',
        description: 'İçerik moderasyon yetkilerine sahip kullanıcı',
        permissions: ['restaurants.approve', 'users.approve'],
        userCount: 8,
        createdAt: '2024-01-01T00:00:00Z',
        isActive: true
      },
      {
        id: 'support',
        name: 'Destek',
        description: 'Müşteri destek yetkilerine sahip kullanıcı',
        permissions: ['users.read', 'tickets.read', 'tickets.update'],
        userCount: 12,
        createdAt: '2024-01-01T00:00:00Z',
        isActive: true
      }
    ];

    return NextResponse.json({
      success: true,
      data: roles
    });

  } catch (error) {
    console.error('User roles error:', error);
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

    const { name, description, permissions } = await request.json();

    if (!name || !description || !permissions) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    // Demo: Rol oluşturma
    // Gerçek uygulamada burada:
    // 1. Rol veritabanında oluşturulur
    // 2. Yetkiler atanır
    // 3. Audit log kaydedilir

    const newRole = {
      id: `role-${Date.now()}`,
      name,
      description,
      permissions,
      userCount: 0,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    console.log('Role created:', newRole);

    return NextResponse.json({
      success: true,
      message: 'Rol başarıyla oluşturuldu',
      data: newRole
    });

  } catch (error) {
    console.error('Create role error:', error);
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

    const { roleId, name, description, permissions, isActive } = await request.json();

    if (!roleId) {
      return NextResponse.json({ error: 'Rol ID gereklidir' }, { status: 400 });
    }

    // Demo: Rol güncelleme
    // Gerçek uygulamada burada:
    // 1. Rol veritabanında güncellenir
    // 2. Yetkiler güncellenir
    // 3. Audit log kaydedilir

    console.log('Role updated:', roleId, { name, description, permissions, isActive });

    return NextResponse.json({
      success: true,
      message: 'Rol başarıyla güncellendi',
      data: {
        roleId,
        name,
        description,
        permissions,
        isActive,
        updatedAt: new Date().toISOString(),
        updatedBy: payload.email
      }
    });

  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const roleId = searchParams.get('roleId');

    if (!roleId) {
      return NextResponse.json({ error: 'Rol ID gereklidir' }, { status: 400 });
    }

    // Demo: Rol silme
    // Gerçek uygulamada burada:
    // 1. Rol kullanımda mı kontrol edilir
    // 2. Rol veritabanından silinir
    // 3. Audit log kaydedilir

    console.log('Role deleted:', roleId);

    return NextResponse.json({
      success: true,
      message: 'Rol başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete role error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
