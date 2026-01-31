'use client';

import { useState } from 'react';
import { FaPrint, FaBug, FaCheckCircle, FaExclamationTriangle, FaTerminal, FaSync } from 'react-icons/fa';

export default function PrinterTestDebugPage() {
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

    const runTest = async (type: 'ramen' | 'kavurma' | 'kebap' | 'all') => {
        setLoading(true);
        const restaurantUsername = 'kroren-levent';

        // Define mock items with their corresponding station IDs
        const mockItems = {
            ramen: {
                name: "Test Ramen Ürünü",
                quantity: 1,
                id: "ramen-123",
                kitchenStation: "17692021455220.027173748942849185", // RAMEN ID
                notes: "Debug Test Print"
            },
            kavurma: {
                name: "Test Kavurma Ürünü",
                quantity: 1,
                id: "kavurma-123",
                kitchenStation: "17692021455190.20485462886666846", // KAVURMA ID
                notes: "Debug Test Print"
            },
            kebap: {
                name: "Test Kebap & Sushi Ürünü",
                quantity: 1,
                id: "kebap-123",
                kitchenStation: "176960565656066", // KEBAP & SUSHI ID
                notes: "Debug Test Print"
            }
        };

        const targetItems = type === 'all'
            ? [mockItems.ramen, mockItems.kavurma, mockItems.kebap]
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
                    tableNumber: "DEBUG-99",
                    items: targetItems,
                    notes: "PRINTER DEBUG TEST",
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

            // Step 2: Trigger Manual Print
            addLog(`Step 2: ${orderId} ID'li sipariş için yazdırma tetikleniyor...`, 'info');
            const printRes = await fetch(`${apiUrl}/orders/${orderId}/print`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const printData = await printRes.json();

            if (printData.success) {
                printData.results.forEach((res: any) => {
                    if (res.success) {
                        addLog(`🖨️ ${res.stationId} Fişi Çıktı! (Hedef IP: ${res.ip})`, 'success', res);
                    } else {
                        addLog(`❌ ${res.stationId} HATASI: ${res.error}`, 'error', res);
                    }
                });
            } else {
                addLog(`❌ Yazdırma genel hatası: ${printData.message}`, 'error', printData);
            }

            // Step 3: Cleanup (Optional but good practice)
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
                            <h1 className="text-3xl font-extrabold tracking-tight">Printer Debug Center</h1>
                        </div>
                        <p className="text-slate-400 text-lg">Kroren-Levent Yazıcı İstasyon Test Paneli</p>
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
                                <FaTerminal className="text-indigo-400" /> Test Senaryoları
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    disabled={loading}
                                    onClick={() => runTest('ramen')}
                                    className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-between group disabled:opacity-50"
                                >
                                    <div className="text-left">
                                        <p className="font-bold">Test: RAMEN</p>
                                        <p className="text-xs text-indigo-100/70">ID: ...5220.027... (IP: 1.151)</p>
                                    </div>
                                    <FaPrint className="text-xl group-hover:scale-110 transition-transform" />
                                </button>

                                <button
                                    disabled={loading}
                                    onClick={() => runTest('kavurma')}
                                    className="p-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-xl transition-all shadow-lg hover:shadow-red-500/20 flex items-center justify-between group disabled:opacity-50"
                                >
                                    <div className="text-left">
                                        <p className="font-bold">Test: KAVURMA</p>
                                        <p className="text-xs text-orange-100/70">ID: ...5190.204... (IP: 1.150)</p>
                                    </div>
                                    <FaPrint className="text-xl group-hover:scale-110 transition-transform" />
                                </button>

                                <button
                                    disabled={loading}
                                    onClick={() => runTest('kebap')}
                                    className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-between group disabled:opacity-50"
                                >
                                    <div className="text-left">
                                        <p className="font-bold">Test: KEBAP & SUSHI</p>
                                        <p className="text-xs text-emerald-100/70">ID: 176960565656066 (IP: 1.149)</p>
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
                                        Tüm İstasyonları Aynı Anda Test Et
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-900/20 border border-amber-900/30 rounded-2xl p-6">
                            <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                                <FaExclamationTriangle /> Bilgi
                            </h3>
                            <p className="text-sm text-amber-100/70 leading-relaxed">
                                Bu sayfa, Kroren-Levent için özel olarak tanımlanan uzun istasyon ID'lerinin sistem tarafından doğru tanınıp tanınmadığını test eder.
                                <br /><br />
                                Her buton, arka planda o istasyona ait ID ile bir sanal ürün içeren kısa ömürlü bir sipariş oluşturur ve hemen yazdırma komutu gönderir.
                            </p>
                        </div>
                    </div>

                    {/* Console Output */}
                    <div className="flex flex-col h-full min-h-[500px]">
                        <div className="bg-black border border-slate-700 rounded-2xl p-4 flex-1 font-mono text-sm overflow-hidden flex flex-col shadow-2xl">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
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
