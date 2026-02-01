'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import useRestaurantStore from '@/store/useRestaurantStore';
import {
    FaBug, FaSave, FaSync, FaSearch, FaCogs, FaDatabase,
    FaExclamationCircle, FaCheckCircle, FaTrash, FaPlus,
    FaArrowLeft, FaClock, FaFire, FaGlobe, FaTag, FaList
} from 'react-icons/fa';
import Link from 'next/link';

export default function ProductDebugEditPage() {
    const { authenticatedRestaurant, authenticatedStaff, initializeAuth } = useAuthStore();
    const {
        menuItems,
        restaurants,
        fetchRestaurantMenu,
        updateMenuItem,
        loading: storeLoading
    } = useRestaurantStore();

    const [searchTerm, setSearchTerm] = useState('Pirinç keki');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [editData, setEditData] = useState<any>(null);
    const [debugLogs, setDebugLogs] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [isSearchingId, setIsSearchingId] = useState(true);

    // Initialize Auth
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    // Get restaurant ID with multiple fallbacks
    useEffect(() => {
        const detectId = async () => {
            // 1. Check Store
            let id = authenticatedRestaurant?.id || authenticatedStaff?.restaurantId;

            // 2. Fallback to Subdomain
            if (!id && typeof window !== 'undefined') {
                const hostname = window.location.hostname;
                const subdomain = hostname.split('.')[0];
                const mainDomains = ['localhost', 'www', 'guzellestir', 'restxqr'];

                if (!mainDomains.includes(subdomain)) {
                    // Try to find by username in restaurants list
                    const found = restaurants.find(r => r.username === subdomain);
                    if (found) id = found.id;
                }
            }

            if (id) {
                setRestaurantId(id);
                fetchRestaurantMenu(id);
                setIsSearchingId(false);
            } else if (!storeLoading) {
                // Wait a bit more for auth to potentially hydrate
                const timer = setTimeout(() => {
                    setIsSearchingId(false);
                }, 2000);
                return () => clearTimeout(timer);
            }
        };

        detectId();
    }, [authenticatedRestaurant, authenticatedStaff, restaurants, fetchRestaurantMenu, storeLoading]);

    // Handle initial search for "Pirinç keki"
    useEffect(() => {
        if (menuItems.length > 0 && !selectedItem) {
            const item = menuItems.find(i =>
                i.name.toLowerCase().includes('pirinç keki') ||
                i.name.includes('炒年糕')
            );
            if (item) {
                handleSelectItem(item);
            }
        }
    }, [menuItems, selectedItem]);

    const addLog = (title: string, data: any, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
        setDebugLogs(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            title,
            data,
            type
        }, ...prev]);
    };

    const handleSelectItem = (item: any) => {
        setSelectedItem(item);
        // Deep copy to avoid direct mutation
        setEditData(JSON.parse(JSON.stringify(item)));
        addLog('Ürün Seçildi', item, 'info');
    };

    const handleSave = async () => {
        if (!restaurantId || !selectedItem || !editData) return;

        setIsSaving(true);
        addLog('Güncelleme Başlatılıyor', { restaurantId, itemId: selectedItem.id, payload: editData }, 'info');

        try {
            const result = await updateMenuItem(restaurantId, selectedItem.id, editData);
            addLog('Güncelleme Başarılı', result, 'success');
            // Refresh menu to get latest state
            await fetchRestaurantMenu(restaurantId);
        } catch (error: any) {
            addLog('Güncelleme Hatası', {
                message: error.message,
                stack: error.stack,
                errorObject: error
            }, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.includes(searchTerm)
    );

    const updateField = (field: string, value: any) => {
        setEditData((prev: any) => ({ ...prev, [field]: value }));
    };

    if (isSearchingId) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center h-screen space-y-4">
                <FaSync className="text-4xl text-indigo-500 animate-spin" />
                <div className="text-xl font-bold">Restoran Kimliği Doğrulanıyor...</div>
                <p className="text-gray-500">Lütfen bekleyin...</p>
            </div>
        );
    }

    if (!restaurantId && !storeLoading) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center h-screen space-y-6">
                <FaExclamationCircle className="text-4xl text-yellow-500" />
                <div className="text-xl font-bold">Restoran Belirlenemedi</div>
                <p className="text-gray-500 max-w-md mx-auto">
                    Giriş yapmış olmanıza rağmen restoran bilginiz otomatik alınamadı.
                    Lütfen dashboard sayfasından geçiş yapın veya aşağıya manuel ID girin.
                </p>

                <div className="flex gap-2 max-w-sm w-full">
                    <input
                        type="text"
                        placeholder="Restoran ID girin (örn: 123...)"
                        className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = (e.target as HTMLInputElement).value;
                                if (val) setRestaurantId(val);
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            const input = document.querySelector('input[placeholder*="Restoran ID"]') as HTMLInputElement;
                            if (input.value) setRestaurantId(input.value);
                        }}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold"
                    >
                        Yükle
                    </button>
                </div>

                <Link href="/business/login" className="text-indigo-600 hover:underline font-medium">
                    Yeniden Giriş Yap
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/business/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <FaArrowLeft className="text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <FaBug className="text-red-500" /> Ürün Düzenleme Debug Paneli
                        </h1>
                        <p className="text-xs text-slate-500 font-mono">Restoran ID: {restaurantId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => restaurantId && fetchRestaurantMenu(restaurantId)}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm"
                        disabled={storeLoading}
                    >
                        <FaSync className={storeLoading ? 'animate-spin' : ''} /> Listeyi Yenile
                    </button>
                    {selectedItem && (
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold shadow-md shadow-indigo-100 disabled:opacity-50"
                            disabled={isSaving}
                        >
                            <FaSave /> {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </button>
                    )}
                </div>
            </header>

            <main className="p-6 grid grid-cols-12 gap-6 h-[calc(100vh-100px)]">
                {/* Left: Product Selection */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Ürün ara..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredItems.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm italic">
                                Ürün bulunamadı
                            </div>
                        ) : (
                            filteredItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelectItem(item)}
                                    className={`w-full text-left p-4 border-b border-slate-50 hover:bg-indigo-50/30 transition-colors flex flex-col gap-1 ${selectedItem?.id === item.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
                                >
                                    <div className="font-bold text-sm truncate">{item.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono truncate">{item.id}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-bold text-indigo-600">{item.price} TL</span>
                                        {item.isAvailable ? (
                                            <span className="text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded uppercase">Aktif</span>
                                        ) : (
                                            <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded uppercase">Pasif</span>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Middle: Edit Form */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h2 className="font-bold flex items-center gap-2 text-slate-700">
                            <FaCogs className="text-indigo-500" /> Ürün Seçenekleri
                        </h2>
                        {selectedItem && (
                            <span className="text-[10px] bg-slate-200 px-2 py-1 rounded font-mono text-slate-600">ID: {selectedItem.id}</span>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {!editData ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50">
                                <FaDatabase className="text-5xl" />
                                <p>Düzenlemek için soldan bir ürün seçin</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Temel Bilgiler</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Ürün Adı</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                value={editData.name || ''}
                                                onChange={(e) => updateField('name', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Fiyat</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                                                value={editData.price || 0}
                                                onChange={(e) => updateField('price', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Sıralama</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                                                value={editData.order || editData.displayOrder || 0}
                                                onChange={(e) => updateField('order', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Açıklama</label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-20"
                                            value={editData.description || ''}
                                            onChange={(e) => updateField('description', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                                checked={editData.isAvailable !== false}
                                                onChange={(e) => updateField('isAvailable', e.target.checked)}
                                            />
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Satışta Aktif</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                                checked={!!editData.isPopular}
                                                onChange={(e) => updateField('isPopular', e.target.checked)}
                                            />
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Popüler Ürün</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Media & Details */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Görsel ve Detaylar</h3>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Görsel URL</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                                            value={editData.imageUrl || editData.image || ''}
                                            onChange={(e) => updateField('imageUrl', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1"><FaClock className="text-[10px]" /> Hazırlanma (dk)</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                                                value={editData.preparationTime || ''}
                                                onChange={(e) => updateField('preparationTime', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1"><FaFire className="text-[10px]" /> Kalori</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                                                value={editData.calories || ''}
                                                onChange={(e) => updateField('calories', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Fields */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Gelişmiş Alanlar (JSON Editor)</h3>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1"><FaGlobe className="text-[10px]" /> Çeviriler (Translations)</label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs h-24 font-mono bg-slate-50"
                                            value={JSON.stringify(editData.translations || {}, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    updateField('translations', JSON.parse(e.target.value));
                                                } catch (err) { }
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1"><FaList className="text-[10px]" /> Varyasyonlar (JSON)</label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs h-24 font-mono bg-slate-50"
                                            value={JSON.stringify(editData.variations || [], null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    updateField('variations', JSON.parse(e.target.value));
                                                } catch (err) { }
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1"><FaTag className="text-[10px]" /> İndirimli Fiyat</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="number"
                                                placeholder="İndirimli Fiyat"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                                                value={editData.discountedPrice || ''}
                                                onChange={(e) => updateField('discountedPrice', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                placeholder="İndirim %"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                                                value={editData.discountPercentage || ''}
                                                onChange={(e) => updateField('discountPercentage', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Debug Logs */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800">
                    <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
                        <h2 className="font-bold text-slate-200 flex items-center gap-2">
                            <FaBug className="text-amber-500" /> Detaylı Loglar
                        </h2>
                        <button
                            onClick={() => setDebugLogs([])}
                            className="text-[10px] text-slate-400 hover:text-white transition-colors uppercase font-bold tracking-tight"
                        >
                            Temizle
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {debugLogs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
                                <FaCogs className="text-5xl" />
                                <p className="text-sm">Log yok. İşlem yapıldığında burada görünecek.</p>
                            </div>
                        ) : (
                            debugLogs.map(log => (
                                <div key={log.id} className={`rounded-lg border overflow-hidden ${log.type === 'error' ? 'border-red-900 bg-red-950/20' :
                                    log.type === 'success' ? 'border-emerald-900 bg-emerald-950/20' :
                                        log.type === 'warning' ? 'border-amber-900 bg-amber-950/20' :
                                            'border-slate-800 bg-slate-800/30'
                                    }`}>
                                    <div className="px-3 py-2 flex items-center justify-between border-b border-white/5">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${log.type === 'error' ? 'text-red-400' :
                                            log.type === 'success' ? 'text-emerald-400' :
                                                log.type === 'warning' ? 'text-amber-400' :
                                                    'text-indigo-400'
                                            }`}>{log.title}</span>
                                        <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                                    </div>
                                    <div className="p-3">
                                        <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto max-h-[200px] scrollbar-thin scrollbar-thumb-slate-700">
                                            {JSON.stringify(log.data, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
