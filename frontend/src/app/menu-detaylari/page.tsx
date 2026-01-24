'use client';

import React, { useEffect, useState } from 'react';
import useRestaurantStore from '@/store/useRestaurantStore';
import { FaGlobe, FaLanguage, FaUtensils, FaMagic, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { translateWithDeepL } from '@/lib/deepl';

export default function MenuDetailsPage() {
    const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';
    const { menuItems, fetchRestaurantMenu, updateMenuItem, loading } = useRestaurantStore();
    const [items, setItems] = useState<any[]>([]);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationProgress, setTranslationProgress] = useState(0);
    const [translationStatus, setTranslationStatus] = useState('');
    const [translatingId, setTranslatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRestaurantMenu(KROREN_RESTAURANT_ID);
    }, [fetchRestaurantMenu]);

    useEffect(() => {
        if (menuItems.length > 0) {
            setItems(menuItems.filter((i: any) => i.restaurantId === KROREN_RESTAURANT_ID));
        }
    }, [menuItems]);

    const translateSingleItem = async (item: any) => {
        try {
            setTranslatingId(item.id);

            // Temiz isim al (suffix varsa temizle)
            let baseName = item.name;
            if (baseName.includes(' - ')) baseName = baseName.split(' - ')[0];

            const baseDesc = item.description && item.description !== 'Açıklama yok' ? item.description : '';

            // DeepL ile çeviriler
            const zhName = await translateWithDeepL({ text: baseName, targetLanguage: 'zh' });
            const enName = await translateWithDeepL({ text: baseName, targetLanguage: 'en' });

            const zhDesc = baseDesc ? await translateWithDeepL({ text: baseDesc, targetLanguage: 'zh' }) : '';
            const enDesc = baseDesc ? await translateWithDeepL({ text: baseDesc, targetLanguage: 'en' }) : '';

            // İstenen formatlar:
            // Türkçesi: Türkçe - Çinçe
            // İngilizcesi: İngilizce - Çince
            // Çincesi: Çince
            const trNameFinal = `${baseName} - ${zhName}`;
            const enNameFinal = `${enName} - ${zhName}`;
            const zhNameFinal = zhName;

            const payload = {
                ...item,
                name: trNameFinal,
                translations: {
                    ...(item.translations || {}),
                    tr: { name: trNameFinal, description: baseDesc },
                    en: { name: enNameFinal, description: enDesc },
                    zh: { name: zhNameFinal, description: zhDesc }
                }
            };

            await updateMenuItem(KROREN_RESTAURANT_ID, item.id, payload);
            return true;
        } catch (error) {
            console.error('Translation error:', error);
            return false;
        } finally {
            setTranslatingId(null);
        }
    };

    const handleTranslateItem = async (item: any) => {
        const success = await translateSingleItem(item);
        if (success) {
            fetchRestaurantMenu(KROREN_RESTAURANT_ID);
        } else {
            alert('Tercüme sırasında bir hata oluştu.');
        }
    };

    const handleTranslateAll = async () => {
        if (!confirm('Tüm menüyü DeepL ile tercüme etmek istediğinizden emin misiniz? Bu işlem biraz zaman alabilir.')) return;

        setIsTranslating(true);
        setTranslationProgress(0);
        const totalItems = items.length;

        try {
            for (let i = 0; i < totalItems; i++) {
                const item = items[i];
                setTranslationStatus(`${item.name} çevriliyor... (${i + 1}/${totalItems})`);

                await translateSingleItem(item);

                setTranslationProgress(Math.round(((i + 1) / totalItems) * 100));
            }
            setTranslationStatus('Tüm çeviriler başarıyla tamamlandı!');
            setTimeout(() => {
                setIsTranslating(false);
                fetchRestaurantMenu(KROREN_RESTAURANT_ID);
            }, 2000);
        } catch (error) {
            console.error('Translation error:', error);
            setTranslationStatus('Bir hata oluştu. Lütfen tekrar deneyin.');
            setIsTranslating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-medium animate-pulse">Menü Detayları Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-900 flex items-center gap-3">
                            <FaUtensils className="text-indigo-600" />
                            Kroren Menü Detay Listesi
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Tüm dillerdeki isim ve açıklamaların toplu görünümü</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <button
                            onClick={handleTranslateAll}
                            disabled={isTranslating}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg ${isTranslating
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-105 hover:shadow-indigo-200'
                                }`}
                        >
                            {isTranslating ? (
                                <FaSpinner className="animate-spin" />
                            ) : (
                                <FaMagic />
                            )}
                            DeepL ile Tümünü Çevir
                        </button>
                        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                            <FaGlobe className="text-indigo-600" />
                            <span className="text-sm font-bold text-indigo-800">{items.length} Ürün Mevcut</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar Overlay */}
            {isTranslating && (
                <div className="fixed bottom-8 right-8 z-50 animate-bounce-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 flex items-center gap-4 min-w-[320px]">
                        <div className="relative flex-shrink-0">
                            <svg className="w-12 h-12 transform -rotate-90">
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    className="text-slate-100"
                                />
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    strokeDasharray={125.6}
                                    strokeDashoffset={125.6 - (125.6 * translationProgress) / 100}
                                    className="text-indigo-600 transition-all duration-500"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                %{translationProgress}
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                {translationProgress === 100 ? (
                                    <FaCheckCircle className="text-green-500" />
                                ) : (
                                    <FaSpinner className="animate-spin text-indigo-600" />
                                )}
                                Menü Tercüme Ediliyor
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                                {translationStatus}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 hover:border-indigo-200 transition-all group"
                        >
                            <div className="p-6 md:p-8">
                                {/* Item Index & Base Name */}
                                <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-4">
                                    <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-indigo-100 shadow-lg">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-wide">
                                            {item.name}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                                ID: {item.id.slice(0, 8)}
                                            </span>
                                            <button
                                                onClick={() => handleTranslateItem(item)}
                                                disabled={translatingId !== null || isTranslating}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${translatingId === item.id
                                                    ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed'
                                                    : 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                                                    }`}
                                            >
                                                {translatingId === item.id ? (
                                                    <FaSpinner className="animate-spin" />
                                                ) : (
                                                    <FaMagic className="text-[10px]" />
                                                )}
                                                DeepL ile Çevir
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-indigo-900 drop-shadow-sm">
                                        {item.price} <span className="text-sm font-bold">₺</span>
                                    </div>
                                </div>

                                {/* language Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Turkish */}
                                    <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-2 text-indigo-700">
                                            <FaLanguage className="text-xl" />
                                            <h3 className="font-black text-xs uppercase tracking-widest">Türkçe</h3>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 leading-tight">
                                                {item.translations?.tr?.name || item.name}
                                            </h4>
                                            <p className="text-sm text-slate-600 mt-2 leading-relaxed italic">
                                                {item.translations?.tr?.description || item.description || 'Açıklama yok'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* English */}
                                    <div className="space-y-3 p-5 rounded-2xl bg-indigo-50/30 border border-indigo-50 hover:bg-white hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <FaLanguage className="text-xl" />
                                            <h3 className="font-black text-xs uppercase tracking-widest">English</h3>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 leading-tight">
                                                {item.translations?.en?.name || '---'}
                                            </h4>
                                            <p className="text-sm text-slate-600 mt-2 leading-relaxed italic">
                                                {item.translations?.en?.description || '---'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Chinese */}
                                    <div className="space-y-3 p-5 rounded-2xl bg-red-50/30 border border-red-50 hover:bg-white hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-2 text-red-600">
                                            <FaLanguage className="text-xl" />
                                            <h3 className="font-black text-xs uppercase tracking-widest">Çince (中文)</h3>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900 leading-tight">
                                                {item.translations?.zh?.name || '---'}
                                            </h4>
                                            <p className="text-sm text-slate-600 mt-2 leading-relaxed italic">
                                                {item.translations?.zh?.description || '---'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        :root {
          font-family: 'Outfit', sans-serif;
        }
      `}</style>
        </div>
    );
}
