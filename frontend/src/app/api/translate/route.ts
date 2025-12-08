import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { text, targetLanguage, sourceLanguage, apiKey: requestApiKey } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const rawApiKey = requestApiKey || process.env.DEEPL_API_KEY || process.env.NEXT_PUBLIC_DEEPL_API_KEY;
        if (!rawApiKey) {
            console.error('DeepL API key missing');
            return NextResponse.json({ error: 'DeepL API key not configured' }, { status: 500 });
        }

        const apiKey = rawApiKey.trim();

        const params = new URLSearchParams();
        params.append('text', text);
        params.append('target_lang', targetLanguage);
        if (sourceLanguage) {
            params.append('source_lang', sourceLanguage);
        }

        const isFreeAccount = apiKey.endsWith(':fx');
        const apiUrl = isFreeAccount
            ? 'https://api-free.deepl.com/v2/translate'
            : 'https://api.deepl.com/v2/translate';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `DeepL-Auth-Key ${apiKey}`
            },
            body: params.toString()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepL API Error:', response.status, errorText);
            return NextResponse.json({
                error: `DeepL API Error: ${response.status}`,
                details: errorText,
                debug: {
                    endpoint: isFreeAccount ? 'free' : 'pro',
                    keySource: requestApiKey ? 'request' : 'env',
                    keyPreview: apiKey ? `...${apiKey.slice(-4)}` : 'none'
                }
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Translation proxy error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
