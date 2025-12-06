import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantFeaturesByUsername } from '@/lib/restaurantFeaturesStore';

export async function GET(_request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params;
    if (!username) {
      return NextResponse.json({ error: 'username gereklidir' }, { status: 400 });
    }

    const { restaurantId, features } = getRestaurantFeaturesByUsername(username);
    return NextResponse.json({ username, restaurantId, features });
  } catch (error) {
    console.error('Public get features error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}


