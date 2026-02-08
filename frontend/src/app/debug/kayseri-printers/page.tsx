'use client';

import { useState } from 'react';
import { FaPrint, FaCheck, FaTimes, FaSpinner, FaNetworkWired, FaTerminal } from 'react-icons/fa';

const PRINTERS = [
    { id: 'kavurma', name: 'Kavurma', ip: '192.168.1.120' },
    { id: 'kebap', name: 'Kebap', ip: '192.168.1.121' },
    { id: 'ramen', name: 'Ramen', ip: '192.168.1.87' },
    { id: 'kasa', name: 'Kasa', ip: '192.168.1.122' },
    { id: 'yedek1', name: 'Yedek 1', ip: '192.168.1.222' },
];

const BRIDGE_URL = "http://localhost:3005";

export default function KayseriPrinterDebug() {
    const [results, setResults] = useState<Record<string, { status: 'idle' | 'loading' | 'success' | 'error', message?: string }>>({});
    const [isGlobalRunning, setIsGlobalRunning] = useState(false);
    const [logs, setLogs] = useState<{ time: string; message: string; type: 'info' | 'success' | 'error' }[]>([]);

    const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        const time = new Date().toLocaleTimeString('tr-TR');
        setLogs(prev => [{ time, message, type }, ...prev].slice(0, 50));
    };

    const testPrinter = async (printer: typeof PRINTERS[0]) => {
        setResults(prev => ({ ...prev, [printer.id]: { status: 'loading' } }));
        addLog(`[${printer.name}] Test başlatılıyor: ${printer.ip}`, 'info');

        try {
            const response = await fetch(`${BRIDGE_URL}/test/${printer.ip}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            console.log(`Debug Results for ${printer.name}:`, data);

            if (data.success) {
                setResults(prev => ({ ...prev, [printer.id]: { status: 'success', message: 'Bridge başarılı yanıt verdi.' } }));
                addLog(`[${printer.name}] Bridge başarılı yanıt verdi: ${data.message || 'Çıktı gönderildi'}`, 'success');
            } else {
                setResults(prev => ({ ...prev, [printer.id]: { status: 'error', message: data.error || 'Yazıcı hatası' } }));
                addLog(`[${printer.name}] HATA: ${data.error || 'Bilinmeyen yazıcı hatası'}`, 'error');
            }
        } catch (err: any) {
            setResults(prev => ({ ...prev, [printer.id]: { status: 'error', message: 'Bridge kapalı veya ulaşılamıyor' } }));
            addLog(`[${printer.name}] BAĞLANTI HATASI: Bridge'e (localhost:3005) ulaşılamıyor. Bridge programı açık mı?`, 'error');
        }
    };

    const testAll = async () => {
        setIsGlobalRunning(true);
        addLog('Tüm yazıcılar için toplu test başlatıldı...', 'info');
        for (const printer of PRINTERS) {
            await testPrinter(printer);
        }
        addLog('Toplu test tamamlandı.', 'info');
        setIsGlobalRunning(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                                KAYSERI PRINTER DEBUG
                            </h1>
                            <p className="text-gray-400 mt-2 font-mono">Local Bridge (Port 3005) üzerinden yazıcı testi</p>
                        </div>
                        <button
                            onClick={testAll}
                            disabled={isGlobalRunning}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg"
                        >
                            {isGlobalRunning ? <FaSpinner className="animate-spin" /> : <FaNetworkWired />}
                            Hepsini Test Et
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {PRINTERS.map(printer => {
                            const res = results[printer.id] || { status: 'idle' };
                            return (
                                <div key={printer.id} className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${res.status === 'success' ? 'border-green-500 bg-green-500/10' :
                                    res.status === 'error' ? 'border-red-500 bg-red-500/10' :
                                        res.status === 'loading' ? 'border-blue-500 animate-pulse' : 'border-gray-800 bg-gray-800/50'
                                    }`}>
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${res.status === 'success' ? 'bg-green-500' :
                                            res.status === 'error' ? 'bg-red-500' : 'bg-gray-700'
                                            }`}>
                                            <FaPrint />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{printer.name}</h3>
                                            <code className="text-blue-400 font-bold">{printer.ip}</code>
                                            {res.message && <p className={`text-sm mt-1 px-2 py-1 rounded bg-black/30 font-mono ${res.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{res.message}</p>}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => testPrinter(printer)}
                                        disabled={res.status === 'loading'}
                                        className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${res.status === 'success' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                                            }`}
                                    >
                                        {res.status === 'loading' ? <FaSpinner className="animate-spin" /> : <FaPrint />}
                                        Yazdır
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-10 p-6 bg-gray-800 rounded-2xl border border-gray-700">
                        <h4 className="text-orange-400 font-bold mb-2">💡 Troubleshooting (Sorun Giderme):</h4>
                        <ul className="text-sm text-gray-400 space-y-2">
                            <li>1. <strong>Bridge Kontrolü:</strong> Local Bridge programı terminalli ekranda açık mı? (Port 3005)</li>
                            <li>2. <strong>Ağ Bağlantısı:</strong> Bilgisayar ve yazıcılar aynı ağda mı? (192.168.1.x)</li>
                            <li>3. <strong>Web Arayüzü:</strong> Tarayıcıya yazıcının IP'sini yazınca (örn: 192.168.1.120) bir sayfa açılıyor mu?</li>
                            <li>4. <strong>Kağıt ve Kapak:</strong> Yazıcıda kağıt var mı? Kapağı tam kapalı mı?</li>
                        </ul>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-black/50 rounded-2xl border border-gray-800 h-full flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-800 bg-gray-800/50 flex items-center gap-2">
                            <FaTerminal className="text-gray-400" />
                            <h2 className="font-bold">DETAYLI LOGLAR</h2>
                            <button
                                onClick={() => setLogs([])}
                                className="ml-auto text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                            >
                                Temizle
                            </button>
                        </div>
                        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2">
                            {logs.length === 0 ? (
                                <p className="text-gray-600 italic">Test başlattığında loglar burada görünecek...</p>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className={`p-2 rounded border-l-2 ${log.type === 'error' ? 'bg-red-900/20 border-red-500 text-red-200' :
                                            log.type === 'success' ? 'bg-green-900/20 border-green-500 text-green-200' :
                                                'bg-blue-900/20 border-blue-500 text-blue-200'
                                        }`}>
                                        <span className="text-gray-500">[{log.time}]</span> {log.message}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
