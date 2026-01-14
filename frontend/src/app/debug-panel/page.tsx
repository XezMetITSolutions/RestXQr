'use client';

import { useState, useEffect } from 'react';
import useCartStore from '@/store/useCartStore';
import useRestaurantStore from '@/store/useRestaurantStore';
import apiService from '@/services/api';
import { FaSync, FaShieldAlt, FaDatabase, FaNetworkWired, FaStore, FaShoppingCart, FaBell, FaPaperPlane, FaCashRegister } from 'react-icons/fa';

export default function DebugPanel() {
    const cart = useCartStore();
    const restaurantStore = useRestaurantStore();
    const [apiStatus, setApiStatus] = useState<any>(null);
    const [latestOrders, setLatestOrders] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [hostname, setHostname] = useState('');
    const [subdomain, setSubdomain] = useState('');

    // Simulation State
    const [simTable, setSimTable] = useState('1');
    const [simMenu, setSimMenu] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [simLog, setSimLog] = useState<string[]>([]);
    const [simLoading, setSimLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHostname(window.location.hostname);
            setSubdomain(window.location.hostname.split('.')[0]);
        }
        refreshDebugInfo();
    }, []);

    const addLog = (msg: string) => {
        setSimLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
    };

    const refreshDebugInfo = async () => {
        setLoading(true);
        try {
            // 0. Refresh List of Restaurants
            await restaurantStore.fetchRestaurants();

            let currentRId = '';
            // Subdomain'den o anki restoranı bul ve detaylarını (menü dahil) yükle
            if (typeof window !== 'undefined') {
                const sub = window.location.hostname.split('.')[0];
                const foundInList = restaurantStore.restaurants?.find(r => r.username === sub);

                if (foundInList) {
                    addLog(`🔍 Restoran bulundu: ${foundInList.name}`);
                    // Full detail fetch (categories and items)
                    const fullRestaurant = await restaurantStore.fetchRestaurantByUsername(sub);
                    if (fullRestaurant) {
                        currentRId = fullRestaurant.id;
                        addLog(`✅ Menü yüklendi: ${restaurantStore.menuItems?.length || 0} ürün`);

                        // Simülasyon menüsünü set et
                        setSimMenu(restaurantStore.menuItems || []);
                        if (restaurantStore.menuItems.length > 0) {
                            setSelectedItem(restaurantStore.menuItems[0].id);
                        }
                    }
                } else {
                    addLog(`❌ Subdomain (${sub}) ile eşleşen restoran bulunamadı!`);
                }
            }

            // 1. API Health Check
            const healthRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api'}/debug/test`).then(r => r.json()).catch(e => ({ error: e.message }));
            setApiStatus(healthRes);

            // 2. Latest Orders (Global Debug)
            const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api'}/orders/debug/all`).then(r => r.json()).catch(e => ({ error: e.message }));
            setLatestOrders(ordersRes);

        } catch (error: any) {
            console.error('Debug refresh failed:', error);
            addLog(`❌ HATA: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const simulateOrder = async () => {
        if (!restaurantStore.currentRestaurant?.id) return addLog('❌ Restoran ID bulunamadı!');
        if (!selectedItem) return addLog('❌ Ürün seçilmedi!');

        const itemObj = simMenu.find(i => i.id === selectedItem);
        if (!itemObj) return addLog('❌ Ürün bulunamadı!');

        setSimLoading(true);
        addLog(`🚀 Sipariş simüle ediliyor: Masa ${simTable}, Ürün: ${itemObj.name}`);

        try {
            const orderData = {
                restaurantId: restaurantStore.currentRestaurant.id,
                tableNumber: parseInt(simTable),
                items: [{
                    menuItemId: itemObj.id,
                    name: itemObj.name,
                    quantity: 1,
                    price: itemObj.price,
                    unitPrice: itemObj.price
                }],
                paymentMethod: paymentMethod,
                notes: `Debug Simülasyonu - Ödeme: ${paymentMethod}`
            };

            const res = await apiService.createOrder(orderData);
            if (res.success) {
                addLog(`✅ SİPARİŞ BAŞARILI! ID: ${res.data?.id}`);
                refreshDebugInfo();
            } else {
                addLog(`❌ SİPARİŞ HATASI: ${res.message || 'Bilinmeyen hata'}`);
            }
        } catch (e: any) {
            addLog(`❌ SİPARİŞ TEKNİK HATA: ${e.message}`);
        } finally {
            setSimLoading(false);
        }
    };

    const simulateWaiterCall = async () => {
        if (!restaurantStore.currentRestaurant?.id) return addLog('❌ Restoran ID bulunamadı!');

        setSimLoading(true);
        addLog(`🔔 Garson çağrısı simüle ediliyor: Masa ${simTable}`);

        try {
            const res = await apiService.callWaiter({
                restaurantId: restaurantStore.currentRestaurant.id,
                tableNumber: parseInt(simTable),
                type: 'waiter',
                message: 'Müşteri garson bekliyor (Simülasyon)'
            });

            if (res.success) {
                addLog(`✅ ÇAĞRI BAŞARILI!`);
            } else {
                addLog(`❌ ÇAĞRI HATASI: ${res.message || 'Bilinmeyen hata'}`);
            }
        } catch (e: any) {
            addLog(`❌ ÇAĞRI TEKNİK HATA: ${e.message}`);
        } finally {
            setSimLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-mono text-sm leading-relaxed">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-700 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-blue-400 flex items-center gap-3">
                            <FaShieldAlt /> SYSTEM DEBUG PANEL
                        </h1>
                        <p className="text-gray-500 mt-2">v2.1 - Simulation & Monitoring</p>
                    </div>
                    <button
                        onClick={refreshDebugInfo}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        <FaSync className={loading ? 'animate-spin' : ''} />
                        REFRESH DATA
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* SIMULATION TOOLBOX */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-blue-500/30 lg:col-span-2 shadow-lg shadow-blue-500/10">
                        <h2 className="text-xl font-bold mb-6 text-blue-300 flex items-center gap-2">
                            <FaPaperPlane /> Action Simulation Toolbox
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <div className="space-y-4">
                                <label className="block text-xs text-gray-400 font-bold uppercase">1. Masa Seç</label>
                                <input
                                    type="number"
                                    value={simTable}
                                    onChange={(e) => setSimTable(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                />

                                <label className="block text-xs text-gray-400 font-bold uppercase">2. Ürün Seç</label>
                                <select
                                    value={selectedItem}
                                    onChange={(e) => setSelectedItem(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                >
                                    {simMenu.map(item => (
                                        <option key={item.id} value={item.id}>{item.name} - ₺{item.price}</option>
                                    ))}
                                    {simMenu.length === 0 && <option>Yükleniyor...</option>}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-xs text-gray-400 font-bold uppercase">3. Ödeme Yöntemi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setPaymentMethod('cash')}
                                        className={`p-2 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold ${paymentMethod === 'cash' ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                                    >
                                        NAKİT
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('card')}
                                        className={`p-2 rounded-lg border flex items-center justify-center gap-2 text-xs font-bold ${paymentMethod === 'card' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                                    >
                                        KREDİ KARTI
                                    </button>
                                </div>

                                <div className="pt-2 space-y-2">
                                    <button
                                        onClick={simulateOrder}
                                        disabled={simLoading}
                                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-black p-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-green-900/20 active:scale-95 transition-all text-base"
                                    >
                                        <FaCashRegister /> SİPARİŞ VER (Simüle Et)
                                    </button>

                                    <button
                                        onClick={simulateWaiterCall}
                                        disabled={simLoading}
                                        className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-black p-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-yellow-900/20 active:scale-95 transition-all text-base"
                                    >
                                        <FaBell /> GARSON ÇAĞIR (Simüle Et)
                                    </button>
                                </div>
                            </div>

                            <div className="bg-black/50 rounded-xl p-4 border border-gray-700 h-[220px] overflow-y-auto font-mono text-xs">
                                <div className="text-gray-500 mb-2 border-b border-gray-800 pb-1">SIMULATION LOG:</div>
                                {simLog.map((log, i) => (
                                    <div key={i} className={`mb-1 ${log.includes('✅') ? 'text-green-400' : log.includes('❌') ? 'text-red-400' : 'text-blue-200'}`}>
                                        {log}
                                    </div>
                                ))}
                                {simLog.length === 0 && <div className="text-gray-700 italic">No activity logs yet...</div>}
                            </div>

                        </div>
                    </div>

                    {/* Section: Environment & Context */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
                            <FaNetworkWired /> Environment Context
                        </h2>
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-gray-700 py-2">
                                <span className="text-gray-400">HOSTNAME:</span>
                                <span className="text-white font-bold">{hostname}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 py-2">
                                <span className="text-gray-400">SUBDOMAIN:</span>
                                <span className="text-blue-300 font-bold font-black">{subdomain}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 py-2">
                                <span className="text-gray-400">API_URL (ENV):</span>
                                <span className="text-green-400 text-xs">{process.env.NEXT_PUBLIC_API_URL || 'DEFAULT'}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">API STATUS:</span>
                                <span className={apiStatus?.success ? 'text-green-500' : 'text-red-500'}>
                                    {apiStatus?.success ? 'ONLINE' : 'OFFLINE'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section: Restaurant Store Status */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-orange-400 flex items-center gap-2">
                            <FaStore /> Restaurant Store
                        </h2>
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-gray-700 py-2">
                                <span className="text-gray-400">Current Restaurant:</span>
                                <span className="text-white font-bold">{restaurantStore.currentRestaurant?.name || 'NULL'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 py-2">
                                <span className="text-gray-400">Restaurant ID:</span>
                                <span className="text-xs text-blue-300">{restaurantStore.currentRestaurant?.id || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="mt-4 max-h-40 overflow-y-auto bg-black p-4 rounded-lg border border-gray-700 text-xs text-gray-400">
                            {restaurantStore.restaurants?.map((r: any) => (
                                <div key={r.id} className={r.username === subdomain ? 'text-green-400 font-bold' : ''}>
                                    - {r.name} ({r.username}) {r.username === subdomain ? '[MATCHED]' : ''}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section: Global Orders monitor */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 lg:col-span-2">
                        <h2 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                            <FaDatabase /> Global Orders Monitor (Last 10)
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-gray-700">
                                <thead>
                                    <tr className="bg-gray-900">
                                        <th className="p-3 border border-gray-700">Time</th>
                                        <th className="p-3 border border-gray-700">Restaurant</th>
                                        <th className="p-3 border border-gray-700 text-center">Masa</th>
                                        <th className="p-3 border border-gray-700">Tutar</th>
                                        <th className="p-3 border border-gray-700">Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestOrders?.data?.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-gray-700/50 transition-colors">
                                            <td className="p-3 border border-gray-700 text-xs">
                                                {new Date(order.created_at || order.createdAt).toLocaleString()}
                                            </td>
                                            <td className="p-3 border border-gray-700">
                                                {order.restaurant?.name}
                                            </td>
                                            <td className="p-3 border border-gray-700 text-center font-bold text-yellow-500">
                                                {order.tableNumber}
                                            </td>
                                            <td className="p-3 border border-gray-700 font-bold">
                                                ₺{order.totalAmount}
                                            </td>
                                            <td className="p-3 border border-gray-700">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${order.status === 'completed' ? 'bg-green-900 text-green-300' :
                                                    order.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                                                        'bg-blue-900 text-blue-300'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!latestOrders?.data || latestOrders?.data?.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-gray-500 italic">
                                                Henüz sistemde sipariş bulunamadı.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
