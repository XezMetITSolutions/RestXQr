'use client';

import { useState, useEffect } from 'react';
import { useRestaurantStore } from '@/store/useRestaurantStore';

interface DebugInfo {
    restaurantData: any;
    menuItems: any[];
    categories: any[];
    testUpdateResult: any;
    databaseCheck: any;
}

export default function StationDebugPage() {
    const { currentRestaurant } = useRestaurantStore();
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
    const [testItemId, setTestItemId] = useState('');
    const [testStation, setTestStation] = useState('kavurma');

    const runFullDiagnostic = async () => {
        setLoading(true);
        const info: any = {};

        try {
            // 1. Restaurant Data
            console.log('🔍 Step 1: Fetching restaurant data...');
            const restaurantRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/${currentRestaurant?.id}`);
            const restaurantData = await restaurantRes.json();
            info.restaurantData = restaurantData;
            console.log('Restaurant data:', restaurantData);

            // 2. Menu Items
            console.log('🔍 Step 2: Fetching menu items...');
            const itemsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/${currentRestaurant?.id}/menu/items`);
            const itemsData = await itemsRes.json();
            info.menuItems = itemsData.data || [];
            console.log('Menu items:', itemsData);

            // 3. Categories
            console.log('🔍 Step 3: Fetching categories...');
            const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/${currentRestaurant?.id}/menu/categories`);
            const categoriesData = await categoriesRes.json();
            info.categories = categoriesData.data || [];
            console.log('Categories:', categoriesData);

            // 4. Database Column Check
            console.log('🔍 Step 4: Checking database column...');
            try {
                const dbCheckRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/debug/add-kitchen-station`, {
                    method: 'POST'
                });
                const dbCheckData = await dbCheckRes.json();
                info.databaseCheck = dbCheckData;
                console.log('Database check:', dbCheckData);
            } catch (e) {
                info.databaseCheck = { error: 'Endpoint not available' };
            }

            setDebugInfo(info);
        } catch (error) {
            console.error('Diagnostic error:', error);
            setDebugInfo({ ...info, error: error instanceof Error ? error.message : 'Unknown error' });
        } finally {
            setLoading(false);
        }
    };

    const testUpdate = async () => {
        if (!testItemId) {
            alert('Lütfen bir ürün ID girin');
            return;
        }

        setLoading(true);
        try {
            console.log('🧪 Testing update:', { itemId: testItemId, station: testStation });

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/${currentRestaurant?.id}/menu/items/${testItemId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        kitchenStation: testStation
                    })
                }
            );

            const data = await response.json();
            console.log('Update response:', data);

            setDebugInfo(prev => ({
                ...prev!,
                testUpdateResult: {
                    success: data.success,
                    status: response.status,
                    data: data,
                    timestamp: new Date().toISOString()
                }
            }));

            if (data.success) {
                alert('✅ Test güncelleme başarılı! Sayfayı yenileyin.');
            } else {
                alert('❌ Test güncelleme başarısız: ' + (data.message || data.error));
            }
        } catch (error) {
            console.error('Test update error:', error);
            alert('❌ Hata: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentRestaurant?.id) {
            runFullDiagnostic();
        }
    }, [currentRestaurant?.id]);

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">🔧 İstasyon Debug Paneli</h1>
                <p className="text-gray-600">İstasyonların neden kaydolmadığını tespit edin</p>
            </div>

            <button
                onClick={runFullDiagnostic}
                disabled={loading}
                className="mb-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded"
            >
                {loading ? '🔄 Taranıyor...' : '🔍 Tam Tarama Yap'}
            </button>

            {debugInfo && (
                <div className="space-y-6">
                    {/* Restaurant Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            🏪 Restoran Bilgileri
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div><strong>ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.restaurantData?.data?.id}</code></div>
                            <div><strong>İsim:</strong> {debugInfo.restaurantData?.data?.name}</div>
                            <div><strong>Username:</strong> {debugInfo.restaurantData?.data?.username}</div>
                            <div className="mt-4">
                                <strong>Kitchen Stations:</strong>
                                {debugInfo.restaurantData?.data?.kitchenStations ? (
                                    <pre className="bg-gray-100 p-3 rounded mt-2 overflow-auto text-xs">
                                        {JSON.stringify(debugInfo.restaurantData.data.kitchenStations, null, 2)}
                                    </pre>
                                ) : (
                                    <div className="text-red-600 mt-2">❌ kitchenStations NULL veya tanımsız!</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Database Check */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            💾 Veritabanı Kolon Kontrolü
                        </h2>
                        <div className="space-y-2 text-sm">
                            {debugInfo.databaseCheck?.success ? (
                                <div className="text-green-600">
                                    ✅ {debugInfo.databaseCheck.message}
                                    {debugInfo.databaseCheck.alreadyExists && (
                                        <div className="mt-2 text-gray-600">Kolon zaten mevcut</div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-red-600">
                                    ❌ {debugInfo.databaseCheck?.message || debugInfo.databaseCheck?.error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Menu Items with Stations */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            🍽️ Menü Ürünleri ve İstasyonları
                        </h2>
                        <div className="text-sm mb-4">
                            <strong>Toplam Ürün:</strong> {debugInfo.menuItems?.length || 0}
                        </div>
                        <div className="overflow-auto max-h-96">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left">ID</th>
                                        <th className="p-2 text-left">Ürün Adı</th>
                                        <th className="p-2 text-left">İstasyon</th>
                                        <th className="p-2 text-left">Kategori</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {debugInfo.menuItems?.map((item: any) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">
                                                <code className="text-xs bg-gray-100 px-1 rounded">{item.id.substring(0, 8)}...</code>
                                            </td>
                                            <td className="p-2 font-medium">{item.name}</td>
                                            <td className="p-2">
                                                {item.kitchenStation ? (
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                                        {item.kitchenStation}
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                                        Yok
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-2 text-gray-600">{item.category?.name || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Test Update */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            🧪 Test Güncelleme
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Ürün ID:</label>
                                <input
                                    type="text"
                                    value={testItemId}
                                    onChange={(e) => setTestItemId(e.target.value)}
                                    placeholder="Ürün ID'sini girin"
                                    className="w-full border rounded px-3 py-2 text-sm"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    Yukarıdaki tablodan bir ürün ID'si kopyalayın
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">İstasyon:</label>
                                <select
                                    value={testStation}
                                    onChange={(e) => setTestStation(e.target.value)}
                                    className="w-full border rounded px-3 py-2 text-sm"
                                >
                                    <option value="kavurma">🍖 Kavurma</option>
                                    <option value="ramen">🍜 Ramen</option>
                                    <option value="manti">🥟 Mantı</option>
                                </select>
                            </div>
                            <button
                                onClick={testUpdate}
                                disabled={loading || !testItemId}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded"
                            >
                                {loading ? '⏳ Test Ediliyor...' : '🧪 Test Güncelleme Yap'}
                            </button>

                            {debugInfo.testUpdateResult && (
                                <div className={`p-4 rounded ${debugInfo.testUpdateResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                    <div className="font-semibold mb-2">
                                        {debugInfo.testUpdateResult.success ? '✅ Başarılı' : '❌ Başarısız'}
                                    </div>
                                    <pre className="text-xs overflow-auto">
                                        {JSON.stringify(debugInfo.testUpdateResult, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            📁 Kategoriler ve İstasyonları
                        </h2>
                        <div className="space-y-2">
                            {debugInfo.categories?.map((cat: any) => (
                                <div key={cat.id} className="border rounded p-3">
                                    <div className="font-medium">{cat.name}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        İstasyon: {cat.kitchenStation ? (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                {cat.kitchenStation}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Atanmamış</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Ürün sayısı: {cat.items?.length || 0}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Raw Data */}
                    <details className="bg-white rounded-lg shadow p-6">
                        <summary className="text-xl font-bold cursor-pointer">
                            📊 Ham Veri (Geliştiriciler için)
                        </summary>
                        <pre className="mt-4 bg-gray-100 p-4 rounded overflow-auto text-xs max-h-96">
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
}
