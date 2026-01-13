'use client';

import { useState, useEffect } from 'react';
import useCartStore from '@/store/useCartStore';
import useRestaurantStore from '@/store/useRestaurantStore';
import apiService from '@/services/api';
import { FaSync, FaShieldAlt, FaDatabase, FaNetworkWired, FaStore, FaShoppingCart } from 'react-icons/fa';

export default function DebugPanel() {
    const cart = useCartStore();
    const restaurantStore = useRestaurantStore();
    const [apiStatus, setApiStatus] = useState<any>(null);
    const [latestOrders, setLatestOrders] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [hostname, setHostname] = useState('');
    const [subdomain, setSubdomain] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHostname(window.location.hostname);
            setSubdomain(window.location.hostname.split('.')[0]);
        }
        refreshDebugInfo();
    }, []);

    const refreshDebugInfo = async () => {
        setLoading(true);
        try {
            // 0. Refresh Store Data
            await restaurantStore.fetchRestaurants();

            // Subdomain'den o anki restoranı bul ve set et (eğer yoksa)
            if (typeof window !== 'undefined') {
                const sub = window.location.hostname.split('.')[0];
                const found = restaurantStore.restaurants?.find(r => r.username === sub);
                if (found && !restaurantStore.currentRestaurant) {
                    restaurantStore.setCurrentRestaurant(found);
                }
            }

            // 1. API Health Check
            const healthRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api'}/debug/test`).then(r => r.json()).catch(e => ({ error: e.message }));
            setApiStatus(healthRes);

            // 2. Latest Orders (Global Debug)
            const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api'}/orders/debug/all`).then(r => r.json()).catch(e => ({ error: e.message }));
            setLatestOrders(ordersRes);

        } catch (error) {
            console.error('Debug refresh failed:', error);
        } finally {
            setLoading(false);
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
                        <p className="text-gray-500 mt-2">v2.0 - Real-time Diagnostics & Monitoring</p>
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
                        <pre className="mt-4 bg-black p-4 rounded-lg overflow-x-auto text-xs border border-gray-700">
                            {JSON.stringify(apiStatus, null, 2)}
                        </pre>
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
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">Loaded Categories:</span>
                                <span className="text-white">{restaurantStore.categories?.length || 0}</span>
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

                    {/* Section: Cart Store Status */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                            <FaShoppingCart /> Cart & Session Store
                        </h2>
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-gray-700 py-2">
                                <span className="text-gray-400">Table Number:</span>
                                <span className="text-yellow-400 font-black text-xl">{cart.tableNumber || 'DEĞİL'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 py-2">
                                <span className="text-gray-400">Cart Items Count:</span>
                                <span className="text-white">{cart.items?.length || 0}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-700 py-2">
                                <span className="text-gray-400">Order Status:</span>
                                <span className="text-blue-300 uppercase">{cart.orderStatus || 'idle'}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">Restaurant ID (Cart):</span>
                                <span className="text-xs text-gray-500">{cart.restaurantId || 'NULL'}</span>
                            </div>
                        </div>
                        <pre className="mt-4 bg-black p-4 rounded-lg overflow-x-auto text-xs border border-gray-700 max-h-60">
                            {JSON.stringify(cart.items, null, 2)}
                        </pre>
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
                                        <th className="p-3 border border-gray-700">Restaurant (Subdomain)</th>
                                        <th className="p-3 border border-gray-700">Table</th>
                                        <th className="p-3 border border-gray-700">Amount</th>
                                        <th className="p-3 border border-gray-700">Status</th>
                                        <th className="p-3 border border-gray-700">Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestOrders?.data?.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-gray-700/50 transition-colors">
                                            <td className="p-3 border border-gray-700 text-xs whitespace-nowrap">
                                                {new Date(order.created_at || order.createdAt).toLocaleString()}
                                            </td>
                                            <td className="p-3 border border-gray-700">
                                                {order.restaurant?.name} <br />
                                                <span className="text-xs text-gray-500">[{order.restaurant?.username}]</span>
                                            </td>
                                            <td className="p-3 border border-gray-700 text-center font-bold text-yellow-500 text-lg">
                                                {order.tableNumber}
                                            </td>
                                            <td className="p-3 border border-gray-700 font-bold">
                                                ₺{order.totalAmount}
                                            </td>
                                            <td className="p-3 border border-gray-700">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-green-900 text-green-300' :
                                                    order.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                                                        'bg-blue-900 text-blue-300'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-3 border border-gray-700 text-xs">
                                                {order.items?.length || 0} ürün
                                            </td>
                                        </tr>
                                    ))}
                                    {(!latestOrders?.data || latestOrders?.data?.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-gray-500 italic">
                                                Henüz sistemde sipariş bulunamadı veya veritabanı boş.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    sessionStorage.clear();
                                    window.location.reload();
                                }}
                                className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800 px-4 py-2 rounded-lg text-xs font-bold"
                            >
                                CLEAR ALL LOCAL STORAGE & RELOAD
                            </button>

                            <button
                                onClick={() => {
                                    cart.resetTable();
                                    window.location.reload();
                                }}
                                className="bg-orange-900/30 hover:bg-orange-900/50 text-orange-400 border border-orange-800 px-4 py-2 rounded-lg text-xs font-bold"
                            >
                                RESET CART & TABLE ONLY
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
