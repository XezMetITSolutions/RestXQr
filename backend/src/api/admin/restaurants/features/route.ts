import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { setRestaurantFeatures, getRestaurantFeaturesById } from '@/lib/restaurantFeaturesStore';

export async function PUT(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 401 });
    }

    const payload = verifyToken(accessToken);
    if (!payload || payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { restaurantId, features } = await request.json();
    if (!restaurantId || !Array.isArray(features)) {
      return NextResponse.json({ error: 'restaurantId ve features gereklidir' }, { status: 400 });
    }

    setRestaurantFeatures(restaurantId, features);

    return NextResponse.json({ success: true, restaurantId, features });
  } catch (error) {
    console.error('Update features error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId gereklidir' }, { status: 400 });
    }
    const features = getRestaurantFeaturesById(restaurantId);
    return NextResponse.json({ restaurantId, features });
  } catch (error) {
    console.error('Get features error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}


