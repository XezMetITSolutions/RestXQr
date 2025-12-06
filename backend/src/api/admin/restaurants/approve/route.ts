import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

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

    const { restaurantId, action, reason, notes } = await request.json();

    if (!restaurantId || !action) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json({ error: 'Red nedeni belirtilmelidir' }, { status: 400 });
    }

    // Demo: Restoran onay/red işlemi
    // Gerçek uygulamada burada veritabanı güncellemesi yapılacak
    
    const result = {
      success: true,
      restaurantId,
      action,
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedBy: payload.email,
      reviewedAt: new Date().toISOString(),
      reason: action === 'reject' ? reason : null,
      notes: notes || null
    };

    // Gerçek uygulamada burada:
    // 1. Restoran durumunu güncelle
    // 2. İşletme sahibine email gönder
    // 3. Audit log kaydet
    // 4. Gerekirse QR kodları oluştur

    return NextResponse.json(result);

  } catch (error) {
    console.error('Restaurant approval error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
