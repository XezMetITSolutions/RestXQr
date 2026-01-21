'use client';

import { useState } from 'react';

export default function PrinterDebugPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const runMigration = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/debug/add-printer-config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                message: 'Bağlantı hatası',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">🖨️ Yazıcı Debug Paneli</h1>
                <p className="text-gray-600">Yazıcı yapılandırması ve test araçları</p>
            </div>

            {/* Migration Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        Yazıcı Yapılandırması Migration
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Veritabanına printer_config kolonunu ekler ve Kroren'in kavurma istasyonuna yazıcı IP'sini atar.
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-yellow-800">Dikkat:</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Bu işlem veritabanı şemasını değiştirir. Kolon zaten mevcutsa sadece Kroren config'ini günceller.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={runMigration}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Migration Çalıştırılıyor...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                </svg>
                                Migration'ı Çalıştır
                            </>
                        )}
                    </button>

                    {/* Result */}
                    {result && (
                        <div className={`rounded-lg p-4 ${result.success
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                            }`}>
                            <div className="flex items-start gap-3">
                                {result.success ? (
                                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <div className="flex-1">
                                    <p className={`font-semibold text-sm ${result.success
                                            ? 'text-green-800'
                                            : 'text-red-800'
                                        }`}>
                                        {result.message}
                                    </p>
                                    {result.alreadyExists && (
                                        <p className="text-sm text-green-700 mt-1">
                                            ✅ Kolon zaten mevcut - Kroren config güncellendi
                                        </p>
                                    )}
                                    {result.details && (
                                        <p className="text-sm text-green-700 mt-1">
                                            📝 {result.details}
                                        </p>
                                    )}
                                    {result.error && (
                                        <p className="text-sm text-red-700 mt-2">
                                            Hata detayı: {result.error}
                                        </p>
                                    )}
                                    {result.timestamp && (
                                        <p className="text-xs text-gray-600 mt-2">
                                            Zaman: {new Date(result.timestamp).toLocaleString('tr-TR')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Migration Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Migration Detayları:</h3>
                        <ul className="text-sm space-y-1 text-gray-600">
                            <li>• Tablo: <code className="bg-white px-2 py-0.5 rounded text-xs">restaurants</code></li>
                            <li>• Kolon: <code className="bg-white px-2 py-0.5 rounded text-xs">printer_config</code></li>
                            <li>• Tip: <code className="bg-white px-2 py-0.5 rounded text-xs">JSONB</code></li>
                            <li>• Kroren Kavurma IP: <code className="bg-white px-2 py-0.5 rounded text-xs font-bold text-blue-600">192.168.1.13:9100</code></li>
                        </ul>
                    </div>

                    {/* Usage Info */}
                    <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                        <h4 className="font-semibold text-sm text-blue-900 mb-2">Ne Zaman Kullanılır?</h4>
                        <p className="text-sm text-blue-800">
                            Sipariş onaylandığında otomatik yazıcı çıktısı almak için bu migration'ı çalıştırın.
                            Migration tamamlandıktan sonra, kavurma istasyonundaki ürünler sipariş edilip kasa tarafından
                            onaylandığında 192.168.1.13 IP'sindeki yazıcıdan otomatik fiş çıkacak.
                        </p>
                    </div>

                    {/* Test Scenario */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Test Senaryosu
                        </h4>
                        <ol className="text-sm space-y-2 text-gray-700">
                            <li className="flex gap-2">
                                <span className="font-bold text-purple-600">1.</span>
                                <span>Migration'ı çalıştır (yukarıdaki butona bas)</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-purple-600">2.</span>
                                <span>Kavurma istasyonundaki bir ürünü sipariş et (QR menüden)</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-purple-600">3.</span>
                                <span>Kasa panelinden siparişi onayla</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-purple-600">4.</span>
                                <span className="font-semibold text-green-600">✅ 192.168.1.13 IP'sindeki yazıcıdan otomatik fiş çıkacak!</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
