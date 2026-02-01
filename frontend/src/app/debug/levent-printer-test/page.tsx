
'use client';

import { useState } from 'react';
import { FaPrint, FaBug, FaCheckCircle, FaExclamationTriangle, FaTerminal, FaSync } from 'react-icons/fa';

export default function LeventPrinterTestPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', data?: any) => {
        setLogs(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message,
            type,
            data
        }, ...prev]);
    };

    const runTest = async (type: 'ramen' | 'kavurma' | 'kebap' | 'kasa' | 'all') => {
        setLoading(true);
        const restaurantUsername = 'kroren-levent';

        // Define mock items with their corresponding station IDs for LEVENT
        const mockItems: Record<string, any> = {
            kasa: {
                name: "Test Kasa Fişi (Levent)",
                quantity: 1,
                id: "kasa-levent",
                kitchenStation: "kasa",
                notes: "Debug Levent Kasa"
            },
            ramen: {
                name: "Test Ramen (Levent)",
                quantity: 1,
                id: "ramen-levent",
                kitchenStation: "ramen",
                notes: "Debug Levent Ramen"
            },
            kavurma: {
                name: "Test Kavurma (Levent)",
                quantity: 1,
                id: "kavurma-levent",
                kitchenStation: "kavurma",
                notes: "Debug Levent Kavurma"
            },
            kebap: {
                name: "Test Kebap & Sushi (Levent)",
                quantity: 1,
                id: "kebap-levent",
                kitchenStation: "kebap",
                notes: "Debug Levent Kebap"
            }
        };

        const targetItems = type === 'all'
            ? Object.values(mockItems)
            : [mockItems[type]];

        addLog(`🧪 ${type.toUpperCase()} testi başlatıldı...`, 'info', { targetItems });

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
            const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

            // Step 1: Create Mock Order
            addLog("Step 1: Geçici sipariş oluşturuluyor...", 'info');
            const orderRes = await fetch(`${apiUrl}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId: restaurantUsername,
                    tableNumber: 999,
                    items: targetItems,
                    notes: "LEVENT PRINTER TEST",
                    orderType: 'dine_in'
                })
            });

            const orderData = await orderRes.json();
            if (!orderData.success) {
                addLog(`❌ Sipariş hatası: ${orderData.message}`, 'error', orderData);
                throw new Error(orderData.message || "Sipariş oluşturulamadı");
            }

            const orderId = orderData.data.id;
            addLog(`✅ Sipariş oluşturuldu: ${orderId}`, 'success');

            // Step 2: Trigger Local Print directly
            addLog(`Step 2: Local Bridge üzerinden yazdırma deneniyor...`, 'info');

            // Construct the payload for local bridge matching Levent Configuration
            const printPayload = {
                orderNumber: orderId.substring(0, 8),
                tableNumber: "999",
                items: targetItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    notes: item.notes,
                    kitchenStation: item.kitchenStation
                })),
                printerConfig: {
                    "kasa": "192.168.1.10",
                    "ramen": "192.168.1.151",
                    "kavurma": "192.168.1.150",
                    "kebap": "192.168.1.149"
                }
            };

            // Send to local bridge
            try {
                await fetch('http://localhost:3005/debug/print-stations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(printPayload)
                });
                addLog(`✅ Local Bridge'e komut gönderildi (Cevap bekleniyor)`, 'success');
            } catch (bridgeError: any) {
                addLog(`❌ Local Bridge Hatası: Bridge çalışıyor mu? (localhost:3005)`, 'error', bridgeError.message);
            }

            // Step 3: Cleanup
            addLog("Step 3: Test siparişi temizleniyor...", 'info');
            await fetch(`${apiUrl}/orders/${orderId}`, { method: 'DELETE' });
            addLog("✅ Temizlik tamamlandı.", 'success');

        } catch (error: any) {
            addLog(`💥 KRİTİK HATA: ${error.message}`, 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/30">
                                <FaBug className="text-2xl text-white" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight">Kroren Levent Printer Test</h1>
                        </div>
                        <p className="text-slate-400 text-lg">Levent Şubesi Yazıcı Doğrulama Paneli</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setLogs([])}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2 text-sm"
                        >
                            <FaTerminal /> Logları Temizle
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Control Panel */}
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FaTerminal className="text-indigo-400" /> İstasyonlar (192.168.1.x)
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                {/* KASA */}
                                <button
                                    disabled={loading}
                                    onClick={() => runTest('kasa')}
                                    className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all shadow-lg flex items-center justify-between group disabled:opacity-50"
                                >
                                    <div className="text-left">
                                        <p className="font-bold">KASA</p>
                                        <p className="text-xs text-emerald-100/70">ID: kasa | IP: 192.168.1.10</p>
                                    </div>
                                    <FaPrint className="text-xl group-hover:scale-110 transition-transform" />
                                </button>

                                {/* KEBAP */}
                                <button
                                    disabled={loading}
                                    onClick={() => runTest('kebap')}
                                    className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg flex items-center justify-between group disabled:opacity-50"
                                >
                                    <div className="text-left">
                                        <p className="font-bold">KEBAP & SUSHI</p>
                                        <p className="text-xs text-purple-100/70">ID: kebap | IP: 192.168.1.149</p>
                                    </div>
                                    <FaPrint className="text-xl group-hover:scale-110 transition-transform" />
                                </button>

                                {/* RAMEN */}
                                <button
                                    disabled={loading}
                                    onClick={() => runTest('ramen')}
                                    className="p-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-xl transition-all shadow-lg flex items-center justify-between group disabled:opacity-50"
                                >
                                    <div className="text-left">
                                        <p className="font-bold">RAMEN</p>
                                        <p className="text-xs text-red-100/70">ID: ramen | IP: 192.168.1.151</p>
                                    </div>
                                    <FaPrint className="text-xl group-hover:scale-110 transition-transform" />
                                </button>

                                {/* KAVURMA */}
                                <button
                                    disabled={loading}
                                    onClick={() => runTest('kavurma')}
                                    className="p-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl transition-all shadow-lg flex items-center justify-between group disabled:opacity-50"
                                >
                                    <div className="text-left">
                                        <p className="font-bold">KAVURMA</p>
                                        <p className="text-xs text-orange-100/70">ID: kavurma | IP: 192.168.1.150</p>
                                    </div>
                                    <FaPrint className="text-xl group-hover:scale-110 transition-transform" />
                                </button>

                                <div className="pt-4 border-t border-slate-700 mt-2">
                                    <button
                                        disabled={loading}
                                        onClick={() => runTest('all')}
                                        className="w-full p-4 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {loading ? <FaSync className="animate-spin" /> : <FaCheckCircle />}
                                        Tüm Levent İstasyonlarını Test Et
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-900/20 border border-amber-900/30 rounded-2xl p-6">
                            <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                                <FaExclamationTriangle /> Bilgi
                            </h3>
                            <p className="text-sm text-amber-100/70 leading-relaxed">
                                Bu panel sadece <strong>Kroren Levent</strong> (192.168.1.x) ağı için yapılandırılmıştır.
                                <br />
                                "Local Bridge" uygulamasını çalıştırdığınız bilgisayarın, yazıcılarla aynı ağda (192.168.1.x) olduğundan emin olun.
                            </p>
                        </div>
                    </div>

                    {/* Console Output */}
                    <div className="flex flex-col h-full min-h-[500px]">
                        <div className="bg-black border border-slate-700 rounded-2xl p-4 flex-1 font-mono text-sm overflow-hidden flex flex-col shadow-2xl">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                                <span className="ml-2 text-slate-500 text-xs">debug-console.log</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                                {logs.length === 0 && (
                                    <div className="text-slate-600 animate-pulse italic">Test başlatılması bekleniyor...</div>
                                )}
                                {logs.map(log => (
                                    <div key={log.id} className="border-l-2 border-slate-800 pl-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-600">[{log.timestamp}]</span>
                                            <span className={`
                                                font-bold 
                                                ${log.type === 'success' ? 'text-emerald-400' : ''}
                                                ${log.type === 'error' ? 'text-red-400' : ''}
                                                ${log.type === 'warning' ? 'text-amber-400' : ''}
                                                ${log.type === 'info' ? 'text-indigo-400' : ''}
                                            `}>
                                                {log.message}
                                            </span>
                                        </div>
                                        {log.data && (
                                            <pre className="mt-1 p-2 bg-slate-900/50 rounded text-[10px] text-slate-500 overflow-x-auto">
                                                {JSON.stringify(log.data, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
