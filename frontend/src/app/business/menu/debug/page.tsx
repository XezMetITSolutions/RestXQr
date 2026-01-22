'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ColumnInfo {
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
}

interface TableInfo {
    menu_items: ColumnInfo[];
    menu_categories: ColumnInfo[];
}

export default function MenuDebugPage() {
    const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [testLog, setTestLog] = useState<string[]>([]);
    const router = useRouter();

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

    const fetchTableInfo = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/admin-fix/table-info`);
            const data = await response.json();
            if (data.success) {
                setTableInfo(data.tables);
            } else {
                setError(data.error || 'Failed to fetch table info');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error');
        } finally {
            setLoading(false);
        }
    };

    const addLog = (msg: string) => {
        setTestLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    const handleFixSchema = async () => {
        addLog('Attemping to fix database schema...');
        try {
            const response = await fetch(`${API_BASE}/admin-fix/fix-db-schema`);
            const data = await response.json();
            if (data.success) {
                addLog('✅ Schema fix completed successfully!');
                fetchTableInfo();
            } else {
                addLog(`❌ Fix failed: ${data.error}`);
            }
        } catch (err: any) {
            addLog(`❌ Network error: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchTableInfo();
    }, []);

    if (loading && !tableInfo) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4">Veritabanı yapısı inceleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Menü Debug Sayfası
                        </h1>
                        <p className="text-gray-400 mt-2">Ürün ekleme/düzenleme sorunlarını teşhis etmek için veritabanı yapısı.</p>
                    </div>
                    <div className="space-x-4">
                        <button
                            onClick={fetchTableInfo}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                        >
                            Yenile
                        </button>
                        <button
                            onClick={handleFixSchema}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                        >
                            Eksik Sütunları Ekle
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-lg mb-8">
                        <strong>Hata:</strong> {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Table Structure */}
                    <div className="space-y-8">
                        <section className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                            <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-800">
                                <h2 className="text-xl font-semibold">menu_items (Ürünler) Sütunları</h2>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs uppercase text-gray-500 bg-gray-900/80">
                                        <tr>
                                            <th className="px-6 py-3">Sütun Adı</th>
                                            <th className="px-6 py-3">Tip</th>
                                            <th className="px-6 py-3">Boş Olabilir?</th>
                                            <th className="px-6 py-3">Varsayılan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {tableInfo?.menu_items.map((col) => (
                                            <tr key={col.column_name} className="hover:bg-gray-800/30">
                                                <td className="px-6 py-4 font-mono text-sm text-blue-300">{col.column_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-400">{col.data_type}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    {col.is_nullable === 'YES' ? (
                                                        <span className="text-green-400">Evet</span>
                                                    ) : (
                                                        <span className="text-red-400 font-bold">HAYIR</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{col.column_default || 'null'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                            <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-800">
                                <h2 className="text-xl font-semibold">menu_categories (Kategoriler) Sütunları</h2>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs uppercase text-gray-500 bg-gray-900/80">
                                        <tr>
                                            <th className="px-6 py-3">Sütun Adı</th>
                                            <th className="px-6 py-3">Tip</th>
                                            <th className="px-6 py-3">Boş Olabilir?</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {tableInfo?.menu_categories.map((col) => (
                                            <tr key={col.column_name} className="hover:bg-gray-800/30">
                                                <td className="px-6 py-4 font-mono text-sm text-purple-300">{col.column_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-400">{col.data_type}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    {col.is_nullable === 'YES' ? (
                                                        <span className="text-green-400">Evet</span>
                                                    ) : (
                                                        <span className="text-red-400 font-bold">HAYIR</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* Logs and Actions */}
                    <div className="space-y-6">
                        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4 text-blue-400">API Test Araçları</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={async () => {
                                            addLog('🚀 Yeni ürün oluşturma testi başlıyor...');
                                            try {
                                                // Get first restaurant and category to make it easy
                                                const resResp = await fetch(`${API_BASE}/restaurants`);
                                                const resData = await resResp.json();
                                                const restaurantId = resData.data?.[0]?.id;

                                                if (!restaurantId) {
                                                    addLog('❌ Hata: Veritabanında restoran bulunamadı.');
                                                    return;
                                                }

                                                const catResp = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu/categories`);
                                                const catData = await catResp.json();
                                                const categoryId = catData.data?.[0]?.id;

                                                if (!categoryId) {
                                                    addLog('❌ Hata: Restoranda kategori bulunamadı.');
                                                    return;
                                                }

                                                const testData = {
                                                    categoryId,
                                                    name: 'Debug Test Ürünü ' + Math.floor(Math.random() * 1000),
                                                    price: 99.99,
                                                    description: 'Bu bir debug test ürünüdür.',
                                                    isAvailable: true,
                                                    isPopular: false,
                                                    variations: [],
                                                    options: []
                                                };

                                                addLog(`📡 Gönderilen veri: ${JSON.stringify(testData, null, 2)}`);

                                                const response = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu/items`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(testData)
                                                });

                                                const result = await response.json();
                                                if (response.ok) {
                                                    addLog(`✅ Başarılı! Ürün ID: ${result.data.id}`);
                                                } else {
                                                    addLog(`❌ Hata (${response.status}): ${result.message || 'Bilinmeyen hata'}`);
                                                    if (result.error) addLog(`Detay: ${result.error}`);
                                                    if (result.stack) console.error('Stack Trace:', result.stack);
                                                }
                                            } catch (err: any) {
                                                addLog(`❌ Ağ Hatası: ${err.message}`);
                                            }
                                        }}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-all font-semibold"
                                    >
                                        🚀 Basit Ürün Ekle (Test)
                                    </button>

                                    <button
                                        onClick={async () => {
                                            addLog('🚀 Karmaşık ürün (Varyasyonlu) oluşturma testi...');
                                            try {
                                                const resResp = await fetch(`${API_BASE}/restaurants`);
                                                const resData = await resResp.json();
                                                const restaurantId = resData.data?.[0]?.id;
                                                const catResp = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu/categories`);
                                                const catData = await catResp.json();
                                                const categoryId = catData.data?.[0]?.id;

                                                const testData = {
                                                    categoryId,
                                                    name: 'Varyasyonlu Test Ürünü',
                                                    price: 150,
                                                    variations: [{ name: 'Büyük', price: 180 }, { name: 'Küçük', price: 120 }],
                                                    options: [{ name: 'Acı', values: ['Az', 'Çok'] }],
                                                    allergens: ['Gluten'],
                                                    kitchenStation: 'izgara'
                                                };

                                                addLog(`📡 Gönderilen veri: ${JSON.stringify(testData, null, 2)}`);

                                                const response = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu/items`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(testData)
                                                });

                                                const result = await response.json();
                                                if (response.ok) {
                                                    addLog(`✅ Başarılı! Ürün ID: ${result.data.id}`);
                                                } else {
                                                    addLog(`❌ Hata (${response.status}): ${result.message || result.error}`);
                                                }
                                            } catch (err: any) {
                                                addLog(`❌ Ağ Hatası: ${err.message}`);
                                            }
                                        }}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-all font-semibold"
                                    >
                                        ✨ Karmaşık Ürün Ekle
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-gray-800">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Günlükler</h4>
                                    <div className="bg-black/40 rounded-lg p-4 h-[350px] overflow-y-auto font-mono text-xs border border-gray-800">
                                        {testLog.length === 0 ? (
                                            <p className="text-gray-600 italic">Eylem bekleniyor...</p>
                                        ) : (
                                            testLog.map((log, i) => (
                                                <div key={i} className={`mb-2 pb-2 border-b border-gray-800/50 ${log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-gray-400'}`}>
                                                    {log}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-2 text-blue-300">Teşhis İpucu</h3>
                            <p className="text-sm text-blue-200/70 leading-relaxed">
                                Eğer "Internal Server Error" alıyorsanız, günlüklerdeki hata mesajına bakın.
                                <br />- <strong>"column X does not exist"</strong>: Veritabanı sütunları eksik (Eksik Sütunları Ekle butonunu kullanın).
                                <br />- <strong>"invalid input syntax for type numeric"</strong>: Fiyat veya sayısal alanda geçersiz veri var.
                                <br />- <strong>"check constraint X"</strong>: Veritabanı kısıtlamalarına takılan bir veri var.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
