'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaBug, FaMoneyBillWave, FaCreditCard, FaReceipt, FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';

interface Order {
    id: string;
    tableNumber: number;
    totalAmount: number;
    paidAmount: number;
    discountAmount: number;
    status: string;
    cashierNote?: string;
    items?: any[];
}

export default function PaymentDebugPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState('');
    const [logs, setLogs] = useState<{ msg: string, type: string, time: string }[]>([]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

    const addLog = (msg: string, type: string = 'info') => {
        setLogs(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev]);
    };

    useEffect(() => {
        const user = localStorage.getItem('staff_user');
        if (!user) {
            router.push('/staff-login');
            return;
        }
        const parsed = JSON.parse(user);
        setRestaurantId(parsed.restaurantId);
        fetchOrders(parsed.restaurantId);
    }, []);

    const fetchOrders = async (resId: string) => {
        try {
            setLoading(true);
            const resp = await fetch(`${API_URL}/orders?restaurantId=${resId}&status=pending,preparing,ready`);
            const data = await resp.json();
            if (data.success) {
                const normalized = (data.data || []).map((o: any) => ({
                    ...o,
                    totalAmount: Number(o.totalAmount) || 0,
                    paidAmount: Number(o.paidAmount) || 0,
                    discountAmount: Number(o.discountAmount) || 0
                })).filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled');

                setOrders(normalized);
                addLog(`Siparişler yüklendi: ${normalized.length} adet`, 'success');
            }
        } catch (err) {
            addLog(`Fetch hatası: ${err}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const testPayment = async (order: Order, type: 'partial' | 'hybrid' | 'full' | 'product') => {
        addLog(`${type.toUpperCase()} ödeme testi başlatılıyor - Masa ${order.tableNumber}`, 'info');

        let amount = 0;
        let note = `[DEBUG TEST: ${type.toUpperCase()}]`;
        const remaining = order.totalAmount - order.paidAmount - order.discountAmount;

        let items = order.items || [];

        if (type === 'partial') {
            amount = 10;
            note += ' 10 TL Parçalı';
        } else if (type === 'hybrid') {
            amount = Math.min(20, remaining);
            note += ` ${amount / 2} Nakit + ${amount / 2} Kart`;
        } else if (type === 'product') {
            if (items.length > 0) {
                const itemToPay = items[0];
                amount = parseFloat(String(itemToPay.price || 0)) * parseFloat(String(itemToPay.quantity || 1));
                items = items.slice(1); // Birinci ürünü öde/sil
                note += ` [ÜRÜN ÖDEME: ${itemToPay.name}]`;
            } else {
                return addLog('Siparişte ürün yok!', 'error');
            }
        } else {
            amount = remaining;
            note += ' Tam Ödeme';
        }

        const isPartial = type !== 'full' && (remaining - amount > 0.05);

        // Zorunlu sayısal dönüşüm ve temizlik
        const currentPaid = parseFloat(String(order.paidAmount || 0));
        let newPaidAmount = parseFloat((currentPaid + amount).toFixed(2));
        let newTotalAmount = order.totalAmount;

        if (type === 'product') {
            // Ürün ödemesinde toplam tutar düşer, ödenen miktar sıfırlanır (logic consistency)
            newTotalAmount = items.reduce((s, i) => s + (parseFloat(String(i.price || 0)) * parseFloat(String(i.quantity || 1))), 0);
            newPaidAmount = 0;
        }

        const payload: any = {
            status: isPartial ? 'ready' : 'completed',
            paidAmount: newPaidAmount,
            totalAmount: newTotalAmount,
            cashierNote: (order.cashierNote || '') + ' ' + note,
        };

        if (type === 'product') {
            payload.items = items;
        }

        addLog(`Hesaplama: ${currentPaid} + ${amount} = ${newPaidAmount}`, 'debug');

        try {
            addLog(`API isteği gönderiliyor: ${JSON.stringify(payload)}`, 'network');
            const resp = await fetch(`${API_URL}/orders/${order.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await resp.json();

            if (data.success) {
                addLog(`Ödeme BAŞARILI. API Response: ${JSON.stringify(data.data)}`, 'success');
                addLog(`Frontend Durumu: isPartial=${isPartial}, remaining=${(remaining - amount).toFixed(2)}`, 'debug');

                if (isPartial) {
                    addLog("HÜKÜM: Modal açık kalmalı (Frontend logic check)", "warning");
                } else {
                    addLog("HÜKÜM: Modal kapanmalı (Frontend logic check)", "warning");
                }

                fetchOrders(restaurantId);
            } else {
                addLog(`Ödeme BAŞARISIZ: ${data.message}`, 'error');
            }
        } catch (err) {
            addLog(`Ödeme Hatası: ${err}`, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <button onClick={() => router.push('/kasa')} className="flex items-center gap-2 text-gray-500 hover:text-black transition-all font-bold">
                        <FaArrowLeft /> KASAYA DÖN
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-4">
                        <FaBug className="text-red-600" /> ÖDEME TEST PANELİ
                    </h1>
                    <button onClick={() => fetchOrders(restaurantId)} className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-blue-600 font-bold">
                        YENİLE
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sipariş Listesi */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-700 uppercase tracking-widest mb-4">Aktif Siparişler</h2>
                        {loading ? (
                            <div className="p-20 text-center text-gray-400 font-bold animate-pulse">YÜKLENİYOR...</div>
                        ) : orders.length === 0 ? (
                            <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-bold uppercase">Aktif sipariş yok</div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-black">MASA {order.tableNumber}</span>
                                        <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full font-bold text-sm uppercase">{(order.totalAmount - order.paidAmount).toFixed(2)}₺ KALAN</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => testPayment(order, 'partial')}
                                            className="py-3 bg-yellow-500 text-white rounded-xl font-bold text-xs hover:bg-yellow-600 transition-all flex flex-col items-center gap-1 shadow-sm"
                                        >
                                            <FaMoneyBillWave />
                                            <span>10₺ PARÇALI</span>
                                        </button>
                                        <button
                                            onClick={() => testPayment(order, 'product')}
                                            className="py-3 bg-purple-500 text-white rounded-xl font-bold text-xs hover:bg-purple-600 transition-all flex flex-col items-center gap-1 shadow-sm"
                                        >
                                            <FaReceipt />
                                            <span>İLK ÜRÜNÜ ÖDE</span>
                                        </button>
                                        <button
                                            onClick={() => testPayment(order, 'hybrid')}
                                            className="py-3 bg-blue-500 text-white rounded-xl font-bold text-xs hover:bg-blue-600 transition-all flex flex-col items-center gap-1 shadow-sm"
                                        >
                                            <FaCreditCard />
                                            <span>HİBRİT TEST</span>
                                        </button>
                                        <button
                                            onClick={() => testPayment(order, 'full')}
                                            className="py-3 bg-green-600 text-white rounded-xl font-bold text-xs hover:bg-green-700 transition-all flex flex-col items-center gap-1 shadow-sm"
                                        >
                                            <FaCheckCircle />
                                            <span>TAM ÖDEME</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Loglar */}
                    <div className="flex flex-col h-[700px]">
                        <h2 className="text-xl font-bold text-gray-700 uppercase tracking-widest mb-4">İşlem Logları</h2>
                        <div className="flex-1 bg-gray-900 rounded-3xl p-6 overflow-y-auto font-mono text-sm space-y-2 border-4 border-gray-800 shadow-2xl">
                            {logs.length === 0 && <div className="text-gray-600 italic">Test bekleniyor...</div>}
                            {logs.map((log, i) => (
                                <div key={i} className={`p-3 rounded-lg border-l-4 ${log.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-400' :
                                    log.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' :
                                        log.type === 'network' ? 'bg-blue-500/10 border-blue-500 text-blue-300' :
                                            log.type === 'debug' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-200' :
                                                'bg-white/5 border-white/10 text-gray-400'
                                    }`}>
                                    <div className="text-[10px] opacity-50 mb-1">{log.time} - {log.type.toUpperCase()}</div>
                                    <div className="font-bold break-words">{log.msg}</div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setLogs([])} className="mt-4 py-3 bg-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-300 transition-all">LOGLARI TEMİZLE</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
