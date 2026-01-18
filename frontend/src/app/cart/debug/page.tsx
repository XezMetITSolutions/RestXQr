'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store';
import { FaBug, FaTrash, FaSync, FaShoppingCart, FaClock, FaCheckCircle } from 'react-icons/fa';

export default function CartDebugPage() {
    const cart = useCartStore();
    const [localStorageData, setLocalStorageData] = useState<any>(null);
    const [pendingOrderData, setPendingOrderData] = useState<any>(null);
    const [sessionData, setSessionData] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
    };

    useEffect(() => {
        loadAllData();
        addLog('Cart Debug sayfası yüklendi');
    }, []);

    const loadAllData = () => {
        try {
            // Cart localStorage
            const cartData = localStorage.getItem('cart-storage');
            if (cartData) {
                setLocalStorageData(JSON.parse(cartData));
                addLog('✅ Cart localStorage yüklendi');
            } else {
                setLocalStorageData(null);
                addLog('⚠️ Cart localStorage boş');
            }

            // Pending order data
            const pendingOrderId = localStorage.getItem('pending_order_id');
            const pendingOrderItems = localStorage.getItem('pending_order_items');
            setPendingOrderData({
                orderId: pendingOrderId,
                items: pendingOrderItems ? JSON.parse(pendingOrderItems) : null
            });
            if (pendingOrderId) {
                addLog(`📋 Pending Order ID: ${pendingOrderId}`);
            }

            // Session data
            const sessionKey = sessionStorage.getItem('session_key');
            const clientId = sessionStorage.getItem('client_id');
            setSessionData({
                sessionKey,
                clientId
            });
            if (sessionKey) {
                addLog(`🔑 Session Key: ${sessionKey}`);
            }

        } catch (error) {
            addLog(`❌ Veri yükleme hatası: ${error}`);
        }
    };

    const clearPendingOrders = () => {
        if (confirm('Pending order bilgileri silinecek. Emin misiniz?')) {
            localStorage.removeItem('pending_order_id');
            localStorage.removeItem('pending_order_items');
            addLog('🗑️ Pending order bilgileri temizlendi');
            loadAllData();
        }
    };

    const clearCartStorage = () => {
        if (confirm('Cart localStorage tamamen silinecek. Emin misiniz?')) {
            localStorage.removeItem('cart-storage');
            addLog('🗑️ Cart storage temizlendi');
            window.location.reload();
        }
    };

    const clearPreparingItems = () => {
        if (confirm('Hazırlanan ürünler temizlenecek. Emin misiniz?')) {
            cart.clearCart();
            addLog('🗑️ Cart tamamen temizlendi (items + preparingItems)');
            loadAllData();
        }
    };

    const testAddItem = () => {
        cart.addItem({
            itemId: 'test-' + Date.now(),
            name: { en: 'Test Item', tr: 'Test Ürün' },
            price: 10,
            quantity: 1,
            notes: 'Debug test item'
        });
        addLog('✅ Test ürün eklendi');
        loadAllData();
    };

    const moveToPreparingManual = () => {
        cart.moveToPreparing();
        addLog('📦 Aktif ürünler preparing\'e taşındı');
        loadAllData();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg p-6 mb-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <FaBug className="text-3xl" />
                        <h1 className="text-3xl font-bold">Cart Debug Panel</h1>
                    </div>
                    <p className="text-orange-100">Cart durumu, localStorage ve pending order bilgilerini kontrol edin</p>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                            <p className="text-xs text-orange-100">Aktif Ürünler</p>
                            <p className="text-2xl font-bold">{cart.items.length}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                            <p className="text-xs text-orange-100">Hazırlananlar</p>
                            <p className="text-2xl font-bold">{cart.preparingItems.length}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                            <p className="text-xs text-orange-100">Masa No</p>
                            <p className="text-2xl font-bold">{cart.tableNumber || '-'}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                            <p className="text-xs text-orange-100">Durum</p>
                            <p className="text-lg font-bold">{cart.orderStatus}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Aktif Cart Items */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaShoppingCart className="text-blue-600" />
                            Aktif Sepet (items)
                        </h2>
                        {cart.items.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Sepet boş</p>
                        ) : (
                            <div className="space-y-2">
                                {cart.items.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 p-3 rounded-lg border">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-sm">{item.name.tr}</span>
                                            <span className="text-sm font-mono">x{item.quantity}</span>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1">
                                            <div>ID: <code className="bg-gray-200 px-1 rounded">{item.id}</code></div>
                                            <div>Item ID: <code className="bg-gray-200 px-1 rounded">{item.itemId}</code></div>
                                            <div>Fiyat: {item.price} TL</div>
                                            {item.notes && <div>Not: {item.notes}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Preparing Items */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaClock className="text-yellow-600" />
                            Hazırlananlar (preparingItems)
                        </h2>
                        {cart.preparingItems.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Hazırlanan ürün yok</p>
                        ) : (
                            <div className="space-y-2">
                                {cart.preparingItems.map((item, idx) => (
                                    <div key={idx} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-sm">{item.name.tr}</span>
                                            <span className="text-sm font-mono">x{item.quantity}</span>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1">
                                            <div>ID: <code className="bg-gray-200 px-1 rounded">{item.id}</code></div>
                                            <div>Item ID: <code className="bg-gray-200 px-1 rounded">{item.itemId}</code></div>
                                            <div>Fiyat: {item.price} TL</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* LocalStorage Data */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Cart LocalStorage</h2>
                        <button
                            onClick={loadAllData}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 flex items-center gap-2"
                        >
                            <FaSync />
                            Yenile
                        </button>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                        <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap">
                            {localStorageData ? JSON.stringify(localStorageData, null, 2) : 'LocalStorage boş'}
                        </pre>
                    </div>
                </div>

                {/* Pending Order Data */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCheckCircle className="text-green-600" />
                        Pending Order Bilgileri
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Order ID</p>
                            <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded">
                                {pendingOrderData?.orderId || '(yok)'}
                            </code>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Ürün Sayısı</p>
                            <p className="text-2xl font-bold">
                                {pendingOrderData?.items ? pendingOrderData.items.length : 0}
                            </p>
                        </div>
                    </div>
                    {pendingOrderData?.items && pendingOrderData.items.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-semibold mb-2">Pending Order Items:</p>
                            <div className="space-y-2">
                                {pendingOrderData.items.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-white p-2 rounded border text-xs">
                                        <div className="flex justify-between">
                                            <span>{item.name?.tr || item.name}</span>
                                            <span>x{item.quantity}</span>
                                        </div>
                                        <div className="text-gray-600">{item.price} TL</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Session Data */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Session Bilgileri</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Session Key</p>
                            <code className="text-xs font-mono bg-gray-200 px-2 py-1 rounded break-all">
                                {sessionData?.sessionKey || '(yok)'}
                            </code>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Client ID</p>
                            <code className="text-xs font-mono bg-gray-200 px-2 py-1 rounded break-all">
                                {sessionData?.clientId || '(yok)'}
                            </code>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Test İşlemleri</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <button
                            onClick={testAddItem}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                        >
                            ➕ Test Ürün Ekle
                        </button>
                        <button
                            onClick={moveToPreparingManual}
                            className="px-4 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors text-sm"
                        >
                            📦 Preparing'e Taşı
                        </button>
                        <button
                            onClick={clearPreparingItems}
                            className="px-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm flex items-center gap-2 justify-center"
                        >
                            <FaTrash />
                            Cart Temizle
                        </button>
                        <button
                            onClick={clearPendingOrders}
                            className="px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm flex items-center gap-2 justify-center"
                        >
                            <FaTrash />
                            Pending Temizle
                        </button>
                        <button
                            onClick={clearCartStorage}
                            className="px-4 py-3 bg-red-800 text-white rounded-lg font-semibold hover:bg-red-900 transition-colors text-sm flex items-center gap-2 justify-center"
                        >
                            <FaTrash />
                            Storage Sil
                        </button>
                        <button
                            onClick={loadAllData}
                            className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 justify-center"
                        >
                            <FaSync />
                            Tümünü Yenile
                        </button>
                    </div>
                </div>

                {/* Logs */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">İşlem Logları</h2>
                    <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Henüz log yok</p>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className="text-green-400 font-mono text-xs mb-1">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Help */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
                    <h3 className="font-bold text-blue-800 mb-2">🔍 Sorun Giderme İpuçları</h3>
                    <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                        <li><strong>preparingItems</strong> siparişe verilmiş ürünleri içerir</li>
                        <li><strong>items</strong> henüz sipariş verilmemiş aktif sepet ürünlerini içerir</li>
                        <li>Sipariş verildiğinde <code>moveToPreparing()</code> çağrılır ve items → preparingItems taşınır</li>
                        <li>Ödeme yapılınca <code>markPaidAndClear()</code> her şeyi temizler</li>
                        <li>LocalStorage key: <code>cart-storage</code></li>
                        <li>Eğer eski siparişler kalıyorsa "Pending Temizle" veya "Storage Sil" kullanın</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
