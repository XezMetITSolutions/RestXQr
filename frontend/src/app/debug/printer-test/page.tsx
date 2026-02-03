'use client';

import { useState, useEffect } from 'react';
import { FaPrint, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

export default function PrinterTestPage() {
    const [restaurantId, setRestaurantId] = useState('');
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [stations, setStations] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [testOrderId, setTestOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<{ time: string; message: string; type: 'info' | 'success' | 'error' }[]>([]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

    const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        const time = new Date().toLocaleTimeString('tr-TR');
        setLogs(prev => [...prev, { time, message, type }]);
    };

    useEffect(() => {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];

        if (subdomain === 'kroren' || subdomain === 'kroren-levent') {
            setRestaurantId(subdomain === 'kroren' ? '7' : '42c8d249-d7c3-4330-9b34-8c8230b7692c');
            addLog(`Restaurant detected: ${subdomain}`, 'info');
        }
    }, []);

    const fetchMenuItems = async () => {
        if (!restaurantId) {
            addLog('Restaurant ID gerekli', 'error');
            return;
        }

        setLoading(true);
        addLog(`Fetching menu for Restaurant ID: ${restaurantId}`, 'info');

        try {
            const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu`);
            addLog(`Response Status: ${response.status}`, response.ok ? 'success' : 'error');

            const data = await response.json();

            if (data.success) {
                if (data.data?.items) {
                    setMenuItems(data.data.items);
                    addLog(`${data.data.items.length} ürün yüklendi`, 'success');
                } else {
                    addLog('Data yapısı beklenmedik: data.data.items bulunamadı', 'error');
                    console.log('API Response:', data);
                }
            } else {
                addLog(`Ürünler yüklenemedi: ${data.message || 'Bilinmeyen hata'}`, 'error');
            }
        } catch (error: any) {
            addLog(`Fetch Hatası: ${error.message || error}`, 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStations = async () => {
        if (!restaurantId) return;

        try {
            const response = await fetch(`${API_URL}/restaurants/${restaurantId}/kitchen-stations`);
            const data = await response.json();

            if (data.success) {
                setStations(data.data);
                addLog(`${data.data.length} istasyon yüklendi`, 'success');
            }
        } catch (error) {
            addLog(`İstasyon yükleme hatası: ${error}`, 'error');
        }
    };

    useEffect(() => {
        if (restaurantId) {
            fetchMenuItems();
            fetchStations();
        }
    }, [restaurantId]);

    const createTestOrder = async () => {
        if (!selectedItem) {
            addLog('Lütfen bir ürün seçin', 'error');
            return;
        }

        setLoading(true);
        addLog('Test siparişi oluşturuluyor...', 'info');

        try {
            // Create order
            const orderResponse = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId,
                    tableNumber: 999, // Test table
                    items: [{
                        menuItemId: selectedItem.id,
                        name: selectedItem.name,
                        quantity: 1,
                        price: selectedItem.price,
                        unitPrice: selectedItem.price,
                        totalPrice: selectedItem.price
                    }],
                    totalAmount: selectedItem.price,
                    status: 'pending',
                    orderType: 'dine_in',
                    approved: true
                })
            });

            const orderData = await orderResponse.json();

            if (orderData.success) {
                const orderId = orderData.data.id;
                setTestOrderId(orderId);
                addLog(`✅ Sipariş oluşturuldu: ${orderId}`, 'success');
                addLog(`Ürün: ${selectedItem.name}`, 'info');
                addLog(`İstasyon: ${Array.isArray(selectedItem.kitchenStation) ? selectedItem.kitchenStation.join(', ') : selectedItem.kitchenStation || 'YOK'}`, 'info');

                // Send to printer
                addLog('Yazıcıya gönderiliyor...', 'info');
                const printResponse = await fetch(`${API_URL}/orders/${orderId}/print`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const printData = await printResponse.json();

                if (printData.success) {
                    addLog('✅ Yazıcıya başarıyla gönderildi!', 'success');
                    if (printData.results) {
                        printData.results.forEach((result: any) => {
                            addLog(`  - ${result.stationId}: ${result.success ? '✅ Başarılı' : '❌ Hata: ' + result.error}`, result.success ? 'success' : 'error');
                        });
                    }
                } else {
                    addLog(`❌ Yazıcı hatası: ${printData.message}`, 'error');
                }

                if (printData.steps) {
                    addLog('--- Backend Logları ---', 'info');
                    printData.steps.forEach((step: any) => {
                        addLog(`  ${step.message}`, step.type === 'error' ? 'error' : step.type === 'success' ? 'success' : 'info');
                    });
                }
            } else {
                addLog(`❌ Sipariş oluşturulamadı: ${orderData.message}`, 'error');
            }
        } catch (error) {
            addLog(`❌ Hata: ${error}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">🖨️ Yazıcı Test Paneli</h1>
                    <p className="text-gray-600 mb-6">Kasadan sipariş oluşturma ve yazıcıya gönderme testi</p>

                    {/* Restaurant ID */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Restaurant ID</label>
                        <input
                            type="text"
                            value={restaurantId}
                            onChange={(e) => setRestaurantId(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                            placeholder="Restaurant ID girin"
                        />
                    </div>

                    {/* Menu Items */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-bold text-gray-700">Ürün Seçin</label>
                            <button
                                onClick={fetchMenuItems}
                                disabled={loading || !restaurantId}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-bold"
                            >
                                Yenile
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedItem?.id === item.id
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                >
                                    <div className="font-bold text-gray-900">{item.name}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        İstasyon: {Array.isArray(item.kitchenStation)
                                            ? item.kitchenStation.join(', ')
                                            : item.kitchenStation || '❌ Atanmamış'}
                                    </div>
                                    <div className="text-sm text-purple-600 font-bold mt-1">{item.price}₺</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Test Button */}
                    <button
                        onClick={createTestOrder}
                        disabled={loading || !selectedItem}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-black text-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                İşlem Yapılıyor...
                            </>
                        ) : (
                            <>
                                <FaPrint />
                                Test Siparişi Oluştur ve Yazdır
                            </>
                        )}
                    </button>

                    {testOrderId && (
                        <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                            <div className="font-bold text-blue-900">Test Sipariş ID:</div>
                            <div className="text-blue-700 font-mono text-sm">{testOrderId}</div>
                        </div>
                    )}
                </div>

                {/* Logs */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-black text-gray-900">📋 Loglar</h2>
                        <button
                            onClick={() => setLogs([])}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-bold"
                        >
                            Temizle
                        </button>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-4 max-h-96 overflow-y-auto font-mono text-sm">
                        {logs.length === 0 ? (
                            <div className="text-gray-500 text-center py-8">Henüz log yok</div>
                        ) : (
                            logs.map((log, idx) => (
                                <div
                                    key={idx}
                                    className={`mb-1 ${log.type === 'error' ? 'text-red-400' :
                                        log.type === 'success' ? 'text-green-400' :
                                            'text-gray-300'
                                        }`}
                                >
                                    <span className="text-gray-500">[{log.time}]</span> {log.message}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Stations Info */}
                {stations.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-2xl p-8 mt-6">
                        <h2 className="text-xl font-black text-gray-900 mb-4">🏪 Mutfak İstasyonları</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stations.map(station => (
                                <div key={station.id} className="p-4 border-2 border-gray-200 rounded-xl">
                                    <div className="font-bold text-gray-900">{station.emoji} {station.name}</div>
                                    <div className="text-sm text-gray-600 mt-1">ID: {station.id}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
