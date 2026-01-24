'use client';

import { useState, useEffect } from 'react';
import { useBusinessSettingsStore } from '@/store/useBusinessSettingsStore';
import { FaBug, FaSync, FaTrash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function DebugPage() {
    const store = useBusinessSettingsStore();
    const [localStorageData, setLocalStorageData] = useState<any>(null);
    const [testResult, setTestResult] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    };

    useEffect(() => {
        loadLocalStorageData();
        addLog('Debug sayfası yüklendi');
    }, []);

    const loadLocalStorageData = () => {
        try {
            const data = localStorage.getItem('business-settings-storage');
            if (data) {
                setLocalStorageData(JSON.parse(data));
                addLog('✅ localStorage verisi yüklendi');
            } else {
                addLog('⚠️ localStorage\'da veri bulunamadı');
            }
        } catch (error) {
            addLog(`❌ localStorage okuma hatası: ${error}`);
        }
    };

    const testSave = () => {
        try {
            addLog('🧪 Test kaydı başlatılıyor...');

            // Test verisi ile güncelle
            store.updatePrinterSettings({
                receiptFooter: `Test - ${new Date().toLocaleTimeString()}`
            });

            addLog('✅ Store güncellendi');

            // LocalStorage'ı kontrol et
            setTimeout(() => {
                loadLocalStorageData();
                setTestResult('Test başarılı! Verileri kontrol edin.');
            }, 500);

        } catch (error) {
            addLog(`❌ Test hatası: ${error}`);
            setTestResult(`Hata: ${error}`);
        }
    };

    const clearStorage = () => {
        if (confirm('LocalStorage tamamen silinecek. Emin misiniz?')) {
            localStorage.removeItem('business-settings-storage');
            addLog('🗑️ localStorage temizlendi');
            loadLocalStorageData();
            window.location.reload();
        }
    };

    const forceSync = () => {
        addLog('🔄 Zorla senkronizasyon başlatılıyor...');
        loadLocalStorageData();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <FaBug className="text-3xl text-red-600" />
                        <h1 className="text-3xl font-bold text-gray-800">Settings Debug Panel</h1>
                    </div>
                    <p className="text-gray-600">Ayarların kayıt durumunu ve localStorage'ı kontrol edin</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Store State */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaCheckCircle className="text-green-600" />
                            Mevcut Store Durumu
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(store.settings, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* LocalStorage State */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaExclamationTriangle className="text-yellow-600" />
                                LocalStorage Verisi
                            </h2>
                            <button
                                onClick={forceSync}
                                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 flex items-center gap-2"
                            >
                                <FaSync />
                                Yenile
                            </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                            {localStorageData ? (
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                    {JSON.stringify(localStorageData, null, 2)}
                                </pre>
                            ) : (
                                <p className="text-gray-500 text-center py-8">LocalStorage boş</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Printer Settings Detail */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Printer Settings (Detaylı)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Receipt Header</p>
                            <p className="font-mono text-sm">{store.settings.printerSettings?.receiptHeader || '(boş)'}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Receipt Footer</p>
                            <p className="font-mono text-sm">{store.settings.printerSettings?.receiptFooter || '(boş)'}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Paper Width</p>
                            <p className="font-mono text-sm">{store.settings.printerSettings?.paperWidth || '(boş)'}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Copies</p>
                            <p className="font-mono text-sm">{store.settings.printerSettings?.copies || '(boş)'}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Show Logo</p>
                            <p className="font-mono text-sm">{store.settings.printerSettings?.showLogo ? '✅ Evet' : '❌ Hayır'}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Auto Print</p>
                            <p className="font-mono text-sm">{store.settings.printerSettings?.autoPrintOrders ? '✅ Evet' : '❌ Hayır'}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Test İşlemleri</h2>
                    <div className="flex gap-4 flex-wrap">
                        <button
                            onClick={testSave}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            🧪 Test Kayıt Yap
                        </button>
                        <button
                            onClick={loadLocalStorageData}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <FaSync />
                            LocalStorage Yenile
                        </button>
                        <button
                            onClick={clearStorage}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <FaTrash />
                            LocalStorage Temizle
                        </button>
                        <a
                            href="/business/debug/product-checker"
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                            <FaBug />
                            Ürün & İstasyon Denetçisi
                        </a>
                    </div>
                    {testResult && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800">{testResult}</p>
                        </div>
                    )}
                </div>

                {/* Logs */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">İşlem Logları</h2>
                    <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Henüz log yok</p>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className="text-green-400 font-mono text-xs mb-1">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                    <h3 className="font-bold text-yellow-800 mb-2">ℹ️ Bilgilendirme</h3>
                    <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                        <li>Store, Zustand persist middleware kullanarak otomatik LocalStorage'a kaydediyor</li>
                        <li>Her store güncellemesi otomatik olarak kaydedilmeli</li>
                        <li>Eğer veriler kaydedilmiyorsa, persist yapılandırması kontrol edilmeli</li>
                        <li>LocalStorage key: <code className="bg-yellow-100 px-1 rounded">business-settings-storage</code></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
