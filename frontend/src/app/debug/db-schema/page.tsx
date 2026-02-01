
'use client';

import { useState } from 'react';
import { FaDatabase, FaTools, FaCheckCircle, FaExclamationTriangle, FaUtensils } from 'react-icons/fa';

export default function DBSchemaFixPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const callEndpoint = async (endpoint: string, label: string) => {
        setLoading(true);
        addLog(`${label} başlatılıyor...`);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
            const res = await fetch(`${API_URL}/admin-fix/${endpoint}`);
            const data = await res.json();

            if (data.logs && Array.isArray(data.logs)) {
                data.logs.forEach((l: string) => addLog(l));
            }
            if (data.message) addLog(data.message);
            if (data.success) addLog(`✅ ${label} tamamlandı.`);
            else addLog(`❌ ${label} başarısız oldu: ${data.error || 'Bilinmeyen hata'}`);

        } catch (err: any) {
            addLog(`💥 Hata: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 border-b border-gray-700 pb-4">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FaTools className="text-yellow-500" />
                        Veritabanı Şema Onarım (Debug)
                    </h1>
                    <p className="text-gray-400 mt-2">Bu araç veritabanındaki eksik sütunları (missing columns) düzeltir.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                    {/* Schema Fix */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FaDatabase className="text-blue-400" />
                            1. Genel Şema Onarımı
                        </h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Menü öğeleri için eksik sütunları (variations, options, bundle_items vb.) ekler.
                            "500 Internal Server Error" ve "column does not exist" hatalarını çözer.
                        </p>
                        <button
                            onClick={() => callEndpoint('fix-db-schema', 'Şema Onarımı')}
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'İşleniyor...' : 'Şemayı Onar'}
                        </button>
                    </div>

                    {/* Campaign Fix */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FaExclamationTriangle className="text-orange-400" />
                            2. Kampanya Sütunları
                        </h2>
                        <p className="text-sm text-gray-400 mb-6">
                            İndirim ve kampanya özellikleri için gerekli sütunları (discount_percentage, discounted_price vb.) eksikse ekler.
                        </p>
                        <button
                            onClick={() => callEndpoint('apply-campaigns', 'Kampanya Sütunları')}
                            disabled={loading}
                            className="w-full py-3 bg-orange-600 hover:bg-orange-500 rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'İşleniyor...' : 'Eksik Sütunları Ekle'}
                        </button>
                    </div>
                </div>

                {/* Ramen Fix */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8 border-l-4 border-l-green-500">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FaUtensils className="text-green-400" />
                        3. Özel: Dana Etli Ramen Düzeltmesi (Acil)
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                        "Dana etli ramen - 牛肉拉面" ürününü bulur ve otomatik olarak günceller:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-300 mb-6 bg-gray-900/50 p-3 rounded">
                        <li>Fiyat: 248 -> 228 TL (Olarak ayarlanır)</li>
                        <li>Varyant: Küçük (228 TL)</li>
                        <li>Varyant: Büyük (248 TL)</li>
                    </ul>
                    <button
                        onClick={() => callEndpoint('fix-ramen-pricing', 'Ramen Düzeltmesi')}
                        disabled={loading}
                        className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 shadow-lg shadow-green-900/50"
                    >
                        {loading ? 'İşleniyor...' : 'RAMEN FİYATLARINI DÜZELT'}
                    </button>
                </div>

                {/* Logs */}
                <div className="bg-black p-4 rounded-xl border border-gray-800 font-mono text-sm h-64 overflow-y-auto">
                    <div className="text-gray-500 mb-2 border-b border-gray-800 pb-1">İşlem Kayıtları (Logs)</div>
                    {logs.length === 0 && <div className="text-gray-600 italic">Henüz işlem yapılmadı...</div>}
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1">{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
