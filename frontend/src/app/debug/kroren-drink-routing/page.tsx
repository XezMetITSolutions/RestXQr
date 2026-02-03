'use client';

import { useState, useEffect } from 'react';
import { FaBeer, FaTerminal, FaPlay, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
const KROREN_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

export default function KrorenDrinkDebug() {
    const [tableNumber, setTableNumber] = useState('1');
    const [drinks, setDrinks] = useState<any[]>([]);
    const [selectedDrink, setSelectedDrink] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);

    const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
        setLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), message: msg, type }, ...prev]);
    };

    useEffect(() => {
        const fetchDrinks = async () => {
            try {
                const response = await fetch(`${API_URL}/restaurants/${KROREN_ID}/menu`);
                const data = await response.json();
                if (data.success && data.data) {
                    // Flatten categories and items
                    const allItems: any[] = [];
                    data.data.categories.forEach((cat: any) => {
                        cat.items.forEach((item: any) => {
                            allItems.push({ ...item, categoryName: cat.name });
                        });
                    });

                    // Filter for drinks (simple check)
                    const drinkItems = allItems.filter(item =>
                        item.categoryName.toLowerCase().includes('içecek') ||
                        item.kitchenStation?.includes('icecek') ||
                        item.name.toLowerCase().includes('kola') ||
                        item.name.toLowerCase().includes('su')
                    );

                    setDrinks(drinkItems);
                    if (drinkItems.length > 0) setSelectedDrink(drinkItems[0]);
                }
            } catch (err) {
                addLog('İçecekler yüklenemedi: ' + err, 'error');
            }
        };
        fetchDrinks();
    }, []);

    const testRouting = async () => {
        if (!selectedDrink) return alert('Lütfen bir içecek seçin');

        setLoading(true);
        setResults(null);
        addLog(`Test başlatılıyor: Masa ${tableNumber}, Ürün: ${selectedDrink.name}`, 'info');

        try {
            // We'll use a special test-print endpoint if it existed, 
            // but for now let's just create a dummy order or use the print-item logic if we can.
            // Actually, a better way is to have a dedicated resolve route.
            // Since I haven't created that yet, I'll simulate by calling the print-item endpoint 
            // with a very small ID or using the "steps" returned.

            const response = await fetch(`${API_URL}/orders/debug/test-routing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId: KROREN_ID,
                    tableNumber: parseInt(tableNumber),
                    menuItemId: selectedDrink.id,
                    kitchenStation: selectedDrink.kitchenStation
                })
            });

            const data = await response.json();
            setResults(data);

            if (data.success) {
                addLog(`Yönlendirme başarılı: ${data.resolvedStation}`, 'success');
            } else {
                addLog(`Hata: ${data.message}`, 'error');
            }
        } catch (err) {
            addLog('Bağlantı hatası: ' + err, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <FaBeer className="text-4xl text-yellow-500" />
                    <h1 className="text-3xl font-black">KROREN İÇECEK YÖNLENDİRME TESTİ</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Input Panel */}
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                        <h2 className="text-xl font-bold mb-4 text-blue-400 border-b border-gray-700 pb-2">TEST PARAMETRELERİ</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">MASA NUMARASI</label>
                                <div className="flex gap-2 flex-wrap">
                                    {[1, 10, 18, 19, 25, 42].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setTableNumber(n.toString())}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${tableNumber === n.toString() ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                                        >
                                            Masa {n}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    className="w-full mt-3 bg-gray-900 border border-gray-600 rounded-lg p-3 text-xl font-black text-center"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">İÇECEK SEÇİMİ</label>
                                <select
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm"
                                    value={selectedDrink?.id || ''}
                                    onChange={(e) => {
                                        const d = drinks.find(dr => dr.id === e.target.value);
                                        setSelectedDrink(d);
                                    }}
                                >
                                    {drinks.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({Array.isArray(d.kitchenStation) ? d.kitchenStation.join(', ') : d.kitchenStation})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={testRouting}
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-black text-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20"
                            >
                                {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <FaPlay />}
                                TEST ET
                            </button>
                        </div>
                    </div>

                    {/* Result Panel */}
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col">
                        <h2 className="text-xl font-bold mb-4 text-green-400 border-b border-gray-700 pb-2">SONUÇ</h2>

                        {results ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                <div className={`text-6xl mb-4 ${results.success ? 'text-green-500' : 'text-red-500'}`}>
                                    {results.success ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                </div>
                                <div className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-1">GİDECEĞİ İSTASYON</div>
                                <div className="text-5xl font-black tracking-tighter text-white mb-4">
                                    {results.resolvedStation || 'BELİRSİZ'}
                                </div>
                                <div className="p-4 bg-gray-900 rounded-xl w-full text-left">
                                    <div className="text-xs text-blue-400 mb-2 font-bold">DETAYLAR</div>
                                    <pre className="text-[10px] text-gray-300">
                                        {JSON.stringify(results.debug, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500 italic">
                                Test başlatmak için butona basın...
                            </div>
                        )}
                    </div>
                </div>

                {/* Logs */}
                <div className="bg-black/50 rounded-2xl p-6 border border-gray-800">
                    <div className="flex items-center gap-2 mb-4 text-gray-400 font-bold border-b border-gray-800 pb-2 uppercase text-xs">
                        <FaTerminal /> LOG KAYITLARI
                    </div>
                    <div className="space-y-2 h-48 overflow-y-auto custom-scrollbar pr-2">
                        {logs.map((log, i) => (
                            <div key={i} className={`text-xs flex gap-3 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-300'}`}>
                                <span className="opacity-40 shrink-0">[{log.timestamp}]</span>
                                <span className="break-words">{log.message}</span>
                            </div>
                        ))}
                        {logs.length === 0 && <div className="text-gray-700 italic">Henüz log kaydı yok.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
