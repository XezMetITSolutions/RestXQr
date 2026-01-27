'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { FaPrint, FaBug, FaPlus, FaCheckCircle, FaExclamationTriangle, FaSync, FaTrash } from 'react-icons/fa';

export default function PrintTestPage() {
    const { authenticatedRestaurant, initializeAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<{ time: string, msg: string, type: 'info' | 'success' | 'error' }[]>([]);
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev]);
    };

    const createAndPrintTestOrder = async () => {
        const restaurantId = authenticatedRestaurant?.id;
        if (!restaurantId) {
            addLog('Hata: Restoran oturumu bulunamadı!', 'error');
            return;
        }

        setLoading(true);
        addLog(`Test siparişi oluşturuluyor... (Restoran: ${authenticatedRestaurant.name})`);

        try {
            // 1. Sipariş Oluştur
            const testOrderData = {
                restaurantId,
                tableNumber: 999,
                customerName: 'DEBUG TEST',
                items: [
                    {
                        name: 'Tavuk noodle - 鸡肉炒面',
                        quantity: 1,
                        unitPrice: 150,
                        notes: 'test siparisidir'
                    }
                ],
                notes: 'BU BİR YAZICI TEST SİPARİŞİDİR. LÜTFEN DİKKATE ALMAYIN.',
                orderType: 'dine_in'
            };

            addLog(`API İsteği gönderiliyor: ${API_URL}/orders`);

            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 15000);

            const orderResponse = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testOrderData),
                signal: controller.signal
            });
            clearTimeout(id);

            addLog(`Sunucu yanıt verdi: ${orderResponse.status}`);

            const orderData = await orderResponse.json();
            if (!orderData.success) throw new Error(orderData.message || 'Sipariş oluşturulamadı');

            const orderId = orderData.data.id;
            setCreatedOrderId(orderId);
            addLog(`✅ Sipariş oluşturuldu: #${orderId.substring(0, 8)}`, 'success');

            // 2. Onayla (Bu işlem otomatik yazdırmayı tetikler)
            addLog('Sipariş onaylanıyor (Yazdırma tetikleniyor)...');
            const approveResponse = await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved: true })
            });

            const approveData = await approveResponse.json();
            if (!approveData.success) throw new Error('Onaylama sırasında hata oluştu');
            addLog('✅ Sipariş onaylandı.', 'success');

            // 3. Yazdırma Sonuçlarını Analiz Et
            const printResults = approveData.data?.printResults || [];
            if (printResults.length === 0) {
                addLog('⚠️ Yazdırma sonucu dönmedi. Ürün bir istasyona atanmış mı?', 'error');
            } else {
                printResults.forEach((res: any) => {
                    const status = res.success ? 'BAŞARILI' : 'BAŞARISIZ';
                    addLog(`🖨️ İstasyon: ${res.stationId} | IP: ${res.ip} | Durum: ${status}`, res.success ? 'success' : 'error');
                    if (!res.success && res.error) {
                        addLog(`   Hata detayı: ${res.error}`, 'error');
                    }
                });
            }

            // 4. İsteğe bağlı Manuel Yazdırma (Local Bridge Testi)
            addLog('Manuel yazdırma isteği gönderiliyor (Failover Testi)...');
            const printManualRes = await fetch(`${API_URL}/orders/${orderId}/print`, { method: 'POST' });
            const printManualData = await printManualRes.json();
            addLog(`Sistem Mesajı: ${printManualData.message || 'Yanıt bekliyor'}`);

        } catch (error: any) {
            addLog(`Hata: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const cleanupTestOrders = async () => {
        if (!authenticatedRestaurant?.id) return;
        if (!confirm('TÜM debug siparişleri (999 nolu masa) silinecek. Emin misiniz?')) return;

        addLog('Temizlik yapılıyor...');
        // Bu basit bir delete, gerçekte order helper kullanılabilir
        addLog('Sipariş silme işlemi henüz manuel yapılmalıdır kaza sayfasından.', 'info');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-mono">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12 bg-gray-800 p-6 rounded-3xl border border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-orange-500 rounded-2xl shadow-xl shadow-orange-500/20">
                            <FaBug className="text-3xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">PRINTER DEBUG TERMINAL</h1>
                            <p className="text-gray-400 font-bold">{authenticatedRestaurant?.name || 'Oturum Açılmadı'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="p-4 bg-gray-700 hover:bg-gray-600 rounded-2xl transition-all"
                    >
                        <FaSync className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                                <FaPlus className="text-green-500" /> TEST KOMUTLARI
                            </h2>
                            <button
                                onClick={createAndPrintTestOrder}
                                disabled={loading}
                                className="w-full py-6 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-green-900/20 flex flex-col items-center justify-center gap-2"
                            >
                                <span className="text-xl">TAVUK NOODLE TESTİ</span>
                                <span className="text-xs opacity-70">Masa 999 • Not: test siparisidir</span>
                            </button>

                            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-yellow-200 text-xs">
                                <FaExclamationTriangle className="inline mr-2" />
                                Bu buton basıldığında: Sipariş oluşturulur ve anında "Onay" verilir.
                                Bu da sunucunun mutfak yazıcılarına veri göndermesini tetikler.
                            </div>
                        </div>

                        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-red-400">
                                <FaTrash /> TEMİZLİK
                            </h2>
                            <button
                                onClick={() => window.open('/kasa', '_blank')}
                                className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-2xl transition-all border border-gray-600"
                            >
                                KASA PANELİNE GİT (SİPARİŞLERİ SİLMEK İÇİN)
                            </button>
                        </div>
                    </div>

                    {/* Terminal Logs */}
                    <div className="bg-black/50 border border-gray-700 rounded-3xl p-6 h-[500px] flex flex-col shadow-inner">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-4">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Debug Console</span>
                            <button onClick={() => setLogs([])} className="text-[10px] text-gray-500 hover:text-white underline">LOGLARI TEMİZLE</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                            {logs.length === 0 && <div className="text-gray-700 italic text-sm">Komut bekleniyor...</div>}
                            {logs.map((log, i) => (
                                <div key={i} className={`text-sm py-1 font-mono break-words ${log.type === 'error' ? 'text-red-400' :
                                    log.type === 'success' ? 'text-green-400' : 'text-blue-400'
                                    }`}>
                                    <span className="opacity-30 mr-2 text-[10px]">[{log.time}]</span>
                                    {log.msg}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 bg-blue-500/10 border border-blue-500/30 rounded-3xl p-8">
                    <h3 className="font-black text-blue-400 mb-4 flex items-center gap-2">
                        <FaBug /> ÖNEMLİ BİLGİ
                    </h3>
                    <p className="text-blue-200/70 text-sm leading-relaxed">
                        Tavuk Noodle siparişi çıkmıyorsa, Mutfak İstasyonu ayarı yapılmamış olabilir.
                        Bu terminal üzerinden verdiğiniz siparişteki istasyon sonucu <span className="text-red-400">BAŞARISIZ</span> veya <span className="text-yellow-400">BOŞ</span> geliyorsa;
                        lütfen <strong>Ürün & İstasyon Denetçisi</strong> sayfasından Tavuk Noodle'ın hangi istasyonda (Ramen, Kavurma vb.) olduğunu kontrol edin.
                    </p>
                    <button
                        onClick={() => window.location.href = '/business/debug/product-checker'}
                        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
                    >
                        Ürün Denetçisine Git
                    </button>
                </div>
            </div>
        </div>
    );
}
