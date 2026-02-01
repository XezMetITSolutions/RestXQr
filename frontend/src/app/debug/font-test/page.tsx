'use client';

import { useState } from 'react';
import { FaPrint, FaCheck } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://restxqr-api.onrender.com/api';

export default function FontTestPage() {
    const [printerIP, setPrinterIP] = useState('192.168.1.100');
    const [printerPort, setPrinterPort] = useState('9100');
    const [loading, setLoading] = useState<string | null>(null);
    const [results, setResults] = useState<{ [key: string]: string }>({});

    const fontSizes = [
        { id: 'size1', name: 'Çok Küçük', description: 'Normal boyut, bold yok', config: { doubleHeight: false, doubleWidth: false, bold: false } },
        { id: 'size2', name: 'Küçük', description: 'Normal boyut, bold', config: { doubleHeight: false, doubleWidth: false, bold: true } },
        { id: 'size3', name: 'Orta', description: 'Çift yükseklik, bold', config: { doubleHeight: true, doubleWidth: false, bold: true } },
        { id: 'size4', name: 'Büyük', description: 'Çift genişlik, bold', config: { doubleHeight: false, doubleWidth: true, bold: true } },
        { id: 'size5', name: 'Çok Büyük', description: 'Çift yükseklik + genişlik, bold', config: { doubleHeight: true, doubleWidth: true, bold: true } },
    ];

    const printTest = async (sizeConfig: typeof fontSizes[0]) => {
        setLoading(sizeConfig.id);
        setResults(prev => ({ ...prev, [sizeConfig.id]: 'Yazdırılıyor...' }));

        try {
            const response = await fetch(`${API_URL}/debug/print-font-test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    printerIP,
                    printerPort: parseInt(printerPort),
                    fontConfig: sizeConfig.config,
                    sizeName: sizeConfig.name,
                    sizeDescription: sizeConfig.description
                })
            });

            const data = await response.json();
            if (data.success) {
                setResults(prev => ({ ...prev, [sizeConfig.id]: '✅ Başarılı!' }));
            } else {
                setResults(prev => ({ ...prev, [sizeConfig.id]: `❌ Hata: ${data.error || data.message}` }));
            }
        } catch (error: any) {
            setResults(prev => ({ ...prev, [sizeConfig.id]: `❌ Bağlantı hatası: ${error.message}` }));
        } finally {
            setLoading(null);
        }
    };

    const printAll = async () => {
        for (const size of fontSizes) {
            await printTest(size);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniye bekle
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">🖨️ Yazıcı Font Boyutu Test</h1>
            <p className="text-gray-400 mb-8">Farklı font boyutlarını test edin ve hangisini beğendiğinizi seçin.</p>

            {/* Yazıcı Ayarları */}
            <div className="bg-gray-800 rounded-lg p-6 mb-8 max-w-xl">
                <h2 className="text-xl font-semibold mb-4">Yazıcı Ayarları</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">IP Adresi</label>
                        <input
                            type="text"
                            value={printerIP}
                            onChange={(e) => setPrinterIP(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="192.168.1.100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Port</label>
                        <input
                            type="text"
                            value={printerPort}
                            onChange={(e) => setPrinterPort(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="9100"
                        />
                    </div>
                </div>
            </div>

            {/* Font Boyutları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {fontSizes.map((size, index) => (
                    <div key={size.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-4xl font-bold text-blue-400">#{index + 1}</span>
                            <span className={`text-sm px-3 py-1 rounded-full ${size.config.doubleHeight && size.config.doubleWidth ? 'bg-red-600' :
                                    size.config.doubleHeight || size.config.doubleWidth ? 'bg-yellow-600' : 'bg-green-600'
                                }`}>
                                {size.name}
                            </span>
                        </div>

                        <h3 className="text-xl font-semibold mb-2">{size.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">{size.description}</p>

                        <div className="text-xs text-gray-500 mb-4 font-mono">
                            <div>doubleHeight: {size.config.doubleHeight ? '✓' : '✗'}</div>
                            <div>doubleWidth: {size.config.doubleWidth ? '✓' : '✗'}</div>
                            <div>bold: {size.config.bold ? '✓' : '✗'}</div>
                        </div>

                        <button
                            onClick={() => printTest(size)}
                            disabled={loading !== null}
                            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${loading === size.id
                                    ? 'bg-blue-700 cursor-wait'
                                    : 'bg-blue-600 hover:bg-blue-500'
                                }`}
                        >
                            {loading === size.id ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Yazdırılıyor...
                                </>
                            ) : (
                                <>
                                    <FaPrint /> Yazdır
                                </>
                            )}
                        </button>

                        {results[size.id] && (
                            <div className={`mt-3 p-2 rounded text-sm ${results[size.id].includes('✅') ? 'bg-green-900 text-green-300' :
                                    results[size.id].includes('❌') ? 'bg-red-900 text-red-300' : 'bg-gray-700'
                                }`}>
                                {results[size.id]}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Tümünü Yazdır */}
            <div className="text-center">
                <button
                    onClick={printAll}
                    disabled={loading !== null}
                    className="bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 mx-auto transition-colors"
                >
                    <FaPrint className="text-xl" />
                    TÜM BOYUTLARI YAZDIR (5 Fiş)
                </button>
                <p className="text-gray-500 text-sm mt-2">Her boyutu sırayla yazdırır (2sn aralıkla)</p>
            </div>

            {/* Örnek Fiş Görseli */}
            <div className="mt-12 bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-4 text-center">📄 Örnek Fiş İçeriği</h3>
                <div className="bg-white text-black p-4 rounded font-mono text-sm">
                    <div className="text-center font-bold text-lg mb-2">MASA: 5</div>
                    <div className="text-center text-xs mb-2">[ MUTFAK ]</div>
                    <hr className="my-2" />
                    <div className="text-xs">Tarih: {new Date().toLocaleString('tr-TR')}</div>
                    <hr className="my-2" />
                    <div className="font-bold text-sm mb-1">SIPARIS DETAYI:</div>
                    <div className="ml-2">
                        <div className="font-bold">2x Adana Kebap</div>
                        <div className="text-xs ml-4">&gt; Az acılı, Büyük porsiyon</div>
                        <div className="text-xs ml-4 font-bold">!! NOT: Acısız olsun</div>
                    </div>
                    <div className="ml-2 mt-2">
                        <div className="font-bold">1x Lahmacun</div>
                    </div>
                    <div className="ml-2 mt-2">
                        <div className="font-bold">3x Ayran</div>
                    </div>
                    <hr className="my-2" />
                    <div className="text-center font-bold">AFİYET OLSUN!</div>
                </div>
            </div>
        </div>
    );
}
