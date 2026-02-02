'use client';

import { useState, useEffect } from 'react';
import { FaSync, FaTrash, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

interface MenuItem {
    id: string;
    name: string;
    categoryId: string;
    categoryName?: string;
    price: number;
    isAvailable: boolean;
    isDeleted?: boolean;
    deletedAt?: string;
}

interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    restaurantId: string;
    created_at: string;
    menuItemId?: string;
}

interface ComparisonResult {
    menuItem: MenuItem | null;
    inventoryItem: InventoryItem | null;
    status: 'matched' | 'menu_only' | 'inventory_only' | 'deleted_but_in_inventory';
}

interface LogItem {
    time: string;
    type: 'info' | 'error' | 'success';
    message: string;
    data?: any;
}

export default function LeventKrorenDebugPage() {
    const [restaurantId, setRestaurantId] = useState('5'); // Default 5
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [comparison, setComparison] = useState<ComparisonResult[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [logs, setLogs] = useState<LogItem[]>([]);

    const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info', data?: any) => {
        setLogs(prev => [{
            time: new Date().toLocaleTimeString(),
            type,
            message,
            data
        }, ...prev]);
    };

    useEffect(() => {
        // Attempt to auto-detect ID from localStorage if possible
        const storedUser = localStorage.getItem('staff_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user.restaurantId) {
                    addLog(`Restoran ID localStorage'dan algılandı: ${user.restaurantId}`, 'success');
                    setRestaurantId(user.restaurantId);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    useEffect(() => {
        if (menuItems.length > 0 || inventoryItems.length > 0) {
            compareData();
        }
    }, [menuItems, inventoryItems]);

    const fetchData = async () => {
        setLoading(true);
        setLogs([]); // Clear logs on new fetch
        addLog('Veri çekme işlemi başlatıldı...', 'info');

        // Auth Token Kontrolü
        const token = localStorage.getItem('staff_token');
        if (!token) {
            addLog('UYARI: Token bulunamadı. Staff girişi yapmamış olabilirsiniz. Bazı endpointler çalışmayabilir.', 'error');
        } else {
            addLog('Token bulundu, istekler yetkilendirilmiş olarak gönderilecek.', 'success');
        }

        await Promise.all([fetchMenuItems(token), fetchInventoryItems(token)]);
        setLoading(false);
    };

    const getHeaders = (token: string | null) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };

    const fetchMenuItems = async (token: string | null) => {
        try {
            const url = `${API_URL}/restaurants/${restaurantId}/menu`;
            addLog(`Menü isteği gönderiliyor: ${url}`, 'info');

            const response = await fetch(url, {
                headers: getHeaders(token)
            });

            if (!response.ok) {
                throw new Error(`HTTP Hata: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                const items: MenuItem[] = [];

                // 1. Check categorized structure
                const categories = data.data?.categories || [];
                categories.forEach((cat: any) => {
                    if (cat.items && Array.isArray(cat.items)) {
                        cat.items.forEach((item: any) => {
                            items.push({
                                id: item.id,
                                name: item.name,
                                categoryId: cat.id,
                                categoryName: cat.name,
                                price: Number(item.price) || 0,
                                isAvailable: item.isAvailable !== false,
                                isDeleted: item.isDeleted || false,
                                deletedAt: item.deletedAt
                            });
                        });
                    }
                });

                // 2. Check flat items array (some APIs return data.data.items directly)
                if (data.data?.items && Array.isArray(data.data.items)) {
                    data.data.items.forEach((item: any) => {
                        if (!items.find(i => i.id === item.id)) {
                            items.push({
                                id: item.id,
                                name: item.name,
                                categoryId: item.categoryId,
                                categoryName: item.category?.name,
                                price: Number(item.price) || 0,
                                isAvailable: item.isAvailable !== false,
                                isDeleted: item.isDeleted || false,
                                deletedAt: item.deletedAt
                            });
                        }
                    });
                }

                // 3. Check menuItems array (another possible structure)
                if (data.data?.menuItems && Array.isArray(data.data.menuItems)) {
                    data.data.menuItems.forEach((item: any) => {
                        if (!items.find(i => i.id === item.id)) {
                            items.push({
                                id: item.id,
                                name: item.name,
                                categoryId: item.categoryId,
                                categoryName: item.category?.name,
                                price: Number(item.price) || 0,
                                isAvailable: item.isAvailable !== false,
                                isDeleted: item.isDeleted || false,
                                deletedAt: item.deletedAt
                            });
                        }
                    });
                }

                addLog(`📋 Menüden ${items.length} ürün başarıyla yüklendi`, 'success');
                setMenuItems(items);
            } else {
                addLog(`Menü API başarısız: ${data.message}`, 'error', data);
            }
        } catch (error: any) {
            addLog(`Menü yükleme hatası: ${error.message}`, 'error');
            console.error('Menü yükleme hatası:', error);
        }
    };

    const fetchInventoryItems = async (token: string | null) => {
        try {
            const url = `${API_URL}/inventory?restaurantId=${restaurantId}`;
            addLog(`Stok isteği gönderiliyor: ${url}`, 'info');

            const response = await fetch(url, {
                headers: getHeaders(token)
            });

            if (!response.ok) {
                throw new Error(`HTTP Hata: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                addLog(`📦 Stoktan ${data.data.length} ürün başarıyla yüklendi`, 'success');
                setInventoryItems(data.data);
            } else {
                addLog(`Stok API başarısız veya veri yok`, 'error', data);
                setInventoryItems([]);
            }
        } catch (error: any) {
            addLog(`Stok yükleme hatası: ${error.message}`, 'error');
            console.error('Stok yükleme hatası:', error);
        }
    };

    const compareData = () => {
        const results: ComparisonResult[] = [];
        const processedInventoryIds = new Set<string>();

        menuItems.forEach(menuItem => {
            const matchedInventory = inventoryItems.find(
                inv =>
                    inv.menuItemId === menuItem.id ||
                    inv.name.toLowerCase().trim() === menuItem.name.toLowerCase().trim()
            );

            if (matchedInventory) {
                processedInventoryIds.add(matchedInventory.id);
            }

            let status: ComparisonResult['status'] = 'menu_only';

            if (matchedInventory) {
                if (menuItem.isDeleted || !menuItem.isAvailable) {
                    status = 'deleted_but_in_inventory';
                } else {
                    status = 'matched';
                }
            }

            results.push({
                menuItem,
                inventoryItem: matchedInventory || null,
                status
            });
        });

        inventoryItems.forEach(invItem => {
            if (!processedInventoryIds.has(invItem.id)) {
                results.push({
                    menuItem: null,
                    inventoryItem: invItem,
                    status: 'inventory_only'
                });
            }
        });

        addLog(`Karşılaştırma tamamlandı. Toplam: ${results.length} sonuç`, 'success');
        setComparison(results);
    };

    const deleteInventoryItem = async (inventoryId: string) => {
        if (!inventoryId) return;

        const item = inventoryItems.find(i => i.id === inventoryId);
        if (!item) return;

        if (!confirm(`"${item.name}" ürününü stoktan silmek istediğinize emin misiniz?`)) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('staff_token');
            const url = `${API_URL}/inventory/${inventoryId}`;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: getHeaders(token)
            });

            const data = await response.json();

            if (data.success) {
                addLog(`✅ "${item.name}" stoktan silindi`, 'success');
                // Listeyi güncelle - kısa bir bekleme ile
                setTimeout(() => fetchData(), 500);
            } else {
                addLog(`Silme başarısız: ${data.message}`, 'error');
                setLoading(false);
            }
        } catch (error: any) {
            addLog(`Silme hatası: ${error.message}`, 'error');
            setLoading(false);
        }
    };

    const filteredComparison = comparison.filter(item => {
        if (filterStatus === 'all') return true;
        return item.status === filterStatus;
    });

    const getStatusBadge = (status: ComparisonResult['status']) => {
        switch (status) {
            case 'matched':
                return (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <FaCheckCircle /> Eşleşti
                    </span>
                );
            case 'menu_only':
                return (
                    <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        <FaCheckCircle /> Sadece Menüde
                    </span>
                );
            case 'inventory_only':
                return (
                    <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        <FaExclamationTriangle /> Sadece Stokta
                    </span>
                );
            case 'deleted_but_in_inventory':
                return (
                    <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        <FaTimesCircle /> Menüden Silinmiş Ama Stokta Var!
                    </span>
                );
        }
    };

    const getStatusColor = (status: ComparisonResult['status']) => {
        switch (status) {
            case 'matched':
                return 'border-l-4 border-green-500';
            case 'menu_only':
                return 'border-l-4 border-blue-500';
            case 'inventory_only':
                return 'border-l-4 border-purple-500';
            case 'deleted_but_in_inventory':
                return 'border-l-4 border-red-500';
        }
    };

    const stats = {
        total: comparison.length,
        matched: comparison.filter(r => r.status === 'matched').length,
        menuOnly: comparison.filter(r => r.status === 'menu_only').length,
        inventoryOnly: comparison.filter(r => r.status === 'inventory_only').length,
        deletedButInInventory: comparison.filter(r => r.status === 'deleted_but_in_inventory').length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                🍜 Levent Kroren - Debug & Fix Sayfası
                            </h1>
                            <p className="text-gray-600">
                                Menü ve Stok karşılaştrıması - Özellikle "Test" veya silinmiş ürünleri stoktan temizlemek için kullanın.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Restoran ID:</label>
                                <input
                                    type="text"
                                    value={restaurantId}
                                    onChange={(e) => setRestaurantId(e.target.value)}
                                    className="border border-gray-300 rounded px-3 py-1 w-20 text-center"
                                />
                            </div>
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <FaSync className={loading ? 'animate-spin' : ''} />
                                Yenile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Console Logs Display */}
                {logs.length > 0 && (
                    <div className="bg-gray-800 rounded-lg shadow p-4 mb-6 text-white font-mono text-xs max-h-40 overflow-y-auto">
                        <div className="font-bold border-b border-gray-600 pb-1 mb-2 sticky top-0 bg-gray-800">📋 İşlem Günlüğü (Logs)</div>
                        {logs.map((log, i) => (
                            <div key={i} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-300'}`}>
                                <span className="opacity-50">[{log.time}]</span> {log.message} {log.data ? JSON.stringify(log.data) : ''}
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-sm text-gray-600 mb-1">Toplam</div>
                        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    </div>

                    <div className="bg-green-50 rounded-lg shadow p-4 border-l-4 border-green-500">
                        <div className="text-sm text-green-700 mb-1">Eşleşen</div>
                        <div className="text-2xl font-bold text-green-900">{stats.matched}</div>
                    </div>

                    <div className="bg-blue-50 rounded-lg shadow p-4 border-l-4 border-blue-500">
                        <div className="text-sm text-blue-700 mb-1">Sadece Menüde</div>
                        <div className="text-2xl font-bold text-blue-900">{stats.menuOnly}</div>
                    </div>

                    <div className="bg-purple-50 rounded-lg shadow p-4 border-l-4 border-purple-500">
                        <div className="text-sm text-purple-700 mb-1">Sadece Stokta</div>
                        <div className="text-2xl font-bold text-purple-900">{stats.inventoryOnly}</div>
                    </div>

                    <div className="bg-red-50 rounded-lg shadow p-4 border-l-4 border-red-500">
                        <div className="text-sm text-red-700 mb-1">⚠️ Sorunlu</div>
                        <div className="text-2xl font-bold text-red-900">{stats.deletedButInInventory}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all'
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Tümü ({stats.total})
                        </button>
                        <button
                            onClick={() => setFilterStatus('matched')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'matched'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                }`}
                        >
                            Eşleşen ({stats.matched})
                        </button>
                        <button
                            onClick={() => setFilterStatus('menu_only')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'menu_only'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                }`}
                        >
                            Sadece Menüde ({stats.menuOnly})
                        </button>
                        <button
                            onClick={() => setFilterStatus('inventory_only')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'inventory_only'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                                }`}
                        >
                            Sadece Stokta ({stats.inventoryOnly})
                        </button>
                        <button
                            onClick={() => setFilterStatus('deleted_but_in_inventory')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'deleted_but_in_inventory'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                                }`}
                        >
                            ⚠️ Sorunlu ({stats.deletedButInInventory})
                        </button>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Durum
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ürün Adı
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fiyat
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Menü Durumu
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stok Miktarı
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IDs
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        İşlem
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <FaSync className="animate-spin text-blue-600" />
                                                <span className="text-gray-600">Yükleniyor...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredComparison.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            Bu filtre için sonuç bulunamadı.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredComparison.map((item, index) => (
                                        <tr key={index} className={`hover:bg-gray-50 ${getStatusColor(item.status)}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {item.menuItem?.name || item.inventoryItem?.name || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {item.menuItem?.categoryName || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.menuItem?.price ? `€${item.menuItem.price.toFixed(2)}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.menuItem ? (
                                                    <div className="space-y-1">
                                                        <div className={`text-xs px-2 py-1 rounded inline-block ${item.menuItem.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-300 text-gray-700'
                                                            }`}>
                                                            {item.menuItem.isAvailable ? 'Aktif' : 'Devre Dışı'}
                                                        </div>
                                                        {item.menuItem.isDeleted && (
                                                            <div className="text-xs px-2 py-1 rounded inline-block bg-red-100 text-red-800 ml-1">
                                                                Silinmiş
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.inventoryItem ? (
                                                    <span className="font-medium">{item.inventoryItem.quantity}</span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                {item.menuItem && (
                                                    <div>Menu: {item.menuItem.id}</div>
                                                )}
                                                {item.inventoryItem && (
                                                    <div>Inv: {item.inventoryItem.id}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {item.inventoryItem && (
                                                    <button
                                                        onClick={() => deleteInventoryItem(item.inventoryItem!.id)}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded border border-red-200 transition-colors"
                                                        title="Stoktan Tamamen Sil"
                                                    >
                                                        <span className="flex items-center gap-1">
                                                            <FaTrash /> Sil
                                                        </span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Raw Data View */}
                <details className="bg-white rounded-lg shadow p-6 mt-6">
                    <summary className="font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                        📊 Ham Veri (Developer View)
                    </summary>
                    <div className="mt-4 space-y-4">
                        <div>
                            <h3 className="font-bold mb-2">Menü Items ({menuItems.length}):</h3>
                            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                                {JSON.stringify(menuItems, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2">Inventory Items ({inventoryItems.length}):</h3>
                            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                                {JSON.stringify(inventoryItems, null, 2)}
                            </pre>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
}
