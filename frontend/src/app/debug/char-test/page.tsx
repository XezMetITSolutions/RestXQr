"use client";

import React, { useState, useEffect } from 'react';
import { FaPrint, FaLanguage, FaKeyboard, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const TEST_IP = '192.168.1.13';
const BRIDGE_URL = 'http://localhost:3005';

export default function CharTestPage() {
    const [ip, setIp] = useState(TEST_IP);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [logs, setLogs] = useState<{ time: string, msg: string, type: 'info' | 'success' | 'err' }[]>([]);

    const addLog = (msg: string, type: 'info' | 'success' | 'err' = 'info') => {
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev]);
    };

    const runTest = async (method: number, name: string) => {
        setStatus('loading');
        addLog(`Test başlatılıyor: ${name} (Metot ${method})...`, 'info');

        try {
            const response = await fetch(`${BRIDGE_URL}/debug-chars/${ip}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method })
            });

            const data = await response.json();
            if (data.success) {
                setStatus('success');
                addLog(`✅ Test başarıyla gönderildi: ${name}`, 'success');
                setMessage(`Metot ${method} gönderildi. Lütfen çıktıyı kontrol edin.`);
            } else {
                setStatus('error');
                addLog(`❌ Hata: ${data.error}`, 'err');
                setMessage(`Yazdırma hatası: ${data.error}`);
            }
        } catch (err: any) {
            setStatus('error');
            addLog(`❌ Köprüye bağlanılamadı: ${err.message}`, 'err');
            setMessage("Local Bridge (port 3005) çalışıyor mu?");
        }
    };

    const textToCanvasAndPrint = async () => {
        setStatus('loading');
        addLog("Görüntü tabanlı (Canvas) test başlatılıyor...", 'info');

        try {
            // Create a canvas to render the receipt
            const canvas = document.createElement('canvas');
            canvas.width = 400; // Standard thermal width
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Text Styles
            ctx.fillStyle = 'black';
            ctx.font = 'bold 30px "Courier New", monospace';
            ctx.textAlign = 'center';

            ctx.fillText("MASA 15 - IMAGE TEST", 200, 50);

            ctx.font = '24px "Courier New", monospace';
            ctx.textAlign = 'left';

            let y = 100;
            const items = [
                { tr: "Karışık Ramen", cn: "什锦拉面" },
                { tr: "Dana Etli Ramen", cn: "牛肉拉面" },
                { tr: "Mantı (Özel)", cn: "特供饺子" },
                { tr: "Acılı Tavuk", cn: "辣味鸡肉" }
            ];

            items.forEach(item => {
                ctx.font = 'bold 24px Arial'; // Using Arial for better CJK support in browser
                ctx.fillText(`2x ${item.tr}`, 20, y);
                y += 35;
                ctx.font = '22px Arial';
                ctx.fillText(`   ${item.cn}`, 20, y);
                y += 50;
                ctx.beginPath();
                ctx.moveTo(20, y - 10);
                ctx.lineTo(380, y - 10);
                ctx.stroke();
            });

            ctx.font = '20px Arial';
            ctx.fillText("TÜRKÇE: ğüşiöç İĞÜŞÖÇ", 20, y + 20);
            ctx.fillText("CHINESE: 你好，世界", 20, y + 50);

            // Convert to Base64
            const base64Image = canvas.toDataURL('image/png');

            const response = await fetch(`${BRIDGE_URL}/print-image/${ip}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image })
            });

            const data = await response.json();
            if (data.success) {
                setStatus('success');
                addLog("✅ Görüntü başarıyla gönderildi!", "success");
            } else {
                throw new Error(data.error);
            }

        } catch (err: any) {
            setStatus('error');
            addLog(`❌ Hata: ${err.message}`, "err");
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 bg-blue-600 rounded-3xl shadow-lg shadow-blue-500/20">
                        <FaLanguage className="text-3xl text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter">KARAKTER TESTİ</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Türkçe & Çince Yazıcı Debug Sayfası</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div className="bg-gray-900 p-8 rounded-[32px] border border-gray-800 shadow-2xl">
                            <label className="block text-xs font-black text-gray-500 uppercase mb-3 tracking-widest">YAZICI IP ADRESİ</label>
                            <input
                                type="text"
                                value={ip}
                                onChange={(e) => setIp(e.target.value)}
                                className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl p-4 text-xl font-mono focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="bg-gray-900 p-8 rounded-[32px] border border-gray-800 shadow-2xl space-y-4">
                            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">TEST METOTLARI</h3>

                            <button onClick={() => runTest(1, "Standart PC857 (Türkçe)")} className="w-full p-5 bg-gray-800 hover:bg-blue-600 rounded-2xl text-left flex items-center gap-4 transition-all group">
                                <div className="p-3 bg-gray-700 rounded-xl group-hover:bg-blue-500">1</div>
                                <div>
                                    <div className="font-bold">Standart PC857 (Türkçe Odaklı)</div>
                                    <div className="text-xs text-gray-500 group-hover:text-blue-100">Klasik Türkçe karakter eşleme metodu.</div>
                                </div>
                            </button>

                            <button onClick={() => runTest(2, "GB18030 (Çince Odaklı)")} className="w-full p-5 bg-gray-800 hover:bg-emerald-600 rounded-2xl text-left flex items-center gap-4 transition-all group">
                                <div className="p-3 bg-gray-700 rounded-xl group-hover:bg-emerald-500">2</div>
                                <div>
                                    <div className="font-bold">GB18030 (Native Çince)</div>
                                    <div className="text-xs text-gray-500 group-hover:text-emerald-100">Çin standardı, Türkçe karakterler bozulabilir.</div>
                                </div>
                            </button>

                            <button onClick={() => runTest(3, "UTF-8 Mode (Yeni Nesil)")} className="w-full p-5 bg-gray-800 hover:bg-orange-600 rounded-2xl text-left flex items-center gap-4 transition-all group">
                                <div className="p-3 bg-gray-700 rounded-xl group-hover:bg-orange-500">3</div>
                                <div>
                                    <div className="font-bold">UTF-8 / Unicode Mode</div>
                                    <div className="text-xs text-gray-500 group-hover:text-orange-100">Eğer yazıcı destekliyorsa her şey doğru çıkar.</div>
                                </div>
                            </button>

                            <button onClick={() => runTest(4, "ESC/POS Auto-Switch")} className="w-full p-5 bg-gray-800 hover:bg-purple-600 rounded-2xl text-left flex items-center gap-4 transition-all group">
                                <div className="p-3 bg-gray-700 rounded-xl group-hover:bg-purple-500">4</div>
                                <div>
                                    <div className="font-bold">ESC/POS Kod Sayfası Geçişi</div>
                                    <div className="text-xs text-gray-500 group-hover:text-purple-100">Satır bazlı kod sayfası değiştirme denemesi.</div>
                                </div>
                            </button>

                            <button onClick={textToCanvasAndPrint} className="w-full p-5 bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/40 rounded-2xl text-left flex items-center gap-4 transition-all group">
                                <FaPrint className="text-xl" />
                                <div>
                                    <div className="font-black">METOT 5: GÖRÜNTÜ OLARAK YAZDIR</div>
                                    <div className="text-xs text-blue-100">En garantisi: Ekrandaki gibi fotoğraf olarak basar.</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Logs & Result */}
                    <div className="bg-gray-900 p-8 rounded-[32px] border border-gray-800 shadow-2xl flex flex-col h-[700px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <FaKeyboard /> CANLI LOGLAR
                            </h3>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${status === 'success' ? 'bg-green-500/20 text-green-500' :
                                    status === 'error' ? 'bg-red-500/20 text-red-500' :
                                        status === 'loading' ? 'bg-blue-500/20 text-blue-500 animate-pulse' : 'bg-gray-800 text-gray-500'
                                }`}>
                                {status.toUpperCase()}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs custom-scrollbar">
                            {logs.map((log, i) => (
                                <div key={i} className={`p-3 rounded-xl border ${log.type === 'success' ? 'bg-green-500/5 border-green-500/10 text-green-400' :
                                        log.type === 'err' ? 'bg-red-500/5 border-red-500/10 text-red-400' :
                                            'bg-gray-800/50 border-gray-800 text-gray-400'
                                    }`}>
                                    <span className="opacity-40">[{log.time}]</span> {log.msg}
                                </div>
                            ))}
                            {logs.length === 0 && <div className="text-center py-20 text-gray-700 italic">Henüz test başlatılmadı...</div>}
                        </div>

                        {message && (
                            <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 ${status === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                {status === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                <span className="font-bold text-sm">{message}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 bg-blue-600/10 border border-blue-600/20 p-6 rounded-3xl flex gap-4">
                    <FaInfoCircle className="text-blue-500 text-xl shrink-0" />
                    <div className="text-sm text-blue-100">
                        <p className="font-bold mb-1">Nasıl test edilmeli?</p>
                        <ul className="list-disc ml-5 space-y-1 opacity-80">
                            <li>Local Bridge uygulamasının çalıştığından emin olun.</li>
                            <li>Sırayla tüm butonlara basın ve yazıcıdan çıkan fişleri karşılaştırın.</li>
                            <li>Özellikle Türkçe karakterlerin (ğ, ş, ı) ve Çince karakterlerin netliğini kontrol edin.</li>
                            <li>En doğru sonuç veren metodu bana bildirin.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
            `}</style>
        </div>
    );
}
