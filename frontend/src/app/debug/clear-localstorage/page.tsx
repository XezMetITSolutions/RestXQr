'use client';

import { useState, useEffect } from 'react';

export default function ClearLocalStoragePage() {
    const [localStorageData, setLocalStorageData] = useState<any>(null);
    const [cleared, setCleared] = useState(false);

    useEffect(() => {
        loadLocalStorageData();
    }, []);

    const loadLocalStorageData = () => {
        if (typeof window !== 'undefined') {
            const businessStaff = localStorage.getItem('business_staff');
            if (businessStaff) {
                try {
                    const parsed = JSON.parse(businessStaff);
                    setLocalStorageData(parsed);
                } catch (e) {
                    setLocalStorageData('Parse error');
                }
            } else {
                setLocalStorageData(null);
            }
        }
    };

    const clearBusinessStaff = () => {
        if (confirm('business_staff localStorage verisini silmek istediğinizden emin misiniz?')) {
            localStorage.removeItem('business_staff');
            setCleared(true);
            setLocalStorageData(null);
            alert('✅ business_staff localStorage verisi silindi!');
        }
    };

    const clearAllLocalStorage = () => {
        if (confirm('TÜM localStorage verisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
            localStorage.clear();
            setCleared(true);
            setLocalStorageData(null);
            alert('✅ Tüm localStorage verisi silindi!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🗑️ LocalStorage Temizleme
                    </h1>
                    <p className="text-gray-600">Kroren business_staff localStorage verisini görüntüleyin ve temizleyin</p>
                </div>

                {cleared && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-800 font-semibold">✅ LocalStorage temizlendi! Sayfayı yenileyin.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <button
                        onClick={clearBusinessStaff}
                        className="bg-orange-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-orange-700 transition-colors"
                    >
                        🗑️ business_staff Verisini Sil
                    </button>
                    <button
                        onClick={clearAllLocalStorage}
                        className="bg-red-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors"
                    >
                        ⚠️ TÜM LocalStorage'ı Sil
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                            📦 business_staff LocalStorage İçeriği
                        </h2>
                        <button
                            onClick={loadLocalStorageData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            🔄 Yenile
                        </button>
                    </div>

                    {localStorageData === null ? (
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                            <p className="text-gray-600">LocalStorage'da business_staff verisi yok</p>
                        </div>
                    ) : localStorageData === 'Parse error' ? (
                        <div className="bg-red-50 rounded-lg p-6 text-center">
                            <p className="text-red-600">Parse hatası! Veri bozuk olabilir.</p>
                        </div>
                    ) : Array.isArray(localStorageData) ? (
                        <div>
                            <div className="mb-4 bg-blue-50 rounded-lg p-4">
                                <p className="font-semibold text-blue-900">
                                    Toplam {localStorageData.length} personel kaydı bulundu
                                </p>
                            </div>

                            <div className="space-y-3">
                                {localStorageData.map((staff: any, index: number) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-600">İsim</p>
                                                <p className="font-semibold">{staff.name || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Email</p>
                                                <p className="font-mono text-sm">{staff.email || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Rol</p>
                                                <p className="font-semibold">{staff.role || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Durum</p>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {staff.status || '-'}
                                                </span>
                                            </div>
                                        </div>
                                        <details className="mt-3">
                                            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                                                Detayları Göster
                                            </summary>
                                            <pre className="mt-2 text-xs font-mono bg-white p-3 rounded border overflow-x-auto">
                                                {JSON.stringify(staff, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 rounded-lg p-6">
                            <p className="text-yellow-800 mb-2">Beklenmeyen veri formatı:</p>
                            <pre className="text-xs font-mono bg-white p-3 rounded border overflow-x-auto">
                                {JSON.stringify(localStorageData, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-3 text-blue-900">ℹ️ Bilgi</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>• Business staff sayfası önce backend'den veri yüklemeye çalışır</li>
                        <li>• Backend başarısız olursa localStorage'dan yükler (fallback)</li>
                        <li>• "test" kullanıcısı localStorage'da kayıtlı olabilir</li>
                        <li>• LocalStorage'ı temizledikten sonra sayfa sadece backend'den veri çekecek</li>
                        <li>• Temizleme sonrası <code className="bg-white px-2 py-1 rounded">https://kroren.restxqr.com/business/staff/</code> sayfasını yenileyin</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
