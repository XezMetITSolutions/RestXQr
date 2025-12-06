import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantUsername } = body;

    if (!restaurantUsername) {
      return NextResponse.json({
        success: false,
        message: 'Restaurant username is required'
      }, { status: 400 });
    }

    // Backend API'sine istek gönder
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
    const response = await fetch(`${backendUrl}/api/admin/seed-menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        restaurantUsername
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: data.message || 'Backend API error'
      }, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Seed menu API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
