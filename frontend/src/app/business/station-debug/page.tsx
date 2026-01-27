'use client';

import { useState, useEffect } from 'react';

export default function StationDebugPage() {
    const [loading, setLoading] = useState(false);
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [selectedStation, setSelectedStation] = useState('kavurma');
    const [result, setResult] = useState<any>(null);
    const [restaurantId, setRestaurantId] = useState<string>('37b0322a-e11f-4ef1-b108-83be310aaf4d'); // Kroren ID

    useEffect(() => {
        // Try to get restaurant ID from localStorage, fallback to Kroren
        const storedAuth = localStorage.getItem('auth-storage');
        if (storedAuth) {
            try {
                const auth = JSON.parse(storedAuth);
                const restId = auth.state?.authenticatedRestaurant?.id;
                if (restId) {
                    console.log('Found restaurant ID in localStorage:', restId);
                    setRestaurantId(restId);
                } else {
                    console.log('Using hardcoded Kroren ID');
                }
            } catch (e) {
                console.error('Error parsing auth:', e);
                console.log('Using hardcoded Kroren ID');
            }
        } else {
            console.log('No auth in localStorage, using hardcoded Kroren ID');
        }
    }, []);

    const loadMenuItems = async () => {
        if (!restaurantId) {
            console.log('No restaurant ID');
            return;
        }

        setLoading(true);
        try {
            console.log('Loading items for restaurant:', restaurantId);
            const url = `${process.env.NEXT_PUBLIC_API_URL}/restaurants/${restaurantId}/menu/items`;
            console.log('Fetching from:', url);

            const response = await fetch(url);
            const data = await response.json();

            console.log('API Response:', data);

            if (data.success && Array.isArray(data.data)) {
                console.log('Items loaded:', data.data.length);
                setMenuItems(data.data);
            } else {
                console.error('Invalid response:', data);
                setMenuItems([]);
            }
        } catch (error) {
            console.error('Error loading items:', error);
            setMenuItems([]);
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
                console.log('Updating item:', itemId, 'to station:', selectedStation);

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/restaurants/${restaurantId}/menu/items/${itemId}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ kitchenStation: selectedStation })
                    }
                );
                const data = await response.json();

                console.log('Update result:', data);
                results.push({ itemId, success: data.success, data });
            }

            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;

            setResult({
                success: true,
                updated: successCount,
                failed: failCount,
                results
            });

            // Reload items
            await loadMenuItems();
            setSelectedItems(new Set());

            alert(`✅ ${successCount} ürün güncellendi!${failCount > 0 ? ` (${failCount} başarısız)` : ''}`);
        } catch (error) {
            console.error('Update error:', error);
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
                {restaurantId && (
                    <p className="text-xs text-gray-500 mt-2">Restaurant ID: {restaurantId}</p>
                )}
            </div>

            {!restaurantId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
                    <p className="text-yellow-800">⚠️ Restoran ID bulunamadı. Lütfen giriş yapın.</p>
                </div>
            )}

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
                            <option value="icecek1">🥤 1. Kat İçecek</option>
                            <option value="icecek2">🍹 2. Kat İçecek</option>
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

            {/* Loading State */}
            {loading && menuItems.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-600">⏳ Ürünler yükleniyor...</div>
                </div>
            )}

            {/* Empty State */}
            {!loading && menuItems.length === 0 && restaurantId && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-600 mb-4">📭 Ürün bulunamadı</div>
                    <button
                        onClick={loadMenuItems}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        🔄 Tekrar Dene
                    </button>
                </div>
            )}

            {/* Menu Items Table */}
            {menuItems.length > 0 && (
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
            )}

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

            {/* Debug Console */}
            <details className="mt-6 bg-gray-100 rounded p-4">
                <summary className="cursor-pointer font-semibold">🐛 Debug Console</summary>
                <div className="mt-4 space-y-2 text-xs">
                    <div><strong>Restaurant ID:</strong> {restaurantId || 'Yok'}</div>
                    <div><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</div>
                    <div><strong>Items Count:</strong> {menuItems.length}</div>
                    <div><strong>Selected Count:</strong> {selectedItems.size}</div>
                    <div><strong>Loading:</strong> {loading ? 'Evet' : 'Hayır'}</div>
                </div>
            </details>
        </div>
    );
}
