'use client';

import React, { useState } from 'react';
import { getSupportedLanguages } from '@/lib/deepl';

export default function TranslationDebugPage() {
    const [inputText, setInputText] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('tr');
    const [translatedText, setTranslatedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTranslate = async () => {
        setLoading(true);
        setError(null);
        setTranslatedText('');
        try {
            if (!inputText) {
                setError('Please enter text to translate');
                return;
            }

            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: inputText,
                    targetLanguage: targetLanguage.toUpperCase(),
                    sourceLanguage: 'EN',
                    apiKey: apiKey || undefined
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(`API Error (${response.status}): ${JSON.stringify(data)}`);
                return;
            }

            setTranslatedText(JSON.stringify(data, null, 2));
        } catch (err: any) {
            setError(err.message || 'Translation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Translation API Debugger</h1>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">API Key (Optional)</label>
                    <input
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Leave empty to use server env var"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Text to Translate</label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full p-2 border rounded h-32"
                        placeholder="Enter text..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Target Language</label>
                    <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        {getSupportedLanguages().map((lang) => (
                            <option key={lang} value={lang}>
                                {lang.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleTranslate}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Translating...' : 'Translate'}
                </button>

                {error && (
                    <div className="p-4 bg-red-100 text-red-700 rounded">
                        Error: {error}
                    </div>
                )}

                {translatedText && (
                    <div className="p-4 bg-gray-100 rounded">
                        <h3 className="font-semibold mb-2">Raw API Response:</h3>
                        <pre className="whitespace-pre-wrap font-mono text-sm">{translatedText}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}
