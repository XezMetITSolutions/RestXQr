'use client';

import { useState } from 'react';

export default function DatabaseMigrationPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        alreadyExists?: boolean;
        timestamp?: string;
        error?: string;
    } | null>(null);

    const runMigration = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/debug/add-kitchen-station`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                message: 'Bağlantı hatası oluştu',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Veritabanı Migration</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Bu sayfa veritabanı şemasını güncellemek için kullanılır.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        Kitchen Station Kolonu Ekle
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        menu_items tablosuna kitchen_station kolonu ekler. Bu kolon, ürünlerin hangi mutfak istasyonuna
                        ait olduğunu belirtir (izgara, makarna, soğuk, tatlı).
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Warning Alert */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Dikkat:</p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                    Bu işlem veritabanı şemasını değiştirir. Sadece gerektiğinde çalıştırın.
                                    Kolon zaten mevcutsa hiçbir değişiklik yapmaz.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div>
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
                                    Migration&apos;ı Çalıştır
                                </>
                            )}
                        </button>
                    </div>

                    {/* Result Alert */}
                    {result && (
                        <div className={`rounded-lg p-4 ${result.success
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                            }`}>
                            <div className="flex items-start gap-3">
                                {result.success ? (
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-red-600 dark:text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <div className="flex-1">
                                    <p className={`font-semibold text-sm ${result.success
                                            ? 'text-green-800 dark:text-green-300'
                                            : 'text-red-800 dark:text-red-300'
                                        }`}>
                                        {result.message}
                                    </p>
                                    {result.alreadyExists && (
                                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                            ✅ Kolon zaten mevcut - hiçbir değişiklik yapılmadı
                                        </p>
                                    )}
                                    {result.error && (
                                        <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                                            Hata detayı: {result.error}
                                        </p>
                                    )}
                                    {result.timestamp && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                            Zaman: {new Date(result.timestamp).toLocaleString('tr-TR')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Migration Details */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Migration Detayları:</h3>
                        <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                            <li>• Tablo: <code className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded text-xs">menu_items</code></li>
                            <li>• Kolon: <code className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded text-xs">kitchen_station</code></li>
                            <li>• Tip: <code className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded text-xs">VARCHAR(50) NULL</code></li>
                            <li>• Değerler: izgara, makarna, soguk, tatli</li>
                        </ul>
                    </div>

                    {/* Usage Info */}
                    <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                        <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-2">Ne Zaman Kullanılır?</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                            Eğer ürün düzenlerken &quot;istasyon&quot; kaydetmeye çalıştığınızda <strong>Internal Server Error</strong> alıyorsanız,
                            bu migration&apos;ı çalıştırmanız gerekir. Migration, eksik olan veritabanı kolonunu ekler.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
