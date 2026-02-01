'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import useRestaurantStore from '@/store/useRestaurantStore';
import {
    FaCheck, FaTimes, FaSync, FaExclamationTriangle,
    FaList, FaBug, FaPlay, FaDatabase, FaCode, FaMagic,
    FaBuilding
} from 'react-icons/fa';

// Definitive list of columns from Backend Model (MenuItem.js)
const REQUIRED_COLUMNS = [
    'id', 'restaurantId', 'categoryId', 'name', 'description', 'price',
    'imageUrl', 'videoUrl', 'videoThumbnail', 'videoDuration',
    'isAvailable', 'isPopular', 'preparationTime', 'calories',
    'ingredients', 'allergens', 'portionSize', 'displayOrder',
    'subcategory', 'kitchenStation', 'variations', 'options',
    'type', 'bundleItems', 'translations',
    'discountedPrice', 'discountPercentage', 'discountStartDate', 'discountEndDate',
    'createdAt', 'updatedAt'
];

export default function ProductDebugPage() {
    const { authenticatedRestaurant, authenticatedStaff } = useAuthStore();
    const {
        menuItems,
        categories,
        restaurants,
        fetchRestaurantMenu,
        createMenuItem,
        updateMenuItem,
        fetchCurrentRestaurant,
        loading: storeLoading
    } = useRestaurantStore();

    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [comparisonResult, setComparisonResult] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'analysis' | 'simulation' | 'schema'>('analysis');
    const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(null);
    const [detectedName, setDetectedName] = useState<string>('');

    // Simulation State
    const [testPayload, setTestPayload] = useState<string>('{\n  "name": "",\n  "price": 0\n}');
    const [simulationLog, setSimulationLog] = useState<string[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    // Schema Tab State
    const [showRequiredList, setShowRequiredList] = useState(true);
    const [showExistingList, setShowExistingList] = useState(true);

    // Robust Restaurant ID Detection (Logic from menu/page.tsx)
    const getRestaurantId = useCallback(() => {
        // 1. Authenticated Restaurant
        if (authenticatedRestaurant?.id) {
            setDetectedName(authenticatedRestaurant.name);
            return authenticatedRestaurant.id;
        }

        // 2. Subdomain Fallback (e.g. kroren.restxqr.com)
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const subdomain = hostname.split('.')[0];
            const mainDomains = ['localhost', 'www', 'guzellestir', 'restxqr'];

            if (!mainDomains.includes(subdomain) && hostname.includes('.')) {
                const restaurant = restaurants.find(r =>
                    r.name.toLowerCase().replace(/\s+/g, '') === subdomain ||
                    r.username === subdomain
                );
                if (restaurant) {
                    setDetectedName(`Subdomain: ${restaurant.name}`);
                    return restaurant.id;
                }
            }
        }

        // 3. Fallback to Staff's restaurant
        if (authenticatedStaff?.restaurantId) {
            setDetectedName('Staff Auth');
            return authenticatedStaff.restaurantId;
        }

        return null;
    }, [authenticatedRestaurant, restaurants, authenticatedStaff]);

    useEffect(() => {
        const id = getRestaurantId();
        if (id) {
            console.log("Debug Page: Detected Restaurant ID:", id);
            setCurrentRestaurantId(id);
            fetchRestaurantMenu(id);
            fetchCurrentRestaurant(id); // Ensure we have full details
        }
    }, [getRestaurantId, fetchRestaurantMenu, fetchCurrentRestaurant]);

    const handleSelectProduct = (productId: string) => {
        setSelectedProductId(productId);
        analyzeProduct(productId);

        const product = menuItems.find(p => p.id === productId);
        if (product) {
            setTestPayload(JSON.stringify(product, null, 2));
        }
    };

    const analyzeProduct = (productId: string) => {
        const product = menuItems.find(p => p.id === productId);
        if (!product) return;

        const existingKeys = Object.keys(product);
        const missingColumns = REQUIRED_COLUMNS.filter(col => !existingKeys.includes(col));
        const unexpectedColumns = existingKeys.filter(key => !REQUIRED_COLUMNS.includes(key));

        setComparisonResult({
            existingColumns: existingKeys,
            missingColumns,
            unexpectedColumns,
            productData: product
        });
    };

    const applyHoxanPreset = () => {
        if (!categories.length) {
            logSimulation("Kategori bulunamadı. Lütfen önce menüye kategori ekleyin.", 'error');
            return;
        }

        // Attempt to find a category that fits, or just first one
        const targetCategory = categories.find(c => c.name.toLowerCase().includes('ramen') || c.name.toLowerCase().includes('ana')) || categories[0];

        // Hoxan - 锅贴 Payload
        const preset = {
            name: "Hoxan - 锅贴",
            price: 199,
            categoryId: targetCategory.id,
            description: "Hoxan Preset Test (Gyoza)",
            // Variations: 2li 199 TL, 4lü 398 TL
            variations: [
                { name: "2li", price: 199 },
                { name: "4lü", price: 398 }
            ],
            kitchenStation: "kavurma", // Guessing station
            isAvailable: true,
            type: "single"
        };

        setTestPayload(JSON.stringify(preset, null, 2));
        logSimulation(`Hoxan preset yüklendi (Kategori: ${targetCategory.name}). 'Simülasyonu Başlat' butonuna basın.`, 'info');
    };

    const logSimulation = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setSimulationLog(prev => [`[${timestamp}] [${type.toUpperCase()}] ${msg}`, ...prev]);
    };

    const runSimulation = async () => {
        if (!currentRestaurantId) {
            logSimulation("Restoran ID bulunamadı.", 'error');
            return;
        }

        setIsSimulating(true);
        logSimulation(`Simülasyon başlatılıyor... (Restoran: ${detectedName})`, 'info');

        try {
            const payload = JSON.parse(testPayload);

            // Basic Validation Check
            if (payload.variants && !payload.variations) {
                logSimulation("UYARI: Payload 'variants' içeriyor ama Backend 'variations' bekliyor.", 'error');
            }

            if (selectedProductId) {
                logSimulation(`Update işlemi deneniyor: ID ${selectedProductId}`, 'info');
                await updateMenuItem(currentRestaurantId, selectedProductId, payload);
                logSimulation("Update işlemi başarıyla tamamlandı.", 'success');
            } else {
                logSimulation("Create işlemi deneniyor...", 'info');
                await createMenuItem(currentRestaurantId, payload);
                logSimulation("Create işlemi başarıyla tamamlandı.", 'success');
            }

            // Re-fetch
            await fetchRestaurantMenu(currentRestaurantId);
            logSimulation("Menü verileri güncellendi.", 'info');

        } catch (error: any) {
            logSimulation(`HATA: ${error.message || error}`, 'error');
            console.error(error);
        } finally {
            setIsSimulating(false);
        }
    };

    if (!currentRestaurantId && !storeLoading) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center h-screen space-y-4">
                <FaExclamationTriangle className="text-4xl text-yellow-500" />
                <div className="text-xl font-bold">Restoran Bulunamadı</div>
                <p className="text-gray-500">
                    Lütfen giriş yapın veya doğru subdomain (örn: kroren.restxqr.com) kullandığınızdan emin olun.
                </p>
                <div className="text-sm text-gray-400">
                    Detected ID: {currentRestaurantId || 'Null'}
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Sidebar: Product List */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <FaList className="text-blue-600" /> Ürünler ({menuItems.length})
                        </h2>
                        <button
                            onClick={() => currentRestaurantId && fetchRestaurantMenu(currentRestaurantId)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded transition-colors"
                            title="Yenile"
                        >
                            <FaSync className={storeLoading ? "animate-spin" : ""} />
                        </button>
                    </div>
                    {detectedName && (
                        <div className="text-xs flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
                            <FaBuilding /> {detectedName}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {menuItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleSelectProduct(item.id)}
                            className={`p-4 border-b cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedProductId === item.id ? 'bg-blue-50 border-blue-200 shadow-inner' : 'border-gray-100'}`}
                        >
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-400 mt-1 font-mono">{item.id}</div>
                            <div className="flex gap-2 mt-2">
                                {item.variations && Array.isArray(item.variations) && item.variations.length > 0 && (
                                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                                        {item.variations.length} Varyasyon
                                    </span>
                                )}
                                {!item.isAvailable && (
                                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                                        Pasif
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content: Debug Tabs */}
            <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
                {/* Tab Header */}
                <div className="bg-white border-b px-6 pt-4 flex gap-6">
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${activeTab === 'analysis' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <FaBug className="inline mb-1 mr-2" /> Analiz
                    </button>
                    <button
                        onClick={() => setActiveTab('simulation')}
                        className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${activeTab === 'simulation' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <FaPlay className="inline mb-1 mr-2" /> Simülasyon (Hoxan Test)
                    </button>
                    <button
                        onClick={() => setActiveTab('schema')}
                        className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${activeTab === 'schema' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <FaDatabase className="inline mb-1 mr-2" /> Şema Kontrolü
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* ANALYSIS TAB */}
                    {activeTab === 'analysis' && (
                        comparisonResult ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <FaCode /> Ham Veri (JSON)
                                    </h3>
                                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto h-[300px]">
                                        <pre className="text-xs text-green-400 font-mono">
                                            {JSON.stringify(comparisonResult.productData, null, 2)}
                                        </pre>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <h3 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">
                                            <FaTimes /> Eksik Sütunlar
                                        </h3>
                                        <div className="space-y-1">
                                            {comparisonResult.missingColumns.length > 0 ? (
                                                comparisonResult.missingColumns.map((col: string) => (
                                                    <div key={col} className="bg-red-50 text-red-700 px-3 py-1.5 rounded text-sm font-mono border border-red-100">
                                                        {col}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-gray-400 text-sm italic">Eksik sütun bulunamadı.</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <h3 className="text-lg font-bold mb-4 text-green-600 flex items-center gap-2">
                                            <FaCheck /> Mevcut Sütunlar
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {comparisonResult.existingColumns.map((col: string) => (
                                                <span key={col} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-mono border border-green-100">
                                                    {col}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <FaBug className="text-4xl mb-4 opacity-50" />
                                <p>Verilerini analiz etmek için soldan bir ürün seçin.</p>
                            </div>
                        )
                    )}

                    {/* SIMULATION TAB */}
                    {activeTab === 'simulation' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex gap-4 mb-4">
                                <button
                                    onClick={applyHoxanPreset}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition-all"
                                >
                                    <FaMagic /> "Hoxan - 锅贴" Preset Yükle
                                </button>
                                <div className="flex-1"></div>
                                <button
                                    onClick={runSimulation}
                                    disabled={isSimulating}
                                    className={`bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm transition-all ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <FaPlay /> {selectedProductId ? 'Update' : 'Create'} Simülasyonu Başlat
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6 h-[500px]">
                                <div className="flex flex-col">
                                    <label className="text-sm font-bold text-gray-700 mb-2">Gönderilecek Payload (JSON)</label>
                                    <textarea
                                        value={testPayload}
                                        onChange={(e) => setTestPayload(e.target.value)}
                                        className="flex-1 w-full bg-white border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                        spellCheck={false}
                                    />
                                    <div className="text-xs text-gray-500 mt-2 text-right">
                                        {selectedProductId ? `Düzenlenen ID: ${selectedProductId}` : 'Mod: Yeni Ürün Oluşturma'}
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-bold text-gray-700 mb-2">Simülasyon Logları</label>
                                    <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-y-auto font-mono text-sm text-gray-300 border border-gray-800">
                                        {simulationLog.length === 0 && <span className="opacity-50 text-gray-500">Log bekleniyor...</span>}
                                        {simulationLog.map((log, i) => (
                                            <div key={i} className={`mb-1 border-b border-gray-800 pb-1 ${log.includes('[ERROR]') ? 'text-red-400' : log.includes('[SUCCESS]') ? 'text-green-400' : ''}`}>
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SCHEMA TAB */}
                    {activeTab === 'schema' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                                <button
                                    onClick={() => setShowRequiredList(!showRequiredList)}
                                    className={`px-4 py-2 rounded border transition-colors ${showRequiredList ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-gray-100 border-gray-300 text-gray-600'}`}
                                >
                                    Gerekli Sütunları Listele
                                </button>
                                <button
                                    onClick={() => setShowExistingList(!showExistingList)}
                                    className={`px-4 py-2 rounded border transition-colors ${showExistingList ? 'bg-green-100 border-green-300 text-green-800' : 'bg-gray-100 border-gray-300 text-gray-600'}`}
                                >
                                    Mevcut Sütunları Listele (Seçili Ürün)
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                {/* Required List */}
                                {showRequiredList && (
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center justify-between">
                                            <span>Gerekli / Beklenen Sütunlar</span>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{REQUIRED_COLUMNS.length} adet</span>
                                        </h3>
                                        <ul className="space-y-1">
                                            {REQUIRED_COLUMNS.map((col) => (
                                                <li key={col} className="text-sm font-mono text-gray-600 hover:text-blue-600 transition-colors cursor-default">
                                                    {col}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Existing List */}
                                {showExistingList && (
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center justify-between">
                                            <span>Mevcut Sütunlar ({comparisonResult?.productData?.name || 'Seçim Yok'})</span>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {comparisonResult?.existingColumns?.length || 0} adet
                                            </span>
                                        </h3>
                                        {comparisonResult ? (
                                            <ul className="space-y-1">
                                                {comparisonResult.existingColumns.map((col: string) => (
                                                    <li key={col} className={`text-sm font-mono transition-colors cursor-default flex justify-between ${REQUIRED_COLUMNS.includes(col) ? 'text-green-600 font-medium' : 'text-yellow-600'}`}>
                                                        <span>{col}</span>
                                                        {!REQUIRED_COLUMNS.includes(col) && <span className="text-[10px] bg-yellow-100 px-1 rounded">Ekstra</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-center text-gray-400 py-8">
                                                Lütfen soldan bir ürün seçin
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
