import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

export async function POST(
    request: Request,
    { params }: { params: { station: string } }
) {
    try {
        const { station } = params;

        const response = await fetch(`${API_BASE_URL}/printers/${station}/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send test print' },
            { status: 500 }
        );
    }
}
