'use client';

import { useState, useEffect } from 'react';
import { FaDatabase, FaTools, FaCheckCircle, FaExclamationTriangle, FaSearch, FaBug } from 'react-icons/fa';

export default function ProductDebugPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [dbColumns, setDbColumns] = useState<string[]>([]);
    const [missingColumns, setMissingColumns] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const REQUIRED_COLUMNS = [
        'variations',
        'options',
        'bundle_items',
        'kitchen_station',
        'type',
        'discount_percentage',
        'discounted_price',
        'ingredients',
        'allergens',
        'is_available',
        'is_popular',
        'translations'
    ];

    const addLog = (msg: string) => setLogs(prev => [`${new Date().toLocaleTimeString()} - ${msg}`, ...prev]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

    const checkColumns = async () => {
        setLoading(true);
        addLog('Veritabanı sütunları kontrol ediliyor...');
        try {
            const res = await fetch(`${API_URL}/admin-fix/table-info`);
            const data = await res.json();

            if (data.success && data.tables && data.tables.menu_items) {
                const cols = data.tables.menu_items.map((c: any) => c.column_name);
                setDbColumns(cols);

                const missing = REQUIRED_COLUMNS.filter(req => !cols.includes(req));
                setMissingColumns(missing);

                if (missing.length === 0) {
                    addLog('✅ Tüm gerekli sütunlar mevcut.');
                } else {
                    addLog(`⚠️ Eksik sütunlar bulundu: ${missing.join(', ')}`);
                }
            }
        } catch (err: any) {
            addLog(`💥 Hata: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fixSchema = async () => {
        setLoading(true);
        addLog('Şema onarımı başlatılıyor...');
        try {
            const res = await fetch(`${API_URL}/admin-fix/fix-db-schema`);
            const data = await res.json();
            if (data.success) {
                addLog('✅ Şema onarımı tamamlandı.');
                checkColumns(); // Re-check after fix
            } else {
                addLog(`❌ Hata: ${data.message}`);
            }
        } catch (err: any) {
            addLog(`💥 Hata: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fixHoxan = async () => {
        setLoading(true);
        addLog('🥟 Hoxan - 锅贴 düzeltmesi başlatılıyor...');
        try {
            const res = await fetch(`${API_URL}/admin-fix/debug-hoxan`, {
                method: 'POST'
            });
            const data = await res.json();

            if (data.logs) data.logs.forEach((l: string) => addLog(l));

            if (data.success) {
                addLog('✅ Hoxan güncellendi.');
                // Auto search for it to show result
                setSearchQuery('Hoxan');
                searchProduct('Hoxan');
            }
        } catch (err: any) {
            addLog(`💥 Hata: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const searchProduct = async (query: string) => {
        if (!query) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin-fix/debug-item-search?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.items);
                addLog(`🔍 "${query}" için ${data.items.length} sonuç bulundu.`);
            }
        } catch (err: any) {
            addLog(`💥 Arama hatası: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkColumns();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 border-b border-gray-700 pb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <FaBug className="text-red-500" />
                            Ürün ve Veritabanı Debug Paneli
                        </h1>
                        <p className="text-gray-400 mt-2">Sütun kontrolü, Hoxan testi ve detaylı ürün incelemesi.</p>
                    </div>
                    <div className="text-right">
                        <button
                            onClick={checkColumns}
                            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors"
                        >
                            🔄 Listeyi Yenile
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Schema Status */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                                <FaDatabase className="text-blue-400" />
                                Veritabanı Sütunları
                            </h2>

                            <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Durum</h3>
                                {missingColumns.length === 0 ? (
                                    <div className="bg-green-900/30 text-green-400 p-3 rounded flex items-center gap-2 border border-green-800">
                                        <FaCheckCircle /> Tüm gerekli sütunlar mevcut
                                    </div>
                                ) : (
                                    <div className="bg-red-900/30 text-red-400 p-3 rounded flex items-center gap-2 border border-red-800 animate-pulse">
                                        <FaExclamationTriangle /> {missingColumns.length} sütun eksik!
                                    </div>
                                )}
                            </div>

                            {missingColumns.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold text-red-400 mb-2 uppercase tracking-wider">Eksik Olanlar</h3>
                                    <ul className="list-disc list-inside text-red-300 text-sm space-y-1 bg-red-900/20 p-3 rounded">
                                        {missingColumns.map(col => <li key={col}>{col}</li>)}
                                    </ul>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Mevcut Kritik Sütunlar</h3>
                                <div className="flex flex-wrap gap-2">
                                    {REQUIRED_COLUMNS.map(col => (
                                        <span
                                            key={col}
                                            className={`text-xs px-2 py-1 rounded border ${dbColumns.includes(col)
                                                    ? 'bg-green-900/30 border-green-800 text-green-300'
                                                    : 'bg-red-900/30 border-red-800 text-red-300 line-through'
                                                }`}
                                        >
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={fixSchema}
                                disabled={loading || missingColumns.length === 0}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                <FaTools /> Eksik Sütunları Ekle (Fix DB)
                            </button>
                        </div>
                    </div>

                    {/* Middle Column: Actions & Search */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Hoxan Fix Card */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="text-6xl">🥟</span>
                            </div>
                            <h2 className="text-xl font-bold mb-4 text-yellow-400">Özel Düzeltme: Hoxan - 锅贴</h2>
                            <p className="text-gray-300 mb-4">
                                Bu işlem "Hoxan" ürününü bulur ve varyasyonlarını şu şekilde ayarlar:
                            </p>
                            <ul className="list-disc list-inside text-gray-400 text-sm mb-6 bg-black/30 p-4 rounded border border-gray-700">
                                <li>2li - 199 TL</li>
                                <li>4lü - 398 TL</li>
                            </ul>
                            <button
                                onClick={fixHoxan}
                                disabled={loading}
                                className="w-full md:w-auto px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-yellow-900/20"
                            >
                                {loading ? 'İşleniyor...' : 'Hoxan Düzeltmesini Uygula'}
                            </button>
                        </div>

                        {/* Product Inspector */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FaSearch className="text-purple-400" />
                                Ürün İnceleme (Raw JSON)
                            </h2>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && searchProduct(searchQuery)}
                                    placeholder="Ürün adı ara... (örn: Hoxan)"
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                />
                                <button
                                    onClick={() => searchProduct(searchQuery)}
                                    className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded font-bold transition-colors"
                                >
                                    Ara
                                </button>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {searchResults.map(item => (
                                        <div key={item.id} className="bg-gray-900 rounded border border-gray-700 overflow-hidden">
                                            <div className="bg-gray-800 p-3 border-b border-gray-700 font-bold flex justify-between">
                                                <span>{item.name}</span>
                                                <span className="text-green-400">{item.price} TL</span>
                                            </div>
                                            <div className="p-3">
                                                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 block">ID</span>
                                                        {item.id}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block">Restaurant ID</span>
                                                        {item.restaurantId}
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <span className="text-orange-400 font-bold text-xs uppercase tracking-wider block mb-1">Variations (Raw JSON)</span>
                                                    <pre className="bg-black p-2 rounded text-xs text-green-300 overflow-x-auto border border-gray-800">
                                                        {JSON.stringify(item.variations, null, 2)}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <span className="text-blue-400 font-bold text-xs uppercase tracking-wider block mb-1">Options (Raw JSON)</span>
                                                    <pre className="bg-black p-2 rounded text-xs text-blue-300 overflow-x-auto border border-gray-800">
                                                        {JSON.stringify(item.options, null, 2)}
                                                    </pre>
                                                </div>
                                                {/* Hidden Logic Check */}
                                                <div className="mt-2 text-xs text-gray-500 italic border-t border-gray-800 pt-2">
                                                    Type: {typeof item.variations} | Is Array: {Array.isArray(item.variations) ? 'Yes' : 'No'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Bottom Logs */}
                <div className="mt-8 bg-black p-4 rounded-xl border border-gray-800 font-mono text-xs h-40 overflow-y-auto">
                    <div className="text-gray-500 mb-2 border-b border-gray-800 pb-1 sticky top-0 bg-black">Console Logs</div>
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 text-gray-300 hover:bg-gray-900 px-1 rounded">{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
