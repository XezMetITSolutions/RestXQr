'use client';

import React, { useState } from 'react';
import { translateWithDeepL, getSupportedLanguages } from '@/lib/deepl';

export default function TranslationDebugPage() {
    const [inputText, setInputText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('tr');
    const [translatedText, setTranslatedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTranslate = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!inputText) {
                setError('Please enter text to translate');
                return;
            }

            const result = await translateWithDeepL({
                text: inputText,
                targetLanguage,
                sourceLanguage: 'en' // default source for testing
            });

            setTranslatedText(result);
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
                        <h3 className="font-semibold mb-2">Result:</h3>
                        <p>{translatedText}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
