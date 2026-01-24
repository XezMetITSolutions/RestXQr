'use client';

import { useState, useEffect } from 'react';
import { useRestaurantStore } from '@/store/useRestaurantStore';
import { useAuthStore } from '@/store/useAuthStore';
import { FaBug, FaSave, FaSync, FaExclamationTriangle, FaCheckCircle, FaSearch } from 'react-icons/fa';

export default function ProductCheckerPage() {
    const {
        currentRestaurant,
        categories,
        menuItems,
        fetchRestaurantMenu,
        fetchCurrentRestaurant,
        updateMenuItem,
        loading: storeLoading
    } = useRestaurantStore();

    const { authenticatedRestaurant, initializeAuth } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStation, setFilterStation] = useState<string>('all');
    const [items, setItems] = useState<any[]>([]);
    const [saving, setSaving] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Initialize auth
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    // Initial load
    useEffect(() => {
        const loadInitialData = async () => {
            const restaurantId = currentRestaurant?.id || authenticatedRestaurant?.id;

            if (restaurantId) {
                console.log('ProductChecker: Starting load for restaurant:', restaurantId);
                setLoading(true);
                try {
                    // Fetch both menu and restaurant details (for kitchenStations)
                    await Promise.all([
                        fetchRestaurantMenu(restaurantId),
                        fetchCurrentRestaurant(restaurantId)
                    ]);
                    console.log('ProductChecker: Load complete');
                } catch (error) {
                    console.error('ProductChecker: Error during load:', error);
                    setMessage({ type: 'error', text: 'Veriler yüklenirken hata oluştu' });
                } finally {
                    setLoading(false);
                }
            } else {
                console.warn('ProductChecker: No restaurant ID available yet');
            }
        };
        loadInitialData();
    }, [currentRestaurant?.id, authenticatedRestaurant?.id, fetchRestaurantMenu, fetchCurrentRestaurant]);

    // Sync local items when store items change
    useEffect(() => {
        console.log('ProductChecker: Store menuItems updated, count:', menuItems?.length);
        setItems(menuItems || []);
    }, [menuItems]);

    const handleUpdateItem = async (itemId: string, updates: any) => {
        const restaurantId = currentRestaurant?.id || authenticatedRestaurant?.id;
        if (!restaurantId) return;

        const existingItem = items.find(i => i.id === itemId);
        if (!existingItem) return;

        setSaving(itemId);
        try {
            await updateMenuItem(restaurantId, itemId, { ...existingItem, ...updates });
            setMessage({ type: 'success', text: 'Ürün başarıyla güncellendi' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Update error:', error);
            setMessage({ type: 'error', text: 'Güncelleme sırasında hata oluştu' });
        } finally {
            setSaving(null);
        }
    };

    const handleCategoryChange = (itemId: string, categoryId: string) => {
        handleUpdateItem(itemId, { categoryId });
    };

    const handleStationChange = (itemId: string, kitchenStation: string) => {
        handleUpdateItem(itemId, { kitchenStation });
    };

    const handleDescriptionChange = (itemId: string, description: string) => {
        handleUpdateItem(itemId, { description });
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || item.categoryId === filterCategory;
        const matchesStation = filterStation === 'all' ||
            (filterStation === 'none' ? !item.kitchenStation : item.kitchenStation === filterStation);

        return matchesSearch && matchesCategory && matchesStation;
    });

    const kitchenStations = currentRestaurant?.kitchenStations || authenticatedRestaurant?.kitchenStations || [];

    // Sort items by category name for better readability
    const sortedItems = [...filteredItems].sort((a, b) => {
        const catA = categories.find(c => c.id === a.categoryId)?.name || '';
        const catB = categories.find(c => c.id === b.categoryId)?.name || '';
        if (catA < catB) return -1;
        if (catA > catB) return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FaBug className="text-3xl text-red-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Ürün & İstasyon Denetçisi</h1>
                                <p className="text-gray-600">Ürünlerin kategorilerini ve mutfak istasyonlarını kontrol edin ve düzeltin</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const id = currentRestaurant?.id || authenticatedRestaurant?.id;
                                if (id) fetchRestaurantMenu(id);
                            }}
                            disabled={loading || storeLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        >
                            <FaSync className={loading || storeLoading ? 'animate-spin' : ''} />
                            Yenile
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Ürün ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="all">Tüm Kategoriler</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <select
                            value={filterStation}
                            onChange={(e) => setFilterStation(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="all">Tüm İstasyonlar</option>
                            <option value="none">İstasyon Atanmamış</option>
                            {kitchenStations.map((station: any) => (
                                <option key={station.id} value={station.id}>{station.emoji} {station.name}</option>
                            ))}
                        </select>

                        <div className="flex items-center text-sm text-gray-500">
                            Toplam {sortedItems.length} ürün gösteriliyor
                        </div>
                    </div>
                </div>

                {/* Notification */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        {message.text}
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-700">Ürün Adı</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Kategori</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Ürün Açıklaması</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Mutfak İstasyonu</th>
                                <th className="px-6 py-4 font-bold text-gray-700">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <FaSync className="animate-spin text-2xl text-blue-500" />
                                            <span>Yükleniyor...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : sortedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Ürün bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                sortedItems.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{item.name}</div>
                                            <div className="text-xs text-gray-500 font-mono">{item.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={item.categoryId}
                                                onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                                                disabled={saving === item.id}
                                                className="w-full px-3 py-1.5 border rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <textarea
                                                value={item.description || ''}
                                                onChange={(e) => {
                                                    // Local update for responsiveness
                                                    const newItems = items.map(i =>
                                                        i.id === item.id ? { ...i, description: e.target.value } : i
                                                    );
                                                    setItems(newItems);
                                                }}
                                                onBlur={(e) => handleDescriptionChange(item.id, e.target.value)}
                                                disabled={saving === item.id}
                                                rows={2}
                                                className="w-full px-3 py-1.5 border rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                                                placeholder="Ürün açıklaması..."
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={item.kitchenStation || ''}
                                                onChange={(e) => handleStationChange(item.id, e.target.value)}
                                                disabled={saving === item.id}
                                                className={`w-full px-3 py-1.5 border rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none ${!item.kitchenStation ? 'border-yellow-300 bg-yellow-50' : ''
                                                    }`}
                                            >
                                                <option value="">İstasyon Seçin...</option>
                                                {kitchenStations.map((station: any) => (
                                                    <option key={station.id} value={station.id}>
                                                        {station.emoji} {station.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            {saving === item.id ? (
                                                <div className="flex items-center gap-2 text-blue-600 text-sm">
                                                    <FaSync className="animate-spin" />
                                                    Kaydediliyor...
                                                </div>
                                            ) : !item.kitchenStation ? (
                                                <div className="flex items-center gap-2 text-yellow-600 text-sm">
                                                    <FaExclamationTriangle />
                                                    İstasyon Eksik
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-green-600 text-sm">
                                                    <FaCheckCircle />
                                                    Hazır
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Info Box */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <FaBug className="text-blue-600" />
                        Nasıl Kullanılır?
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                        <li>Herhangi bir dropdown değerini değiştirdiğinizde, değişiklik <strong>anında</strong> kaydedilir.</li>
                        <li><strong>İstasyon Eksik</strong> uyarısı veren ürünler, mutfak ekranında görünmeyebilir veya fişleri çıkmayabilir.</li>
                        <li>Kategori değişikliği yaparken, yeni kategorinin varsayılan istasyonunun bu ürüne de atanacağını unutmayın.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
