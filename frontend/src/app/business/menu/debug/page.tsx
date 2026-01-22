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
                            <h3 className="text-lg font-semibold mb-4 text-blue-400">Teşhis ve Günlükler</h3>
                            <div className="bg-black/40 rounded-lg p-4 h-[500px] overflow-y-auto font-mono text-sm border border-gray-800">
                                {testLog.length === 0 ? (
                                    <p className="text-gray-600 italic">Eylem bekleniyor...</p>
                                ) : (
                                    testLog.map((log, i) => (
                                        <div key={i} className={`mb-1 ${log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-gray-400'}`}>
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-2 text-blue-300">İpucu</h3>
                            <p className="text-sm text-blue-200/70 leading-relaxed">
                                Eğer "Internal Server Error" alıyorsanız, genellikle sevk edilen veri ile veritabanı sütunları arasında uyumsuzluk vardır.
                                Yukarıdaki tabloda <strong>HAYIR</strong> olarak işaretlenen sütunların (ve varsayılan değeri olmayanların)
                                mutlaka gönderilmesi gerekir.
                            </p>
                            <div className="mt-4 pt-4 border-t border-blue-500/20">
                                <p className="text-sm font-semibold text-blue-300 mb-2">Sık Karşılaşılan Sorunlar:</p>
                                <ul className="text-xs text-blue-200/60 list-disc list-inside space-y-1">
                                    <li>JSON alanlarına (variations, options) geçersiz veri gönderilmesi</li>
                                    <li>Sayısal beklenen alanlara (price) metin gönderilmesi</li>
                                    <li>Modelde tanımlı ama veritabanında olmayan sütunlar</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
