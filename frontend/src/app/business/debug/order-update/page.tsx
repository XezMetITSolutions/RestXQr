'use client';

import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function OrderUpdateDebug() {
    const { authenticatedRestaurant, authenticatedStaff } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [editedItems, setEditedItems] = useState<any[]>([]);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
        console.log(message);
    };

    const loadOrders = async () => {
        try {
            setLoading(true);
            addLog('🔄 Siparişler yükleniyor...');

            const restaurantId = authenticatedRestaurant?.id || authenticatedStaff?.restaurantId;
            if (!restaurantId) {
                addLog('❌ Restaurant ID bulunamadı');
                return;
            }

            addLog(`📍 Restaurant ID: ${restaurantId}`);

            const response = await apiService.getOrders(restaurantId, 'pending,preparing,ready');

            if (response.success && response.data) {
                setOrders(response.data);
                addLog(`✅ ${response.data.length} sipariş yüklendi`);
            } else {
                addLog('❌ Sipariş yüklenemedi');
            }
        } catch (error: any) {
            addLog(`❌ Hata: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const selectOrder = (order: any) => {
        setSelectedOrder(order);
        setEditedItems(order.items || []);
        addLog(`✅ Sipariş seçildi: ${order.id}`);
        addLog(`📦 Ürün sayısı: ${order.items?.length || 0}`);
    };

    const removeItem = (itemId: string) => {
        const newItems = editedItems.filter(item => item.id !== itemId);
        setEditedItems(newItems);
        addLog(`🗑️ Ürün silindi (local): ${itemId}`);
        addLog(`📦 Kalan ürün sayısı: ${newItems.length}`);
    };

    const updateOrder = async () => {
        try {
            if (!selectedOrder) {
                addLog('❌ Sipariş seçilmedi');
                return;
            }

            setLoading(true);
            addLog('🔄 Sipariş güncelleniyor...');
            addLog(`📋 Order ID: ${selectedOrder.id}`);
            addLog(`📦 Güncellenecek ürün sayısı: ${editedItems.length}`);

            const newTotal = editedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            addLog(`💰 Yeni toplam: ${newTotal}₺`);

            const itemsForApi = editedItems.map(item => ({
                menuItemId: item.id,
                id: item.id,
                name: typeof item.name === 'string' ? item.name : item.name?.tr || item.name?.en || 'Ürün',
                quantity: item.quantity,
                price: item.price,
                unitPrice: item.price,
                notes: item.notes || ''
            }));

            addLog('📤 Backend\'e gönderilecek data:');
            addLog(JSON.stringify({ items: itemsForApi, totalAmount: newTotal }, null, 2));

            const response = await apiService.updateOrder(selectedOrder.id, {
                items: itemsForApi,
                totalAmount: newTotal
            });

            addLog('📥 Backend yanıtı:');
            addLog(JSON.stringify(response, null, 2));

            if (response.success) {
                addLog('✅ Sipariş başarıyla güncellendi!');
                await loadOrders();
                setSelectedOrder(null);
                setEditedItems([]);
            } else {
                addLog('❌ Sipariş güncellenemedi');
            }
        } catch (error: any) {
            addLog(`❌ Hata: ${error.message}`);
            if (error.stack) {
                addLog(`Stack: ${error.stack}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Sipariş Güncelleme Debug</h1>

                <div className="grid grid-cols-2 gap-8">
                    {/* Sol panel - Siparişler */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Siparişler</h2>
                            <button
                                onClick={loadOrders}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Yükleniyor...' : 'Yenile'}
                            </button>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    onClick={() => selectOrder(order)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedOrder?.id === order.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-semibold">Masa {order.tableNumber}</span>
                                            <span className="text-sm text-gray-600 ml-2">{order.status}</span>
                                        </div>
                                        <span className="font-bold text-green-600">{order.totalAmount}₺</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {order.items?.length || 0} ürün
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        ID: {order.id}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sağ panel - Sipariş detayı */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedOrder ? `Sipariş: ${selectedOrder.id}` : 'Sipariş Seçilmedi'}
                        </h2>

                        {selectedOrder && (
                            <div>
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-gray-600">Masa: {selectedOrder.tableNumber}</div>
                                    <div className="text-sm text-gray-600">Status: {selectedOrder.status}</div>
                                    <div className="text-sm text-gray-600">
                                        Toplam: {editedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}₺
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <h3 className="font-semibold">Ürünler:</h3>
                                    {editedItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium">
                                                    {typeof item.name === 'string' ? item.name : item.name?.tr || item.name?.en || 'Ürün'}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {item.quantity}x @ {item.price}₺ = {(item.quantity * item.price).toFixed(2)}₺
                                                </div>
                                                <div className="text-xs text-gray-400">ID: {item.id}</div>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={updateOrder}
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
                                >
                                    {loading ? 'Güncelleniyor...' : 'Siparişi Güncelle'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Log paneli */}
                <div className="mt-8 bg-black text-green-400 rounded-lg shadow p-6 font-mono text-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Debug Logs</h2>
                        <button
                            onClick={() => setLogs([])}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                        >
                            Temizle
                        </button>
                    </div>
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                        {logs.length === 0 ? (
                            <div className="text-gray-500">Log mesajı yok...</div>
                        ) : (
                            logs.map((log, idx) => (
                                <div key={idx} className="whitespace-pre-wrap">{log}</div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
