'use client';

import { useState } from 'react';
import { FaPrint, FaFont, FaCheckCircle, FaTrashAlt } from 'react-icons/fa';
import { printReceiptViaBridge } from '@/lib/printerHelpers';

export default function PrintFinalTestPage() {
    const [ip, setIp] = useState('192.168.1.13');
    const [bridgeUrl, setBridgeUrl] = useState('http://localhost:3005');
    const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' }>({ message: 'Hazır', type: 'info' });
    const [loading, setLoading] = useState(false);

    const testData = {
        orderNumber: "TEST-1234",
        tableNumber: "13",
        checkNumber: "88",
        staffName: "Debug Test",
        header: "KROREN RESTORAN",
        type: 'BILL' as const,
        subtotal: 450.00,
        total: 450.00,
        items: [
            {
                name: "Hoxan - Dana Etli Ramen (Özel Seri)",
                quantity: 2,
                price: 150.00,
                translations: { zh: { name: "禾祥牛肉拉面 (Long Translation Test)" } },
                variations: ["Büyük Porsiyon", "Az Acılı"]
            },
            {
                name: "Çin Mantısı (Geleneksel Şef Tarifi)",
                quantity: 1,
                price: 150.00,
                translations: { zh: { name: "传统手工水饺" } },
                notes: "Lütfen sıcak servis edilsin, yanına ekstra acı sos eklensin."
            }
        ],
        footer: "Bizi Tercih Ettiğiniz İçin Teşekkürler!\nwww.restxqr.com"
    };

    const handlePrint = async () => {
        setLoading(true);
        setStatus({ message: `${ip} adresine gönderiliyor...`, type: 'info' });

        try {
            const success = await printReceiptViaBridge(bridgeUrl, ip, testData);
            if (success) {
                setStatus({ message: `✅ Başarıyla gönderildi! (${ip})`, type: 'success' });
            } else {
                setStatus({ message: `❌ Gönderilemedi! Bridge açık mı?`, type: 'error' });
            }
        } catch (error: any) {
            setStatus({ message: `💥 Hata: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                        <FaFont className="text-3xl text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Yazı Boyutu & Baskı Testi</h1>
                        <p className="text-slate-400">Yazıcı IP: {ip} | Bridge: {bridgeUrl}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Ayarlar */}
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-xl">
                            <h2 className="text-xl font-semibold mb-6">Yazdırma Ayarları</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Yazıcı IP Adresi</label>
                                    <input
                                        type="text"
                                        value={ip}
                                        onChange={(e) => setIp(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Bridge URL</label>
                                    <input
                                        type="text"
                                        value={bridgeUrl}
                                        onChange={(e) => setBridgeUrl(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <button
                                    onClick={handlePrint}
                                    disabled={loading}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3"
                                >
                                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" /> : <FaPrint />}
                                    Test Baskısı Gönder
                                </button>
                            </div>

                            <div className={`mt-6 p-4 rounded-xl border ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    status.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                }`}>
                                {status.message}
                            </div>
                        </div>

                        <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700/30">
                            <h3 className="font-bold mb-2 flex items-center gap-2 text-slate-300">
                                <FaCheckCircle className="text-emerald-500" /> Son Güncelleme Notları
                            </h3>
                            <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                                <li>Tüm font boyutları %20 küçültüldü.</li>
                                <li>Ürün adları otomatik alt satıra geçer (Wrapping).</li>
                                <li>Çince karakterler için font boyutu 14px'e sabitlendi.</li>
                                <li>Mutfak notları kalın ve altı çizili hale getirildi.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Önizleme */}
                    <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-xl">
                        <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
                            Fiş İçeriği (JSON)
                            <button onClick={() => setStatus({ message: 'Sıfırlandı', type: 'info' })} className="text-slate-500 hover:text-rose-400 transition-colors">
                                <FaTrashAlt size={16} />
                            </button>
                        </h2>
                        <div className="bg-black/40 rounded-2xl p-4 h-[400px] overflow-y-auto font-mono text-xs text-blue-300 scrollbar-thin scrollbar-thumb-slate-700">
                            <pre>{JSON.stringify(testData, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
