'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSync, FaCheck, FaExclamationTriangle, FaEdit, FaSave, FaSearch, FaPlusCircle } from 'react-icons/fa';

interface JsonItem {
    urun_adi: string;
    fiyat: number;
    para_birimi: string;
    alternatif?: any;
}

interface MenuItem {
    id: string;
    name: string;
    price: number;
    categoryId: string;
}

export default function ProductSyncPage() {
    const router = useRouter();
    const [jsonItems, setJsonItems] = useState<JsonItem[]>([]);
    const [dbItems, setDbItems] = useState<MenuItem[]>([]);
    const [matchedItems, setMatchedItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [creating, setCreating] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Initial Load
    useEffect(() => {
        const user = localStorage.getItem('staff_user');
        if (user) {
            const parsed = JSON.parse(user);
            if (parsed.restaurantId) setRestaurantId(parsed.restaurantId);
        }
    }, []);

    const loadData = async () => {
        if (!restaurantId) return alert('Restoran ID bulunamadı. Lütfen giriş yapın.');
        setLoading(true);
        try {
            // 1. Load Local JSON
            const jsonRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/local-price-list`);
            const jsonData = await jsonRes.json();

            if (!jsonData.success) {
                alert('Fiyat listesi dosyası okunamadı: ' + jsonData.message);
                setLoading(false);
                return;
            }

            // 2. Load DB Items & Categories
            let dbItemList: MenuItem[] = [];
            const menuRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${restaurantId}/menu`);
            const menuData = await menuRes.json();

            if (menuData.success && menuData.data) {
                setCategories(menuData.data.map((c: any) => ({ id: c.id, name: c.name })));
                if (menuData.data.length > 0 && !selectedCategory) setSelectedCategory(menuData.data[0].id);

                menuData.data.forEach((cat: any) => {
                    if (cat.items) {
                        dbItemList = [...dbItemList, ...cat.items];
                    }
                });
            } else {
                alert('Menü verisi çekilemedi.');
            }

            setJsonItems(jsonData.data.fiyat_listesi);
            setDbItems(dbItemList);

            // 3. Match Logic
            const matches: any[] = [];

            jsonData.data.fiyat_listesi.forEach((jItem: JsonItem) => {
                let bestMatch = null;
                let matchType = 'none';

                // 1. Try exact match (normalized)
                const jNameNorm = jItem.urun_adi.toLowerCase().replace(/\s+/g, '');

                bestMatch = dbItemList.find(d => {
                    const dNameNorm = d.name.toLowerCase().replace(/\s+/g, '');
                    return dNameNorm === jNameNorm;
                });

                if (bestMatch) {
                    matchType = 'exact';
                } else {
                    // 2. Try containment
                    bestMatch = dbItemList.find(d => {
                        return jItem.urun_adi.toLowerCase().includes(d.name.toLowerCase()) && d.name.length > 3;
                    });
                    if (bestMatch) matchType = 'fuzzy';
                }

                matches.push({
                    json: jItem,
                    db: bestMatch,
                    matchType,
                    selectedDbId: bestMatch ? bestMatch.id : '',
                    newPrice: jItem.fiyat
                });
            });

            setMatchedItems(matches);

        } catch (err) {
            console.error(err);
            alert('Veri yükleme hatası');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        const toUpdate = matchedItems.filter(m => m.db && m.selectedDbId === m.db.id);
        if (toUpdate.length === 0) return;
        if (!confirm(`${toUpdate.length} ürün güncellenecek. Onaylıyor musunuz?`)) return;

        setSyncing(true);
        const updates = toUpdate.map(m => ({
            id: m.db.id,
            name: m.json.urun_adi,
            price: m.newPrice
        }));

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/batch-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (data.success) {
                alert(`Başarıyla güncellendi: ${data.message}`);
                loadData();
            } else {
                alert('Güncelleme hatası: ' + data.message);
            }
        } catch (err) {
            alert('Hata oluştu');
        } finally {
            setSyncing(false);
        }
    };

    const handleCreateMissing = async () => {
        const missingItems = matchedItems.filter(m => !m.db);
        if (missingItems.length === 0) return alert('Eklenecek eksik ürün yok.');
        if (!selectedCategory) return alert('Lütfen yeni ürünler için bir kategori seçin.');

        if (!confirm(`${missingItems.length} yeni ürün "${categories.find(c => c.id === selectedCategory)?.name}" kategorisine eklenecek. Onaylıyor musunuz?`)) return;

        setCreating(true);
        const newItems = missingItems.map(m => ({
            name: m.json.urun_adi,
            price: m.json.fiyat,
            description: ''
        }));

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/batch-create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: newItems,
                    restaurantId,
                    categoryId: selectedCategory
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`İşlem tamamamlandı: ${data.message}`);
                loadData();
            } else {
                alert('Hata: ' + data.message);
            }
        } catch (err) {
            alert('Bağlantı hatası');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Ürün Eşleştirme ve Fiyat Güncelleme</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/admin/dashboard')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Geri Dön
                        </button>
                        <button
                            onClick={loadData}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                            disabled={loading}
                        >
                            {loading ? 'Yükleniyor...' : <><FaSync /> Listeyi Yükle & Eşleştir</>}
                        </button>
                    </div>
                </div>

                {matchedItems.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="font-semibold text-gray-700">Bulunan Eşleşmeler ({matchedItems.length})</div>

                            <div className="flex gap-2 items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                                <span className="text-xs font-bold text-gray-500 uppercase">Eksikler İçin Kategori:</span>
                                <select
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:border-blue-500 outline-none"
                                >
                                    {!selectedCategory && <option value="">Seçiniz...</option>}
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>

                                <button
                                    onClick={handleCreateMissing}
                                    disabled={creating || matchedItems.filter(m => !m.db).length === 0}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
                                >
                                    <FaPlusCircle />
                                    {creating ? 'Ekleniyor...' : `Eksikleri Ekle (${matchedItems.filter(m => !m.db).length})`}
                                </button>

                                <div className="w-px h-8 bg-gray-300 mx-2"></div>

                                <button
                                    onClick={handleSync}
                                    disabled={syncing || matchedItems.filter(m => m.db).length === 0}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
                                >
                                    <FaSave />
                                    {syncing ? 'Güncelleniyor...' : `Güncelle (${matchedItems.filter(m => m.db).length})`}
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-800 text-white uppercase font-bold text-xs sticky top-0">
                                    <tr>
                                        <th className="p-4">JSON Ürün (Yeni)</th>
                                        <th className="p-4">DB Eşleşmesi (Mevcut)</th>
                                        <th className="p-4">Fiyat Değişimi</th>
                                        <th className="p-4 text-center">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {matchedItems.map((item, idx) => (
                                        <tr key={idx} className={`hover:bg-gray-50 transition-colors ${!item.db ? 'bg-red-50' : item.db.price !== item.newPrice ? 'bg-yellow-50/50' : ''}`}>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800 text-base">{item.json.urun_adi}</div>
                                                <div className="text-xs text-blue-600 font-mono mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded">{item.newPrice} {item.json.para_birimi}</div>
                                            </td>
                                            <td className="p-4">
                                                {item.db ? (
                                                    <div>
                                                        <div className="font-semibold text-gray-700">{item.db.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono mt-1">
                                                            ID: {item.db.id.split('-')[0]}...
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-red-500 italic text-xs flex items-center gap-1"><FaExclamationTriangle /> Eşleşme Bulunamadı</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {item.db ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="line-through text-gray-400 text-xs">{item.db.price}₺</span>
                                                        <span className="text-gray-300">→</span>
                                                        <span className={`font-bold font-mono text-lg ${item.newPrice > item.db.price ? 'text-green-600' : item.newPrice < item.db.price ? 'text-red-600' : 'text-gray-600'}`}>
                                                            {item.newPrice}₺
                                                        </span>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                {item.db ? (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.db.price !== item.newPrice || item.db.name !== item.json.urun_adi ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                        {item.db.price !== item.newPrice || item.db.name !== item.json.urun_adi ? 'GÜNCELLENECEK' : 'GÜNCEL'}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200 animate-pulse">
                                                        EKSİK (EKLENECEK)
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!loading && matchedItems.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 text-3xl">
                            <FaSync />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Veri Yükleme</h3>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            Kroren fiyat listesini yerel dosyadan (fiyat_listesi.json) yüklemek ve veritabanı ile karşılaştırmak için yukarıdaki butonu kullanın.
                        </p>
                        <button
                            onClick={loadData}
                            className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg transition-transform active:scale-95"
                        >
                            Listeyi Yükle
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
