'use client';

import { useState, useEffect } from 'react';

interface MenuItem {
    category: string;
    name: string;
    price: string;
    description: string;
    imageUrl: string;
}

export default function ImportPreviewPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch('https://masapp-backend.onrender.com/api/admin/import-preview')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP Hata: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setItems(data);
                } else {
                    console.error('Beklenen veri formatı (dizi) gelmedi:', data);
                    setImportStatus({ success: false, message: 'Veri formatı hatalı. Dizi bekleniyordu.' });
                }
            })
            .catch(err => {
                console.error('Veri yükleme hatası:', err);
                setImportStatus({ success: false, message: 'Veriler yüklenemedi: ' + err.message });
            })
            .finally(() => setLoading(false));
    }, []);

    const handleStartImport = async () => {
        if (!confirm('Tüm ürünleri Cloudinary\'ye yükleyip veritabanına aktarmak istediğinize emin misiniz?')) return;

        setLoading(true);
        setImportStatus(null);

        try {
            const response = await fetch('https://masapp-backend.onrender.com/api/admin/import-kroren', {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success) {
                setImportStatus({ success: true, message: `Başarılı! ${data.results.added} ürün eklendi, ${data.results.skipped} ürün atlandı.` });
            } else {
                setImportStatus({ success: false, message: 'Hata: ' + data.message });
            }
        } catch (error: any) {
            setImportStatus({ success: false, message: 'Bağlantı hatası: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">📦 Kroren Menü Import Önizleme</h1>
                        <p className="text-gray-500 mt-1">Simpra'dan çekilen <b>{items.length}</b> ürün aktarılmaya hazır.</p>
                    </div>
                    <button
                        onClick={handleStartImport}
                        disabled={loading || items.length === 0}
                        className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-green-200'
                            }`}
                    >
                        {loading ? '⏳ Aktarılıyor...' : '🚀 Aktarımı Başlat'}
                    </button>
                </div>

                {importStatus && (
                    <div className={`mb-8 p-6 rounded-2xl border-2 flex items-center ${importStatus.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        <span className="text-3xl mr-4">{importStatus.success ? '✅' : '❌'}</span>
                        <span className="font-bold text-lg">{importStatus.message}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, index) => (
                        <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                            <div className="relative h-48 bg-gray-200">
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                                    {item.category}
                                </div>
                                <div className="absolute bottom-3 right-3 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-black shadow-lg">
                                    {item.price}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-black text-gray-900 mb-2 truncate">{item.name}</h3>
                                <p className="text-gray-500 text-sm line-clamp-3 h-15 leading-relaxed">
                                    {item.description || 'Açıklama bulunmuyor.'}
                                </p>
                                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <span>RESİM AKTARILACAK</span>
                                    <span className="text-blue-500">CLOUDINARY READY</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
