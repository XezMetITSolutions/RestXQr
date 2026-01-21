import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

export async function GET() {
    try {
        const response = await fetch(`${API_BASE_URL}/printers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch printers' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const station = pathParts[pathParts.length - 1];

        const response = await fetch(`${API_BASE_URL}/printers/${station}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update printer' },
            { status: 500 }
        );
    }
}
