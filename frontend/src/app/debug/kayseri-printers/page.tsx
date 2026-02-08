'use client';

import { useState } from 'react';
import { FaPrint, FaCheck, FaTimes, FaSpinner, FaNetworkWired } from 'react-icons/fa';

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

    const testPrinter = async (printer: typeof PRINTERS[0]) => {
        setResults(prev => ({ ...prev, [printer.id]: { status: 'loading' } }));

        try {
            const response = await fetch(`${BRIDGE_URL}/test/${printer.ip}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
                setResults(prev => ({ ...prev, [printer.id]: { status: 'success', message: 'Test çıktısı gönderildi!' } }));
            } else {
                setResults(prev => ({ ...prev, [printer.id]: { status: 'error', message: data.error || 'Bağlantı başarısız' } }));
            }
        } catch (err: any) {
            setResults(prev => ({ ...prev, [printer.id]: { status: 'error', message: 'Bridge kapalı veya ulaşılamıyor' } }));
        }
    };

    const testAll = async () => {
        setIsGlobalRunning(true);
        for (const printer of PRINTERS) {
            await testPrinter(printer);
        }
        setIsGlobalRunning(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
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
                                        <code className="text-blue-400">{printer.ip}</code>
                                        {res.message && <p className={`text-sm mt-1 ${res.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{res.message}</p>}
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
                    <h4 className="text-orange-400 font-bold mb-2">Önemli Hatırlatma:</h4>
                    <ul className="text-sm text-gray-400 space-y-2">
                        <li>1. Yazıcıların ana makinedeki Local Bridge ile aynı ağda (192.168.1.x) olduğundan emin olun.</li>
                        <li>2. Local Bridge programının açık ve 3005 portunda çalıştığından emin olun.</li>
                        <li>3. Yazıcı bağlantılarını kontrol etmek için yazıcıların Web arayüzüne (IP adreslerini tarayıcıya yazarak) girmeyi deneyebilirsiniz.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
