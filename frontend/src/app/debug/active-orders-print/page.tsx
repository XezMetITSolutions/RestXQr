'use client';

import { useState, useEffect } from 'react';
import { FaPrint, FaCheck, FaTimes, FaSpinner, FaSync, FaExclamationTriangle, FaChevronRight } from 'react-icons/fa';
import { printReceiptViaBridge } from '@/lib/printerHelpers';

export default function ActiveOrdersPrintPage() {
    const [restaurantId, setRestaurantId] = useState('');
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<{ time: string; message: string; type: 'info' | 'success' | 'error' | 'warning' }[]>([]);
    const [printingOrderIds, setPrintingOrderIds] = useState<Set<string>>(new Set());

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

    const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
        const time = new Date().toLocaleTimeString('tr-TR');
        setLogs(prev => [...prev, { time, message, type }]);
    };

    useEffect(() => {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];

        if (subdomain === 'kroren' || subdomain === 'kroren-levent') {
            setRestaurantId(subdomain === 'kroren' ? 'kroren' : 'kroren-levent');
            addLog(`Restoran algılandı: ${subdomain}`, 'info');
        } else {
            // Default to Kroren username for debugging if no subdomain
            setRestaurantId('kroren');
            addLog(`Varsayılan Restoran: kroren`, 'info');
        }
    }, []);

    const fetchActiveOrders = async () => {
        if (!restaurantId) {
            addLog('Restoran ID gerekli', 'error');
            return;
        }

        setLoading(true);
        addLog(`Aktif siparişler getiriliyor (Restoran ID: ${restaurantId})...`, 'info');

        try {
            const response = await fetch(`${API_URL}/orders?restaurantId=${restaurantId}&status=pending,preparing,ready&from=debug`);
            const data = await response.json();

            if (data.success) {
                const orders = data.data || data;
                setActiveOrders(orders);
                addLog(`${orders.length} aktif sipariş yüklendi`, 'success');
            } else {
                addLog(`Siparişler yüklenemedi: ${data.message}`, 'error');
            }
        } catch (error: any) {
            addLog(`Hata: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (restaurantId) {
            fetchActiveOrders();
        }
    }, [restaurantId]);

    const handlePrintFailover = async (data: any, orderId: string) => {
        const BRIDGE_URL = 'http://localhost:3005';
        let bridgeSuccessCount = 0;
        let localTasks = 0;

        const printResults = data.results || (data.data?.printResults) || [];

        if (printResults.length > 0) {
            for (const result of printResults) {
                if (!result.success && result.isLocalIP) {
                    localTasks++;
                    addLog(`🖨️ Bulut üzerinden yazılamadı (Yerel IP: ${result.ip}). Yerel köprü deneniyor...`, 'warning');

                    try {
                        const success = await printReceiptViaBridge(BRIDGE_URL, result.ip, {
                            orderNumber: orderId,
                            tableNumber: (data.order?.tableNumber || data.data?.tableNumber || data.data?.tableNumber || '?').toString(),
                            items: result.stationItems,
                            header: 'KROREN MUTFAK',
                            orderNote: data.order?.notes || data.data?.notes,
                            type: 'KITCHEN'
                        });

                        if (success) {
                            bridgeSuccessCount++;
                            addLog(`✅ Yerel yazıcıdan başarıyla yazdırıldı! (${result.ip})`, 'success');
                        } else {
                            addLog(`❌ Yerel köprü hatası: Yazıcıya ulaşılamadı (${result.ip}).`, 'error');
                        }
                    } catch (bridgeErr: any) {
                        addLog(`❌ Yerel köprüye bağlanılamadı. Port 3005 açık mı?`, 'error');
                    }
                }
            }
        }

        return { localTasks, bridgeSuccessCount };
    };

    const printOrder = async (orderId: string) => {
        if (printingOrderIds.has(orderId)) return;

        setPrintingOrderIds(prev => new Set(prev).add(orderId));
        addLog(`Sipariş yazdırılıyor: ${orderId}`, 'info');

        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/print`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.steps) {
                data.steps.forEach((step: any) => {
                    addLog(`[Backend] ${step.message}`, step.type === 'error' ? 'error' : step.type === 'success' ? 'success' : 'info');
                });
            }

            const failoverResult = await handlePrintFailover(data, orderId);

            if (data.success) {
                addLog(`✅ Sipariş (bulut üzerinden) başarıyla gönderildi: ${orderId}`, 'success');
            } else if (failoverResult.localTasks > 0) {
                if (failoverResult.bridgeSuccessCount === failoverResult.localTasks) {
                    addLog(`✅ Sipariş yerel köprü üzerinden TAMAMEN yazdırıldı.`, 'success');
                } else {
                    addLog(`⚠️ Sipariş kısmen yazdırıldı (${failoverResult.bridgeSuccessCount}/${failoverResult.localTasks}).`, 'warning');
                }
            } else {
                addLog(`❌ Yazdırma hatası: ${data.message}`, 'error');
            }
        } catch (error: any) {
            addLog(`❌ Hata: ${error.message}`, 'error');
        } finally {
            setPrintingOrderIds(prev => {
                const next = new Set(prev);
                next.delete(orderId);
                return next;
            });
        }
    };

    const printAllOrders = async () => {
        if (!confirm(`${activeOrders.length} siparişi yazdırmak istediğinize emin misiniz?`)) return;

        addLog(`TOPLU YAZDIRMA BAŞLADI: ${activeOrders.length} sipariş`, 'info');
        setLoading(true);
        for (const order of activeOrders) {
            await printOrder(order.id);
            // Small delay between print requests to avoid overwhelming
            await new Promise(r => setTimeout(r, 800));
        }
        setLoading(false);
        addLog(`TOPLU YAZDIRMA TAMAMLANDI`, 'success');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <span className="bg-indigo-600 text-white p-2 rounded-xl"><FaPrint /></span>
                            Aktif Siparişleri Yazdır (DEBUG)
                        </h1>
                        <p className="text-gray-500 font-bold mt-1">Sistemdeki aktif siparişleri topluca veya tekil olarak yazıcıya gönderin.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={fetchActiveOrders}
                            disabled={loading}
                            className="flex-1 md:flex-none bg-white border-2 border-gray-200 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95"
                        >
                            <FaSync className={loading ? 'animate-spin' : ''} /> YENİLE
                        </button>
                        <button
                            onClick={printAllOrders}
                            disabled={loading || activeOrders.length === 0}
                            className="flex-1 md:flex-none bg-red-600 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95 disabled:opacity-50"
                        >
                            <FaPrint /> TÜMÜNÜ YAZDIR ({activeOrders.length})
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sipariş Listesi */}
                    <div className="lg:col-span-3 space-y-4">
                        {activeOrders.length === 0 && !loading && (
                            <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                                <FaExclamationTriangle className="mx-auto text-4xl text-gray-300 mb-4" />
                                <p className="text-gray-400 font-bold">Aktif sipariş bulunamadı</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeOrders.map(order => (
                                <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                    <div className="p-5 flex justify-between items-center bg-gray-50/80">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">
                                                {order.tableNumber || '?'}
                                            </div>
                                            <div>
                                                <div className="font-black text-gray-900 text-sm">MASA {order.tableNumber || 'PAKET'}</div>
                                                <div className="text-[10px] font-bold text-gray-400 font-mono uppercase">{order.id.split('-')[0]}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                                order.status === 'preparing' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                            <button
                                                onClick={() => printOrder(order.id)}
                                                disabled={printingOrderIds.has(order.id)}
                                                className="bg-green-600 text-white w-9 h-9 rounded-xl flex items-center justify-center hover:bg-green-700 transition-all active:scale-90 disabled:opacity-50"
                                            >
                                                {printingOrderIds.has(order.id) ? <FaSpinner className="animate-spin" /> : <FaPrint size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1">
                                        <div className="space-y-2">
                                            {(order.items || []).map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center text-xs">
                                                    <div className="flex items-center gap-2 max-w-[70%]">
                                                        <span className="font-black text-gray-400">{item.quantity}x</span>
                                                        <span className="font-bold text-gray-700 truncate">{item.name}</span>
                                                    </div>
                                                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase shrink-0">
                                                        {Array.isArray(item.kitchenStation) ? item.kitchenStation.join(', ') : item.kitchenStation || 'default'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        {order.notes && (
                                            <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-[10px] font-bold text-yellow-700 border border-yellow-100 italic">
                                                "{order.notes}"
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-5 py-3 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Toplam Tutar</span>
                                        <span className="font-black text-gray-900">{(order.totalAmount || 0).toFixed(2)}₺</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Log Paneli */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-[2rem] p-6 shadow-2xl h-[calc(100vh-160px)] sticky top-8 flex flex-col border border-gray-800">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-white font-black flex items-center gap-2 uppercase tracking-tighter"><span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span> Terminal Logs</h2>
                                <button onClick={() => setLogs([])} className="text-[10px] font-black text-gray-500 hover:text-white uppercase transition-colors">Temizle</button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] custom-scrollbar pr-2">
                                {logs.map((log, idx) => (
                                    <div key={idx} className={`p-2 rounded-xl transition-all ${log.type === 'error' ? 'text-red-400 bg-red-400/5 border border-red-400/20' :
                                        log.type === 'success' ? 'text-green-400 bg-green-400/5 border border-green-400/20' :
                                            log.type === 'warning' ? 'text-yellow-400 bg-yellow-400/5 border border-yellow-400/20' :
                                                'text-gray-400 bg-white/5 border border-white/5'
                                        }`}>
                                        <span className="text-gray-600 font-bold block mb-1">[{log.time}]</span>
                                        <span className="leading-relaxed">{log.message}</span>
                                    </div>
                                ))}
                                {logs.length === 0 && (
                                    <div className="text-gray-600 text-center py-20 italic flex flex-col items-center gap-3">
                                        <div className="w-12 h-1 bg-gray-800 rounded-full"></div>
                                        İşlem bekleniyor...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #444;
                }
            `}</style>
        </div>
    );
}
