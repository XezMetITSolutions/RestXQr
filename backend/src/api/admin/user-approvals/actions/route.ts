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

    const { approvalIds, action, rejectionReason, notes, interviewNotes } = await request.json();

    if (!approvalIds || !Array.isArray(approvalIds) || approvalIds.length === 0) {
      return NextResponse.json({ error: 'Başvuru ID\'leri gereklidir' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: 'İşlem türü gereklidir' }, { status: 400 });
    }

    const validActions = ['approve', 'reject', 'addNotes', 'addInterviewNotes'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Geçersiz işlem türü' }, { status: 400 });
    }

    // Demo: Kullanıcı onay işlemi simülasyonu
    // Gerçek uygulamada burada:
    // 1. Başvuru durumunu güncelle
    // 2. Kullanıcıya bildirim gönder
    // 3. İşletme sahibine bildirim gönder
    // 4. Audit log kaydet
    // 5. Gerekirse webhook tetikle

    const result = {
      success: true,
      action,
      processedCount: approvalIds.length,
      approvalIds,
      processedBy: payload.email,
      processedAt: new Date().toISOString(),
      rejectionReason: rejectionReason || null,
      notes: notes || null,
      interviewNotes: interviewNotes || null
    };

    // Gerçek uygulamada burada veritabanı güncellemesi yapılacak
    console.log('User approval action:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('User approval action error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
