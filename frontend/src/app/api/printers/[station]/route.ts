import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

export async function GET(
    request: Request,
    { params }: { params: { station: string } }
) {
    try {
        const { station } = params;
        const url = new URL(request.url);
        const endpoint = url.pathname.endsWith('/status') ? 'status' : 'test';

        const response = await fetch(`${API_BASE_URL}/printers/${station}/${endpoint}`, {
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
            { success: false, error: 'Failed to check printer status' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: { station: string } }
) {
    try {
        const { station } = params;
        const body = await request.json();
        const url = new URL(request.url);
        const endpoint = url.pathname.endsWith('/test') ? 'test' : 'print';

        const response = await fetch(`${API_BASE_URL}/printers/${station}/${endpoint}`, {
            method: 'POST',
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
            { success: false, error: 'Failed to send print job' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { station: string } }
) {
    try {
        const { station } = params;
        const body = await request.json();

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
            { success: false, error: 'Failed to update printer config' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { station: string } }
) {
    try {
        const { station } = params;
        const response = await fetch(`${API_BASE_URL}/printers/${station}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete printer' },
            { status: 500 }
        );
    }
}
