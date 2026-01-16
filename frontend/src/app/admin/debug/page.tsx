'use client';

import { useState } from 'react';

export default function DebugPage() {
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';

    const handleSync = async () => {
        setLoading(true);
        setStatus('İşlem başlatılıyor...');
        setResult(null);

        try {
            const response = await fetch(`${API_URL}/api/admin/setup/sync-db`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            setResult(data);

            if (response.ok) {
                setStatus('✅ Başarılı: Veritabanı tabloları ve sütunları güncellendi.');
            } else {
                setStatus(`❌ Hata: ${data.message}`);
            }
        } catch (error: any) {
            setStatus(`❌ Bağlantı Hatası: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCheck = async () => {
        setLoading(true);
        setStatus('Kontrol ediliyor...');
        setResult(null);

        try {
            const response = await fetch(`${API_URL}/api/admin/setup/check`);
            const data = await response.json();
            setResult(data);

            if (response.ok) {
                setStatus('✅ Bağlantı başarılı.');
            } else {
                setStatus(`❌ Backend Hatası: ${data.message}`);
            }
        } catch (error: any) {
            setStatus(`❌ Ağ Hatası: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-blue-400">🛠️ Sistem Debug Paneli</h1>

                <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-200">Veritabanı Araçları</h2>
                    <p className="text-gray-400 mb-6 text-sm">
                        Eğer "Relation does not exist" veya "System not accepting connections" hataları alıyorsanız butonları sırayla deneyin.
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={handleCheck}
                            disabled={loading}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            1. Bağlantıyı Test Et
                        </button>

                        <button
                            onClick={handleSync}
                            disabled={loading}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            2. Tabloları Onar (Force Sync)
                        </button>
                    </div>
                </div>

                {status && (
                    <div className={`p-4 rounded-lg mb-6 ${status.startsWith('✅') ? 'bg-green-900/30 border border-green-800' : 'bg-red-900/30 border border-red-800'}`}>
                        <p className="font-mono">{status}</p>
                    </div>
                )}

                {result && (
                    <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 overflow-auto max-h-96">
                        <h3 className="text-xs uppercase text-gray-500 mb-2">Sunucu Yanıtı:</h3>
                        <pre className="text-xs text-green-400 font-mono">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="mt-8 pt-8 border-t border-gray-800">
                    <a href="/admin/setup" className="text-blue-400 hover:text-blue-300 underline">
                        &larr; Setup Sayfasına Dön
                    </a>
                </div>

            </div>
        </div>
    );
}
