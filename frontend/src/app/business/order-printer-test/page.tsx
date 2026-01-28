'use client';

import { useState, useEffect } from 'react';
import { printReceiptViaBridge } from '@/lib/printerHelpers';

export default function OrderPrinterTestPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [tableNumber, setTableNumber] = useState('1');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [orderId, setOrderId] = useState<string>('');

    const [selectedStation, setSelectedStation] = useState('kavurma');
    const restaurantId = '37b0322a-e11f-4ef1-b108-83be310aaf4d'; // Kroren ID

    useEffect(() => {
        loadProducts();
    }, [selectedStation]);

    const loadProducts = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${restaurantId}/menu/items`);
            const data = await response.json();
            if (data.success) {
                // Seçili istasyondaki ürünleri filtrele
                const filteredProducts = data.data.filter((p: any) => p.kitchenStation === selectedStation);
                setProducts(filteredProducts);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const toggleProduct = (product: any) => {
        const exists = selectedProducts.find(p => p.id === product.id);
        if (exists) {
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else {
            setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setSelectedProducts(selectedProducts.map(p =>
            p.id === productId ? { ...p, quantity } : p
        ));
    };

    const createOrder = async () => {
        if (selectedProducts.length === 0) {
            alert('Lütfen en az bir ürün seçin');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            // Sipariş oluştur
            const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId,
                    tableNumber,
                    items: selectedProducts.map(p => ({
                        menuItemId: p.id,
                        name: p.name,
                        quantity: p.quantity,
                        unitPrice: p.price,
                        price: p.price
                    })),
                    approved: false // Önce onaysız oluştur
                })
            });

            const orderData = await orderResponse.json();

            if (orderData.success) {
                setOrderId(orderData.data.id);
                setResult({
                    success: true,
                    message: `Sipariş oluşturuldu! ID: ${orderData.data.id.substring(0, 8)}`,
                    orderId: orderData.data.id
                });
            } else {
                setResult({
                    success: false,
                    message: 'Sipariş oluşturulamadı',
                    error: orderData.message
                });
            }
        } catch (error) {
            setResult({
                success: false,
                message: 'Hata oluştu',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
        } finally {
            setLoading(false);
        }
    };

    const BRIDGE_URL = 'http://localhost:3005';

    const approveOrder = async () => {
        if (!orderId) {
            alert('Önce sipariş oluşturun');
            return;
        }

        setLoading(true);

        try {
            // Siparişi onayla
            const approveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    approved: true
                })
            });

            const approveData = await approveResponse.json();

            if (approveData.success) {
                const printResults = approveData.data.printResults || [];
                let bridgeMessage = '';
                let bridgeSuccess = false;

                // Her bir yazdırma sonucunu kontrol et
                for (const result of printResults) {
                    if (!result.success && result.isLocalIP) {
                        console.log(`🖨️ Bulut üzerinden yazılamadı (Yerel IP: ${result.ip}). Yerel köprü deneniyor...`);

                        try {
                            const success = await printReceiptViaBridge(BRIDGE_URL, result.ip, {
                                orderNumber: orderId,
                                tableNumber: tableNumber,
                                items: result.stationItems
                            });

                            if (success) {
                                bridgeSuccess = true;
                                bridgeMessage = `✅ Yerel yazıcıdan başarıyla yazdırıldı! (${result.ip})`;
                            } else {
                                bridgeMessage = `❌ Yerel köprü yazdırma hatası: ${bridgeData.error}`;
                            }
                        } catch (bridgeErr) {
                            bridgeMessage = `❌ Yerel köprüye bağlanılamadı. (localhost:3005 çalışıyor mu?)`;
                        }
                    }
                }

                setResult({
                    success: true,
                    message: bridgeSuccess
                        ? '✅ Sipariş onaylandı ve yerel yazıcıdan yazdırıldı!'
                        : (bridgeMessage || '✅ Sipariş onaylandı! (Bulut üzerinden gönderildi)'),
                    orderId,
                    printed: true,
                    bridgeMessage
                });
            } else {
                setResult({
                    success: false,
                    message: 'Sipariş onaylanamadı',
                    error: approveData.message
                });
            }
        } catch (error) {
            setResult({
                success: false,
                message: 'Hata oluştu',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetTest = () => {
        setSelectedProducts([]);
        setOrderId('');
        setResult(null);
        setTableNumber('1');
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">🖨️ Yazıcı Test - Sipariş Oluştur & Onayla</h1>
                <p className="text-gray-600">Kavurma istasyonu ürünleri için yazıcı testi</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Product Selection */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Ürün Seçimi ({selectedStation.toUpperCase()})
                    </h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-gray-700">İstasyon Değiştir:</label>
                        <select
                            value={selectedStation}
                            onChange={(e) => {
                                setSelectedStation(e.target.value);
                                setSelectedProducts([]); // İstasyon değişince seçimi sıfırla
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="kavurma">🍖 Kavurma</option>
                            <option value="ramen">🍜 Ramen</option>
                            <option value="manti">🥟 Mantı</option>
                            <option value="icecek1">🥤 1. Kat İçecek</option>
                            <option value="icecek2">🍹 2. Kat İçecek</option>
                        </select>
                    </div>

                    {products.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Kavurma istasyonunda ürün bulunamadı</p>
                            <p className="text-sm mt-2">Önce station-debug sayfasından ürünlere istasyon atayın</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {products.map(product => {
                                const isSelected = selectedProducts.find(p => p.id === product.id);
                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => toggleProduct(product)}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={!!isSelected}
                                                    onChange={() => { }}
                                                    className="w-4 h-4"
                                                />
                                                <div>
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-sm text-gray-600">{product.price} ₺</div>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => updateQuantity(product.id, isSelected.quantity - 1)}
                                                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-bold">{isSelected.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(product.id, isSelected.quantity + 1)}
                                                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Order Actions */}
                <div className="space-y-6">
                    {/* Table Number */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4">📋 Sipariş Bilgileri</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Masa Numarası:</label>
                                <input
                                    type="text"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="Masa numarası"
                                />
                            </div>

                            <div className="bg-gray-50 rounded p-3">
                                <div className="text-sm font-medium mb-2">Seçili Ürünler:</div>
                                {selectedProducts.length === 0 ? (
                                    <p className="text-sm text-gray-500">Henüz ürün seçilmedi</p>
                                ) : (
                                    <ul className="text-sm space-y-1">
                                        {selectedProducts.map(p => (
                                            <li key={p.id} className="flex justify-between">
                                                <span>{p.quantity}x {p.name}</span>
                                                <span className="font-bold">{p.quantity * p.price} ₺</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4">⚡ İşlemler</h2>
                        <div className="space-y-3">
                            <button
                                onClick={createOrder}
                                disabled={loading || selectedProducts.length === 0}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg"
                            >
                                {loading ? '⏳ İşleniyor...' : '1️⃣ Sipariş Oluştur'}
                            </button>

                            <button
                                onClick={approveOrder}
                                disabled={loading || !orderId}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg"
                            >
                                {loading ? '⏳ Onaylanıyor...' : '2️⃣ Siparişi Onayla (Yazıcıya Gönder)'}
                            </button>

                            <button
                                onClick={resetTest}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg"
                            >
                                🔄 Sıfırla
                            </button>
                        </div>
                    </div>

                    {/* Result */}
                    {result && (
                        <div className={`rounded-lg p-4 ${result.success
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                            }`}>
                            <div className="flex items-start gap-3">
                                {result.success ? (
                                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <div className="flex-1">
                                    <p className={`font-semibold text-sm ${result.success ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                        {result.message}
                                    </p>
                                    {result.orderId && (
                                        <p className="text-xs text-gray-600 mt-1">
                                            Sipariş ID: {result.orderId.substring(0, 8)}...
                                        </p>
                                    )}
                                    {result.printed && (
                                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                            <p className="text-sm font-bold text-yellow-800">🖨️ Yazıcı Kontrolü:</p>
                                            <p className="text-xs text-yellow-700 mt-1">
                                                {result.bridgeMessage || `192.168.1.13 IP'sindeki yazıcıdan fiş çıktı mı kontrol edin!`}
                                            </p>
                                        </div>
                                    )}
                                    {result.error && (
                                        <p className="text-sm text-red-700 mt-2">
                                            Hata: {result.error}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Kullanım Talimatları
                </h3>
                <ol className="text-sm space-y-2 text-gray-700">
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-600">1.</span>
                        <span>Sol taraftan kavurma istasyonundaki ürünleri seçin (checkbox'lara tıklayın)</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-600">2.</span>
                        <span>Adet sayısını + / - butonları ile ayarlayın</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-600">3.</span>
                        <span>Masa numarasını girin (varsayılan: 1)</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-600">4.</span>
                        <span>"1️⃣ Sipariş Oluştur" butonuna basın</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-600">5.</span>
                        <span>"2️⃣ Siparişi Onayla" butonuna basın</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-green-600">✅</span>
                        <span className="font-semibold text-green-700">192.168.1.13 IP'sindeki yazıcıdan otomatik fiş çıkacak!</span>
                    </li>
                </ol>
            </div>
        </div>
    );
}
