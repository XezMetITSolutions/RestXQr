'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export default function StationDebugPage() {
    const { authenticatedRestaurant } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [selectedStation, setSelectedStation] = useState('kavurma');
    const [result, setResult] = useState<any>(null);

    const restaurantId = authenticatedRestaurant?.id;

    const loadMenuItems = async () => {
        if (!restaurantId) return;

        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/${restaurantId}/menu/items`);
            const data = await response.json();
            if (data.success) {
                setMenuItems(data.data || []);
            }
        } catch (error) {
            console.error('Error loading items:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (itemId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const updateSelectedItems = async () => {
        if (selectedItems.size === 0) {
            alert('Lütfen en az bir ürün seçin');
            return;
        }

        setLoading(true);
        const results: any[] = [];

        try {
            for (const itemId of Array.from(selectedItems)) {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/${restaurantId}/menu/items/${itemId}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ kitchenStation: selectedStation })
                    }
                );
                const data = await response.json();
                results.push({ itemId, success: data.success, data });
            }

            setResult({
                success: true,
                updated: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                results
            });

            // Reload items
            await loadMenuItems();
            setSelectedItems(new Set());

            alert(`✅ ${results.filter(r => r.success).length} ürün güncellendi!`);
        } catch (error) {
            setResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
            alert('❌ Hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (restaurantId) {
            loadMenuItems();
        }
    }, [restaurantId]);

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">🔧 İstasyon Toplu Güncelleme</h1>
                <p className="text-gray-600">Ürünleri seçip istasyon atayın</p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">İstasyon Seç:</label>
                        <select
                            value={selectedStation}
                            onChange={(e) => setSelectedStation(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="kavurma">🍖 Kavurma</option>
                            <option value="ramen">🍜 Ramen</option>
                            <option value="manti">🥟 Mantı</option>
                        </select>
                    </div>
                    <button
                        onClick={updateSelectedItems}
                        disabled={loading || selectedItems.size === 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded"
                    >
                        {loading ? '⏳ Güncelleniyor...' : `✅ Seçilenleri Güncelle (${selectedItems.size})`}
                    </button>
                    <button
                        onClick={loadMenuItems}
                        disabled={loading}
                        className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded"
                    >
                        🔄 Yenile
                    </button>
                </div>
            </div>

            {/* Menu Items Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">
                        📋 Menü Ürünleri ({menuItems.length})
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedItems(new Set(menuItems.map(i => i.id)))}
                            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                        >
                            Tümünü Seç
                        </button>
                        <button
                            onClick={() => setSelectedItems(new Set())}
                            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                        >
                            Seçimi Temizle
                        </button>
                    </div>
                </div>

                <div className="overflow-auto max-h-[600px]">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="p-3 text-left w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.size === menuItems.length && menuItems.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItems(new Set(menuItems.map(i => i.id)));
                                            } else {
                                                setSelectedItems(new Set());
                                            }
                                        }}
                                        className="w-4 h-4"
                                    />
                                </th>
                                <th className="p-3 text-left">Ürün Adı</th>
                                <th className="p-3 text-left">Kategori</th>
                                <th className="p-3 text-left">Fiyat</th>
                                <th className="p-3 text-left">Mevcut İstasyon</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`border-b hover:bg-gray-50 cursor-pointer ${selectedItems.has(item.id) ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => toggleItem(item.id)}
                                >
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item.id)}
                                            onChange={() => toggleItem(item.id)}
                                            className="w-4 h-4"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </td>
                                    <td className="p-3 font-medium">{item.name}</td>
                                    <td className="p-3 text-gray-600">{item.category?.name || '-'}</td>
                                    <td className="p-3">{item.price} ₺</td>
                                    <td className="p-3">
                                        {item.kitchenStation ? (
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                                {item.kitchenStation}
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                                Atanmamış
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Result */}
            {result && (
                <div className={`mt-6 p-4 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="font-semibold mb-2">
                        {result.success ? `✅ ${result.updated} ürün güncellendi` : '❌ Hata oluştu'}
                    </div>
                    {result.failed > 0 && (
                        <div className="text-sm text-red-600">
                            ⚠️ {result.failed} ürün güncellenemedi
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
